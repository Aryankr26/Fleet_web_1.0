from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, List

import httpx

from app.settings import Settings
from app.redis_client import RedisClient
from app.telemetry import normalize
from app.db import insert_telemetry

logger = logging.getLogger(__name__)


MILLITRACK_URL = "https://mvts1.millitrack.com/api/middleMan/getDeviceInfo?accessToken={token}"


async def fetch_devices(client: httpx.AsyncClient, token: str) -> List[Dict[str, Any]]:
    url = MILLITRACK_URL.format(token=token)
    resp = await client.get(url, timeout=20)
    resp.raise_for_status()
    data = resp.json()

    # Vendor response shape is uncertain. Common patterns:
    # - { data: [...] }
    # - { result: [...] }
    # - [ ... ]
    if isinstance(data, list):
        return [d for d in data if isinstance(d, dict)]
    if isinstance(data, dict):
        inner = data.get("data") or data.get("result") or data.get("devices") or data.get("deviceList")
        if isinstance(inner, list):
            return [d for d in inner if isinstance(d, dict)]
    return []


async def poll_forever(settings: Settings, redis: RedisClient, stop_event: asyncio.Event) -> None:
    if not settings.MILLITRACK_TOKEN:
        logger.warning("poller_disabled_empty_MILLITRACK_TOKEN")
        return

    interval = settings.enforced_poll_interval
    logger.info("poller_start", extra={"interval": interval})

    backoff = 1.0
    async with httpx.AsyncClient(headers={"Accept": "application/json"}) as client:
        while not stop_event.is_set():
            started = asyncio.get_event_loop().time()
            try:
                devices = await fetch_devices(client, settings.MILLITRACK_TOKEN)
                published = 0
                for d in devices:
                    rec = normalize(d)
                    # Publish compact JSON with required keys, plus fuel if present.
                    msg = {
                        "imei": rec.get("imei"),
                        "lat": rec.get("lat"),
                        "lon": rec.get("lon"),
                        "speed": rec.get("speed"),
                        "ignition": rec.get("ignition"),
                        "timestamp": rec.get("timestamp"),
                        "raw": rec.get("raw"),
                    }
                    if "fuel" in rec:
                        msg["fuel"] = rec["fuel"]

                    await redis.publish_json("telemetry", msg)
                    published += 1

                    # Best-effort DB insert
                    await insert_telemetry(rec)

                logger.info("poll_ok", extra={"count": len(devices), "published": published})
                backoff = 1.0
            except Exception:
                logger.exception("poll_failed")
                # Exponential backoff capped at 60s.
                await asyncio.sleep(min(backoff, 60.0))
                backoff = min(backoff * 2.0, 60.0)

            # Enforce minimum 10s poll interval (hard floor) regardless of errors.
            elapsed = asyncio.get_event_loop().time() - started
            sleep_s = max(float(interval) - elapsed, 0.0)
            try:
                await asyncio.wait_for(stop_event.wait(), timeout=sleep_s)
            except asyncio.TimeoutError:
                pass

    logger.info("poller_stop")
