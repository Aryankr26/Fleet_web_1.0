from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException

from app.db_sqlite import SqliteStore
from app.security import JwtConfig, decode_token
from app.settings import settings

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


def get_store() -> SqliteStore:
    return settings.get_store()


def get_jwt() -> JwtConfig:
    return settings.get_jwt_config()


def require_user(authorization: Optional[str] = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="missing_token")
    token = authorization.split(" ", 1)[1].strip()
    payload = decode_token(get_jwt(), token)
    if not payload:
        raise HTTPException(status_code=401, detail="invalid_token")
    return payload


@router.get("", response_model=list[dict])
async def list_vehicles(store: SqliteStore = Depends(get_store), _: dict = Depends(require_user)):
    rows = store.list_vehicles()
    # Normalize booleans
    for r in rows:
        if r.get("last_ignition") is not None:
            r["last_ignition"] = bool(r["last_ignition"])
    return rows
