from __future__ import annotations

import asyncio
import logging
import json
import random
import time
from typing import Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware

from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST

import socketio

from app.settings import settings, configure_logging
from app.settings import get_allowed_origins
from app.redis_client import RedisClient
from app.poller import poll_forever
from app.db import connect_db, close_db
from app.api.endpoints import router as api_router
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.geofences import router as geofences_router
from app.api.vehicles import router as vehicles_router

logger = logging.getLogger(__name__)


telemetry_published = Counter("telemetry_published_total", "Total telemetry messages published to clients")
ws_clients = Counter("ws_clients_total", "Total websocket clients connected")


sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")


class WsHub:
    def __init__(self):
        self._clients: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def add(self, ws: WebSocket) -> None:
        async with self._lock:
            self._clients.add(ws)

    async def remove(self, ws: WebSocket) -> None:
        async with self._lock:
            self._clients.discard(ws)

    async def broadcast_text(self, text: str) -> None:
        async with self._lock:
            clients = list(self._clients)
        if not clients:
            return
        for ws in clients:
            try:
                await ws.send_text(text)
            except Exception:
                pass


hub = WsHub()


fastapi_app = FastAPI(title="fleet-backend", version="0.1.0")

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"],
)

fastapi_app.include_router(api_router)
fastapi_app.include_router(auth_router)
fastapi_app.include_router(users_router)
fastapi_app.include_router(geofences_router)
fastapi_app.include_router(vehicles_router)


@fastapi_app.get("/metrics")
async def metrics():
    return PlainTextResponse(generate_latest().decode("utf-8"), media_type=CONTENT_TYPE_LATEST)


@fastapi_app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    ws_clients.inc()
    await hub.add(ws)
    try:
        while True:
            # Keep connection alive; client can send pings.
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        await hub.remove(ws)


@sio.event
async def connect(sid, environ):
    logger.info("socketio_connect", extra={"sid": sid})


@sio.event
async def disconnect(sid):
    logger.info("socketio_disconnect", extra={"sid": sid})


app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app, socketio_path="socket.io")


@fastapi_app.on_event("startup")
async def on_startup():
    configure_logging(settings.LOG_LEVEL)

    fastapi_app.state.redis = None
    if bool(getattr(settings, "REDIS_ENABLED", False)) and settings.REDIS_URL:
        try:
            redis = RedisClient(settings.REDIS_URL)
            await redis.connect()
            fastapi_app.state.redis = redis
        except Exception:
            logger.exception("redis_unavailable_running_without_redis")

    await connect_db(settings.DATABASE_URL)

    fastapi_app.state.stop_event = asyncio.Event()

    fastapi_app.state.poller_task = None
    fastapi_app.state.relay_task = None
    fastapi_app.state.sim_task = None

    # Poller task (runs only when token is set AND Redis is available)
    if fastapi_app.state.redis is not None:
        fastapi_app.state.poller_task = asyncio.create_task(
            poll_forever(settings, fastapi_app.state.redis, fastapi_app.state.stop_event)
        )

        # Redis -> websocket relay task
        fastapi_app.state.relay_task = asyncio.create_task(_relay_telemetry())

    # Demo stream (so UI isn't blank) when no token
    if (not settings.MILLITRACK_TOKEN) and bool(settings.SIMULATE_ON_STARTUP):
        fastapi_app.state.sim_task = asyncio.create_task(_simulate_stream())

    logger.info("startup_complete")


@fastapi_app.on_event("shutdown")
async def on_shutdown():
    fastapi_app.state.stop_event.set()

    for task_name in ("poller_task", "relay_task", "sim_task"):
        t = getattr(fastapi_app.state, task_name, None)
        if t:
            t.cancel()

    await close_db()

    if getattr(fastapi_app.state, "redis", None):
        await fastapi_app.state.redis.close()

    logger.info("shutdown_complete")


async def _relay_telemetry() -> None:
    """Subscribe to Redis channel 'telemetry' and broadcast to:
    - Socket.IO event 'vehicle_update'
    - Plain WebSocket clients on /ws
    """

    redis: RedisClient = fastapi_app.state.redis
    pubsub = await redis.pubsub()
    await pubsub.subscribe("telemetry")

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

            telemetry_published.inc()

            # Socket.IO broadcast
            try:
                await sio.emit("vehicle_update", data)
            except Exception:
                logger.exception("socketio_emit_failed")

            # Plain websocket broadcast
            await hub.broadcast_text(data)

    except asyncio.CancelledError:
        raise
    finally:
        await pubsub.unsubscribe("telemetry")
        await pubsub.close()


async def _broadcast_payload(payload: dict) -> None:
    text = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))

    # Persist last-known vehicle state for list views.
    try:
        settings.get_store().upsert_vehicle_telemetry(payload)
    except Exception:
        logger.exception("sqlite_upsert_vehicle_failed")

    telemetry_published.inc()

    try:
        await sio.emit("vehicle_update", text)
    except Exception:
        logger.exception("socketio_emit_failed")

    await hub.broadcast_text(text)


async def _simulate_stream() -> None:
    """Publish demo telemetry directly to connected clients.

    This keeps the frontend map populated even when Redis isn't running and
    MILLITRACK_TOKEN is not configured.
    """

    vehicle_ids = [
        "HR55AN2175",
        "MP04CE7712",
        "HR55AM8082",
        "UP14DT9921",
        "MH43DF2003",
        "MP19KA6604",
        "MH01AX9920",
    ]

    # Seed around New Delhi
    positions = {
        vid: (28.6139 + random.uniform(-0.05, 0.05), 77.209 + random.uniform(-0.05, 0.05))
        for vid in vehicle_ids
    }
    fuels = {vid: 100.0 for vid in vehicle_ids}

    logger.info("simulate_start", extra={"count": len(vehicle_ids), "interval": settings.enforced_poll_interval})

    while not fastapi_app.state.stop_event.is_set():
        now = int(time.time() * 1000)
        for vid in vehicle_ids:
            lat, lon = positions[vid]
            lat += random.uniform(-0.0010, 0.0010)
            lon += random.uniform(-0.0010, 0.0010)
            positions[vid] = (lat, lon)

            fuels[vid] -= random.uniform(0.0, 0.3)
            if random.random() < 0.02:
                fuels[vid] -= random.uniform(10.5, 15.0)
            fuels[vid] = max(fuels[vid], 0.0)

            payload = {
                "imei": vid,
                "lat": lat,
                "lon": lon,
                "speed": round(random.uniform(0, 65), 1),
                "ignition": random.random() > 0.1,
                "fuel": round(fuels[vid], 2),
                "timestamp": now,
                "raw": {"source": "simulate"},
            }
            await _broadcast_payload(payload)

        try:
            await asyncio.wait_for(fastapi_app.state.stop_event.wait(), timeout=float(settings.enforced_poll_interval))
        except asyncio.TimeoutError:
            pass
