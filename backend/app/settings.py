from __future__ import annotations

import logging
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.db_sqlite import SqliteStore, default_store_path
from app.security import JwtConfig


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        env_ignore_empty=False,
    )

    MILLITRACK_TOKEN: str = ""
    REDIS_ENABLED: bool = False
    REDIS_URL: str = "redis://localhost:6379/0"
    DATABASE_URL: str = ""
    POLL_INTERVAL: int = 10
    LOG_LEVEL: str = "info"

    # Auth / API
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_EXPIRES_MINUTES: int = 60 * 24
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Local persistent storage
    SQLITE_PATH: str = default_store_path()

    # When MILLITRACK_TOKEN is empty, optionally publish demo telemetry so the UI isn't blank.
    SIMULATE_ON_STARTUP: bool = True

    ALERT_FUEL_DROP: float = 10.0
    ALERT_WINDOW_SECONDS: int = 120

    @property
    def enforced_poll_interval(self) -> int:
        # Hard safety floor: DO NOT poll faster than 10 seconds.
        return max(int(self.POLL_INTERVAL), 10)


def configure_logging(level: str) -> None:
    lvl = getattr(logging, level.upper(), logging.INFO)

    class JsonFormatter(logging.Formatter):
        def format(self, record: logging.LogRecord) -> str:
            import json
            payload = {
                "level": record.levelname,
                "name": record.name,
                "message": record.getMessage(),
                "time": self.formatTime(record, datefmt="%Y-%m-%dT%H:%M:%S%z"),
            }
            if record.exc_info:
                payload["exc_info"] = self.formatException(record.exc_info)
            return json.dumps(payload, ensure_ascii=False)

    root = logging.getLogger()
    root.handlers.clear()
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    root.addHandler(handler)
    root.setLevel(lvl)


settings = Settings()


_store_singleton: SqliteStore | None = None


def get_allowed_origins() -> list[str]:
    raw = settings.ALLOWED_ORIGINS or ""
    return [o.strip() for o in raw.split(",") if o.strip()]


def _get_store_singleton() -> SqliteStore:
    global _store_singleton
    if _store_singleton is None:
        _store_singleton = SqliteStore(settings.SQLITE_PATH)
        _store_singleton.init_schema()
    return _store_singleton


def _get_jwt_config() -> JwtConfig:
    return JwtConfig(secret_key=settings.JWT_SECRET, expires_minutes=int(settings.JWT_EXPIRES_MINUTES))


# Backwards-friendly helpers for routers
def _settings_get_store(self: Settings) -> SqliteStore:
    return _get_store_singleton()


def _settings_get_jwt_config(self: Settings) -> JwtConfig:
    return _get_jwt_config()


Settings.get_store = _settings_get_store  # type: ignore[attr-defined]
Settings.get_jwt_config = _settings_get_jwt_config  # type: ignore[attr-defined]
