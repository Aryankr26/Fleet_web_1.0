from __future__ import annotations

import base64
import hashlib
import hmac
import os
import time
from dataclasses import dataclass
from typing import Any, Dict, Optional

import jwt


def _b64pad(s: str) -> str:
    # urlsafe_b64decode requires correct '=' padding to a multiple of 4.
    return s + ("=" * ((4 - (len(s) % 4)) % 4))


def hash_password(password: str) -> str:
    if not isinstance(password, str) or not password:
        raise ValueError("password_required")

    salt = os.urandom(16)
    iterations = 200_000
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return "pbkdf2_sha256$%d$%s$%s" % (
        iterations,
        base64.urlsafe_b64encode(salt).decode("ascii").rstrip("="),
        base64.urlsafe_b64encode(dk).decode("ascii").rstrip("="),
    )


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iters_s, salt_b64, dk_b64 = stored.split("$", 3)
        if algo != "pbkdf2_sha256":
            return False
        iterations = int(iters_s)
        salt = base64.urlsafe_b64decode(_b64pad(salt_b64))
        expected = base64.urlsafe_b64decode(_b64pad(dk_b64))
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


@dataclass
class JwtConfig:
    secret_key: str
    issuer: str = "fleet-backend"
    audience: str = "fleet-frontend"
    expires_minutes: int = 60 * 24


def create_access_token(cfg: JwtConfig, subject: str, claims: Dict[str, Any]) -> str:
    now = int(time.time())
    payload: Dict[str, Any] = {
        "iss": cfg.issuer,
        "aud": cfg.audience,
        "sub": subject,
        "iat": now,
        "exp": now + int(cfg.expires_minutes) * 60,
        **claims,
    }
    return jwt.encode(payload, cfg.secret_key, algorithm="HS256")


def decode_token(cfg: JwtConfig, token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(token, cfg.secret_key, algorithms=["HS256"], audience=cfg.audience, issuer=cfg.issuer)
    except Exception:
        return None
