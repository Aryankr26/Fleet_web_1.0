from __future__ import annotations

import asyncio
import logging

from app.settings import settings
 
try:
    import asyncpg  # type: ignore

    _HAS_ASYNCPG = True
except Exception:  # pragma: no cover
    asyncpg = None
    _HAS_ASYNCPG = False

logger = logging.getLogger(__name__)


CREATE_TELEMETRY_RAW_SQL = """
CREATE TABLE IF NOT EXISTS telemetry_raw (
  ts TIMESTAMPTZ NOT NULL,
  imei TEXT NOT NULL,
  lat DOUBLE PRECISION NULL,
  lon DOUBLE PRECISION NULL,
  speed DOUBLE PRECISION NULL,
  ignition BOOLEAN NULL,
  fuel DOUBLE PRECISION NULL,
  raw JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS telemetry_raw_imei_ts_idx ON telemetry_raw (imei, ts DESC);
"""


async def migrate() -> None:
    if not settings.DATABASE_URL:
        logger.warning("db_disabled_no_DATABASE_URL")
        return

    if not _HAS_ASYNCPG:
        logger.warning("db_disabled_asyncpg_not_installed")
        return

    pool = await asyncpg.create_pool(dsn=settings.DATABASE_URL, min_size=1, max_size=2)
    try:
        async with pool.acquire() as conn:
            await conn.execute(CREATE_TELEMETRY_RAW_SQL)
    finally:
        await pool.close()


if __name__ == "__main__":
    from app.settings import configure_logging

    configure_logging(settings.LOG_LEVEL)
    asyncio.run(migrate())
