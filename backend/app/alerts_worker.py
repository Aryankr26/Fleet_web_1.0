from __future__ import annotations

import asyncio
import logging
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Deque, Dict, Optional

import json

from app.redis_client import RedisClient
from app.settings import settings, configure_logging

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class TelemetryPoint:
    imei: str
    ts_ms: int
    fuel: float


def detect_fuel_drop_alert(points: Deque[TelemetryPoint], *, threshold: float, window_seconds: int) -> Optional[dict]:
    if len(points) < 2:
        return None

    newest = points[-1]
    window_ms = int(window_seconds) * 1000
    cutoff = newest.ts_ms - window_ms

    oldest_in_window: Optional[TelemetryPoint] = None
    for p in points:
        if p.ts_ms >= cutoff:
            oldest_in_window = p
            break

    if oldest_in_window is None:
        return None

    drop = float(oldest_in_window.fuel) - float(newest.fuel)
    if drop > float(threshold):
        return {
            "type": "fuel_drop",
            "imei": newest.imei,
            "drop": drop,
            "threshold": float(threshold),
            "window_seconds": int(window_seconds),
            "from_fuel": float(oldest_in_window.fuel),
            "to_fuel": float(newest.fuel),
            "timestamp": newest.ts_ms,
        }
    return None


async def run_worker() -> None:
    redis = RedisClient(settings.REDIS_URL)
    await redis.connect()

    pubsub = await redis.pubsub()
    await pubsub.subscribe("telemetry")

    history: Dict[str, Deque[TelemetryPoint]] = defaultdict(lambda: deque(maxlen=5))

    threshold = float(settings.ALERT_FUEL_DROP)
    window_seconds = int(settings.ALERT_WINDOW_SECONDS)

    logger.info("alerts_worker_start", extra={"threshold": threshold, "window_seconds": window_seconds})

    try:
        while True:
            msg = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if not msg:
                await asyncio.sleep(0.05)
                continue

            if msg.get("type") != "message":
                continue

            data = msg.get("data")
            if not isinstance(data, str):
                continue

            try:
                payload = json.loads(data)
            except Exception:
                logger.exception("alerts_bad_json")
                continue

            imei = payload.get("imei")
            ts = payload.get("timestamp")
            fuel = payload.get("fuel")
            if not imei or ts is None or fuel is None:
                continue

            try:
                point = TelemetryPoint(imei=str(imei), ts_ms=int(ts), fuel=float(fuel))
            except Exception:
                continue

            q = history[point.imei]
            q.append(point)

            alert = detect_fuel_drop_alert(q, threshold=threshold, window_seconds=window_seconds)
            if alert:
                await redis.publish_json("alerts", alert)
                logger.warning("alert_emitted", extra=alert)

    finally:
        await pubsub.unsubscribe("telemetry")
        await pubsub.close()
        await redis.close()


if __name__ == "__main__":
    configure_logging(settings.LOG_LEVEL)
    asyncio.run(run_worker())
