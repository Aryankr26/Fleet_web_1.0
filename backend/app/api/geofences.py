from __future__ import annotations

import json
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, Field

from app.db_sqlite import SqliteStore
from app.security import JwtConfig, decode_token
from app.settings import settings

router = APIRouter(prefix="/api/geofences", tags=["geofences"])


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


class CreateGeofenceRequest(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    category: Optional[str] = None
    type: str = Field(default="circle")
    center_lat: Optional[float] = None
    center_lon: Optional[float] = None
    radius_m: Optional[float] = None
    polygon: Optional[list[list[float]]] = None
    active: bool = True
    start_time: Optional[str] = None
    end_time: Optional[str] = None


@router.get("", response_model=list[dict])
async def list_geofences(active: bool = Query(default=False), store: SqliteStore = Depends(get_store), _: dict = Depends(require_user)):
    return [
        {
            **g,
            "active": bool(g.get("active")),
            "polygon": json.loads(g["polygon_json"]) if g.get("polygon_json") else None,
        }
        for g in store.list_geofences(active_only=active)
    ]


@router.post("", response_model=dict)
async def create_geofence(req: CreateGeofenceRequest, store: SqliteStore = Depends(get_store), payload: dict = Depends(require_user)):
    t = req.type.lower()
    if t not in ("circle", "polygon"):
        raise HTTPException(status_code=400, detail="invalid_type")

    polygon_json = None
    if t == "polygon":
        if not req.polygon or len(req.polygon) < 3:
            raise HTTPException(status_code=400, detail="polygon_requires_3_points")
        polygon_json = json.dumps(req.polygon, separators=(",", ":"))

    if t == "circle":
        if req.center_lat is None or req.center_lon is None or req.radius_m is None:
            raise HTTPException(status_code=400, detail="circle_requires_center_and_radius")

    created = store.create_geofence(
        {
            "name": req.name,
            "category": req.category,
            "type": t,
            "center_lat": req.center_lat,
            "center_lon": req.center_lon,
            "radius_m": req.radius_m,
            "polygon_json": polygon_json,
            "active": req.active,
            "start_time": req.start_time,
            "end_time": req.end_time,
            "created_by_user_id": int(payload.get("sub")),
        }
    )

    return {
        **created,
        "active": bool(created.get("active")),
        "polygon": json.loads(created["polygon_json"]) if created.get("polygon_json") else None,
    }


@router.delete("/{geofence_id}")
async def delete_geofence(geofence_id: int, store: SqliteStore = Depends(get_store), _: dict = Depends(require_user)):
    existing = store.get_geofence(geofence_id)
    if not existing:
        raise HTTPException(status_code=404, detail="not_found")
    store.delete_geofence(geofence_id)
    return {"ok": True}
