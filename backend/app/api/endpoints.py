from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Query

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/health")
async def health():
    return {"ok": True}


@router.get("/last")
async def last(imei: str = Query(..., min_length=1)):
    # Placeholder endpoint (no DB required). In a real system you would query Redis or Postgres.
    return {"imei": imei, "status": "not_implemented"}
