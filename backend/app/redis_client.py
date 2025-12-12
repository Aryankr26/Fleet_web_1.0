from __future__ import annotations

import logging
import json
from typing import Any, Optional

try:
    from redis import asyncio as redis_asyncio
except Exception:  # pragma: no cover
    redis_asyncio = None

logger = logging.getLogger(__name__)


class RedisClient:
    def __init__(self, url: str):
        self._url = url
        self._redis = None

    async def connect(self) -> None:
        if redis_asyncio is None:
            raise RuntimeError("redis package is not installed")

        self._redis = redis_asyncio.from_url(self._url, decode_responses=True)
        try:
            await self._redis.ping()
        except Exception:
            logger.exception("redis_ping_failed")
            raise

    async def close(self) -> None:
        if self._redis is not None:
            # redis-py asyncio prefers aclose()
            close_fn = getattr(self._redis, "aclose", None)
            if callable(close_fn):
                await close_fn()
            else:  # pragma: no cover
                await self._redis.close()
            self._redis = None

    @property
    def redis(self):
        if self._redis is None:
            raise RuntimeError("Redis not connected")
        return self._redis

    async def publish_json(self, channel: str, payload: Any) -> int:
        data = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        return int(await self.redis.publish(channel, data))

    async def pubsub(self):
        return self.redis.pubsub()
