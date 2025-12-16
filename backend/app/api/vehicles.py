from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

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


def require_owner(payload: dict = Depends(require_user)) -> dict:
    if payload.get("role") != "owner":
        raise HTTPException(status_code=403, detail="owner_required")
    return payload


class CreateVehicleRequest(BaseModel):
    imei: str = Field(min_length=1, max_length=64)
    label: Optional[str] = Field(default=None, max_length=128)


class UpdateVehicleRequest(BaseModel):
    label: Optional[str] = Field(default=None, max_length=128)


@router.get("", response_model=list[dict])
async def list_vehicles(store: SqliteStore = Depends(get_store), _: dict = Depends(require_user)):
    rows = store.list_vehicles()
    # Normalize booleans
    for r in rows:
        if r.get("last_ignition") is not None:
            r["last_ignition"] = bool(r["last_ignition"])
    return rows


@router.post("", response_model=dict)
async def create_vehicle(req: CreateVehicleRequest, store: SqliteStore = Depends(get_store), _: dict = Depends(require_owner)):
    # Check if vehicle already exists
    existing = store.get_vehicle(req.imei)
    if existing:
        raise HTTPException(status_code=409, detail="vehicle_already_exists")
    
    vehicle = store.create_vehicle(req.imei, req.label)
    if vehicle.get("last_ignition") is not None:
        vehicle["last_ignition"] = bool(vehicle["last_ignition"])
    return vehicle


@router.patch("/{imei}", response_model=dict)
async def update_vehicle(imei: str, req: UpdateVehicleRequest, store: SqliteStore = Depends(get_store), _: dict = Depends(require_owner)):
    existing = store.get_vehicle(imei)
    if not existing:
        raise HTTPException(status_code=404, detail="vehicle_not_found")
    
    updated = store.update_vehicle(imei, req.label)
    if updated and updated.get("last_ignition") is not None:
        updated["last_ignition"] = bool(updated["last_ignition"])
    return updated


@router.delete("/{imei}")
async def delete_vehicle(imei: str, store: SqliteStore = Depends(get_store), _: dict = Depends(require_owner)):
    existing = store.get_vehicle(imei)
    if not existing:
        raise HTTPException(status_code=404, detail="vehicle_not_found")
    
    store.delete_vehicle(imei)
    return {"ok": True}
