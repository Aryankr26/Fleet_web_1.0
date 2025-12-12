from __future__ import annotations

import asyncio
import logging
import random
import time

from app.redis_client import RedisClient
from app.settings import settings, configure_logging

logger = logging.getLogger(__name__)


async def main() -> None:
    redis = RedisClient(settings.REDIS_URL)
    await redis.connect()

    imeis = ["868686868686861", "868686868686862", "868686868686863"]

    # Seed around New Delhi
    positions = {imei: (28.6139 + random.uniform(-0.03, 0.03), 77.209 + random.uniform(-0.03, 0.03)) for imei in imeis}
    fuels = {imei: 100.0 for imei in imeis}

    logger.info("simulate_start", extra={"count": len(imeis)})

    while True:
        now = int(time.time() * 1000)
        for imei in imeis:
            lat, lon = positions[imei]
            lat += random.uniform(-0.0008, 0.0008)
            lon += random.uniform(-0.0008, 0.0008)
            positions[imei] = (lat, lon)

            # Fuel slowly decreases; occasionally big drop to trigger alert.
            fuels[imei] -= random.uniform(0.0, 0.3)
            if random.random() < 0.02:
                fuels[imei] -= random.uniform(10.5, 15.0)
            fuels[imei] = max(fuels[imei], 0.0)

            payload = {
                "imei": imei,
                "lat": lat,
                "lon": lon,
                "speed": round(random.uniform(0, 65), 1),
                "ignition": random.random() > 0.1,
                "fuel": round(fuels[imei], 2),
                "timestamp": now,
                "raw": {"source": "simulate"},
            }
            await redis.publish_json("telemetry", payload)

        await asyncio.sleep(float(settings.enforced_poll_interval))


if __name__ == "__main__":
    configure_logging(settings.LOG_LEVEL)
    asyncio.run(main())
