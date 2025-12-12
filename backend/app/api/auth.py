from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field

from app.db_sqlite import SqliteStore
from app.security import JwtConfig, create_access_token, hash_password, verify_password
from app.settings import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


def get_store() -> SqliteStore:
    return settings.get_store()


def get_jwt() -> JwtConfig:
    return settings.get_jwt_config()


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    email: Optional[EmailStr] = None
    password: str = Field(min_length=6, max_length=256)


class LoginRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/register", response_model=AuthResponse)
async def register(req: RegisterRequest, store: SqliteStore = Depends(get_store)):
    # First user can self-register as owner. After that, use /api/users (owner-only) to create users.
    if store.user_count() > 0:
        raise HTTPException(status_code=403, detail="registration_disabled_use_owner")

    if store.get_user_by_username(req.username):
        raise HTTPException(status_code=409, detail="username_taken")

    user = store.create_user(
        username=req.username,
        email=str(req.email) if req.email is not None else None,
        password_hash=hash_password(req.password),
        role="owner",
    )

    token = create_access_token(get_jwt(), subject=str(user["id"]), claims={"role": user["role"], "username": user["username"]})
    return {"access_token": token, "user": _public_user(user)}


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest, store: SqliteStore = Depends(get_store)):
    user = store.get_user_by_username(req.username)
    if not user:
        raise HTTPException(status_code=401, detail="invalid_credentials")
    if user.get("status") != "active":
        raise HTTPException(status_code=403, detail="user_inactive")
    if not verify_password(req.password, user.get("password_hash") or ""):
        raise HTTPException(status_code=401, detail="invalid_credentials")

    store.set_last_login(int(user["id"]))

    token = create_access_token(get_jwt(), subject=str(user["id"]), claims={"role": user["role"], "username": user["username"]})
    return {"access_token": token, "user": _public_user(user)}


def _public_user(user: dict) -> dict:
    return {
        "id": user.get("id"),
        "username": user.get("username"),
        "email": user.get("email"),
        "role": user.get("role"),
        "status": user.get("status"),
        "last_login_ms": user.get("last_login_ms"),
    }
