from __future__ import annotations

import json
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


try:
    import asyncpg  # type: ignore

    _HAS_ASYNCPG = True
except Exception:  # pragma: no cover
    asyncpg = None
    _HAS_ASYNCPG = False


_pool: Optional[Any] = None


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


async def connect_db(database_url: str) -> None:
    """Connect to Postgres if DATABASE_URL is provided.

    If asyncpg isn't installed (common on Windows without build tools), DB support is disabled.
    """

    global _pool
    if not database_url:
        _pool = None
        return

    if not _HAS_ASYNCPG:
        logger.warning("db_disabled_asyncpg_not_installed")
        _pool = None
        return

    _pool = await asyncpg.create_pool(dsn=database_url, min_size=1, max_size=5)
    await _ensure_schema()


async def close_db() -> None:
    global _pool
    if _pool is None:
        return
    try:
        await _pool.close()
    finally:
        _pool = None


async def _ensure_schema() -> None:
    if _pool is None:
        return
    async with _pool.acquire() as conn:
        await conn.execute(CREATE_TELEMETRY_RAW_SQL)


async def insert_telemetry(rec: dict) -> None:
    """Best-effort insert of raw telemetry.

    No-ops when DB is disabled.
    """

    if _pool is None:
        return

    ts_ms = rec.get("timestamp")
    if ts_ms is None:
        return

    try:
        ts_ms_int = int(ts_ms)
    except Exception:
        return

    raw = rec.get("raw") or {}
    raw_json = json.dumps(raw, ensure_ascii=False, separators=(",", ":"))

    try:
        async with _pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO telemetry_raw(ts, imei, lat, lon, speed, ignition, fuel, raw)
                VALUES (to_timestamp($1 / 1000.0), $2, $3, $4, $5, $6, $7, $8::jsonb)
                """,
                ts_ms_int,
                str(rec.get("imei")),
                rec.get("lat"),
                rec.get("lon"),
                rec.get("speed"),
                rec.get("ignition"),
                rec.get("fuel"),
                raw_json,
            )
    except Exception:
        logger.exception("db_insert_failed")
