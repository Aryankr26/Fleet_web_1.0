from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, EmailStr, Field

from app.db_sqlite import SqliteStore
from app.security import JwtConfig, decode_token, hash_password
from app.settings import settings

router = APIRouter(prefix="/api/users", tags=["users"])


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


class CreateUserRequest(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    email: Optional[EmailStr] = None
    password: str = Field(min_length=6, max_length=256)
    role: str = Field(default="supervisor")


class PatchUserRequest(BaseModel):
    status: Optional[str] = None
    role: Optional[str] = None


@router.get("", response_model=list[dict])
async def list_users(store: SqliteStore = Depends(get_store), _: dict = Depends(require_owner)):
    return [_public_user(u) for u in store.list_users()]


@router.post("", response_model=dict)
async def create_user(req: CreateUserRequest, store: SqliteStore = Depends(get_store), _: dict = Depends(require_owner)):
    if store.get_user_by_username(req.username):
        raise HTTPException(status_code=409, detail="username_taken")

    role = req.role.lower()
    if role not in ("owner", "supervisor", "operator"):
        raise HTTPException(status_code=400, detail="invalid_role")

    user = store.create_user(
        username=req.username,
        email=str(req.email) if req.email is not None else None,
        password_hash=hash_password(req.password),
        role=role,
    )
    return _public_user(user)


@router.patch("/{user_id}", response_model=dict)
async def patch_user(user_id: int, req: PatchUserRequest, store: SqliteStore = Depends(get_store), _: dict = Depends(require_owner)):
    if req.status is not None and req.status not in ("active", "inactive"):
        raise HTTPException(status_code=400, detail="invalid_status")
    if req.role is not None and req.role.lower() not in ("owner", "supervisor", "operator"):
        raise HTTPException(status_code=400, detail="invalid_role")

    updated = store.update_user_status_role(user_id, req.status, req.role.lower() if req.role else None)
    if not updated:
        raise HTTPException(status_code=404, detail="not_found")
    return _public_user(updated)


@router.delete("/{user_id}")
async def delete_user(user_id: int, store: SqliteStore = Depends(get_store), payload: dict = Depends(require_owner)):
    # Disallow deleting self
    if str(user_id) == str(payload.get("sub")):
        raise HTTPException(status_code=400, detail="cannot_delete_self")

    user = store.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="not_found")

    # Keep at least one owner
    if user.get("role") == "owner":
        owners = [u for u in store.list_users() if u.get("role") == "owner"]
        if len(owners) <= 1:
            raise HTTPException(status_code=400, detail="cannot_delete_last_owner")

    store.delete_user(user_id)
    return {"ok": True}


def _public_user(user: dict) -> dict:
    return {
        "id": user.get("id"),
        "username": user.get("username"),
        "email": user.get("email"),
        "role": user.get("role"),
        "status": user.get("status"),
        "last_login_ms": user.get("last_login_ms"),
    }
