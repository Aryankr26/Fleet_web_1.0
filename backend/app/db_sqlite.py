from __future__ import annotations

import os
import sqlite3
import threading
import time
from typing import Any, Dict, List, Optional, Tuple

_DB_LOCK = threading.Lock()


def _utc_ms() -> int:
    return int(time.time() * 1000)


def _dict_factory(cursor: sqlite3.Cursor, row: Tuple[Any, ...]) -> Dict[str, Any]:
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}


class SqliteStore:
    def __init__(self, path: str):
        self._path = path
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self._conn = sqlite3.connect(path, check_same_thread=False)
        self._conn.row_factory = _dict_factory
        self._conn.execute("PRAGMA journal_mode=WAL")
        self._conn.execute("PRAGMA foreign_keys=ON")

    def close(self) -> None:
        with _DB_LOCK:
            self._conn.close()

    def init_schema(self) -> None:
        with _DB_LOCK:
            cur = self._conn.cursor()
            cur.executescript(
                """
                CREATE TABLE IF NOT EXISTS users (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  username TEXT NOT NULL UNIQUE,
                  email TEXT,
                  password_hash TEXT NOT NULL,
                  role TEXT NOT NULL,
                  status TEXT NOT NULL DEFAULT 'active',
                  created_at_ms INTEGER NOT NULL,
                  last_login_ms INTEGER
                );

                CREATE TABLE IF NOT EXISTS vehicles (
                  imei TEXT PRIMARY KEY,
                  label TEXT,
                  last_lat REAL,
                  last_lon REAL,
                  last_speed REAL,
                  last_ignition INTEGER,
                  last_fuel REAL,
                  last_seen_ms INTEGER
                );

                CREATE TABLE IF NOT EXISTS geofences (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  category TEXT,
                  type TEXT NOT NULL,
                  center_lat REAL,
                  center_lon REAL,
                  radius_m REAL,
                  polygon_json TEXT,
                  active INTEGER NOT NULL DEFAULT 1,
                  start_time TEXT,
                  end_time TEXT,
                  assigned_user_id INTEGER,
                  created_by_user_id INTEGER,
                  created_at_ms INTEGER NOT NULL,
                  FOREIGN KEY(assigned_user_id) REFERENCES users(id) ON DELETE SET NULL,
                  FOREIGN KEY(created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
                );

                CREATE TABLE IF NOT EXISTS geofence_events (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  imei TEXT NOT NULL,
                  geofence_id INTEGER NOT NULL,
                  event_type TEXT NOT NULL,
                  ts_ms INTEGER NOT NULL,
                  lat REAL,
                  lon REAL,
                  FOREIGN KEY(imei) REFERENCES vehicles(imei) ON DELETE CASCADE,
                  FOREIGN KEY(geofence_id) REFERENCES geofences(id) ON DELETE CASCADE
                );
                """
            )
            self._conn.commit()

    # -------------------- Users --------------------
    def user_count(self) -> int:
        with _DB_LOCK:
            row = self._conn.execute("SELECT COUNT(*) AS c FROM users").fetchone()
            return int(row["c"]) if row else 0

    def create_user(self, username: str, email: Optional[str], password_hash: str, role: str) -> Dict[str, Any]:
        now = _utc_ms()
        with _DB_LOCK:
            cur = self._conn.execute(
                "INSERT INTO users (username,email,password_hash,role,status,created_at_ms) VALUES (?,?,?,?, 'active', ?)",
                (username, email, password_hash, role, now),
            )
            self._conn.commit()
            return self.get_user_by_id(int(cur.lastrowid))

    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        with _DB_LOCK:
            return self._conn.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()

    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        with _DB_LOCK:
            return self._conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()

    def list_users(self) -> List[Dict[str, Any]]:
        with _DB_LOCK:
            return list(self._conn.execute("SELECT * FROM users ORDER BY id ASC").fetchall())

    def delete_user(self, user_id: int) -> None:
        with _DB_LOCK:
            self._conn.execute("DELETE FROM users WHERE id=?", (user_id,))
            self._conn.commit()

    def update_user_status_role(self, user_id: int, status: Optional[str], role: Optional[str]) -> Optional[Dict[str, Any]]:
        updates: List[str] = []
        params: List[Any] = []
        if status is not None:
            updates.append("status=?")
            params.append(status)
        if role is not None:
            updates.append("role=?")
            params.append(role)
        if not updates:
            return self.get_user_by_id(user_id)
        params.append(user_id)
        with _DB_LOCK:
            self._conn.execute(f"UPDATE users SET {', '.join(updates)} WHERE id=?", tuple(params))
            self._conn.commit()
            return self.get_user_by_id(user_id)

    def set_user_password_hash(self, user_id: int, password_hash: str) -> Optional[Dict[str, Any]]:
        with _DB_LOCK:
            self._conn.execute("UPDATE users SET password_hash=? WHERE id=?", (password_hash, user_id))
            self._conn.commit()
            return self.get_user_by_id(user_id)

    def set_user_password_hash_by_username(self, username: str, password_hash: str) -> Optional[Dict[str, Any]]:
        with _DB_LOCK:
            self._conn.execute("UPDATE users SET password_hash=? WHERE username=?", (password_hash, username))
            self._conn.commit()
            return self.get_user_by_username(username)

    def set_last_login(self, user_id: int) -> None:
        with _DB_LOCK:
            self._conn.execute("UPDATE users SET last_login_ms=? WHERE id=?", (_utc_ms(), user_id))
            self._conn.commit()

    # -------------------- Vehicles --------------------
    def upsert_vehicle_telemetry(self, payload: Dict[str, Any]) -> None:
        imei = str(payload.get("imei") or "")
        if not imei:
            return
        lat = payload.get("lat")
        lon = payload.get("lon")
        speed = payload.get("speed")
        ignition = payload.get("ignition")
        fuel = payload.get("fuel")
        now = int(payload.get("timestamp") or _utc_ms())

        with _DB_LOCK:
            self._conn.execute(
                """
                INSERT INTO vehicles (imei,label,last_lat,last_lon,last_speed,last_ignition,last_fuel,last_seen_ms)
                VALUES (?,?,?,?,?,?,?,?)
                ON CONFLICT(imei) DO UPDATE SET
                  last_lat=excluded.last_lat,
                  last_lon=excluded.last_lon,
                  last_speed=excluded.last_speed,
                  last_ignition=excluded.last_ignition,
                  last_fuel=excluded.last_fuel,
                  last_seen_ms=excluded.last_seen_ms
                """,
                (
                    imei,
                    payload.get("label"),
                    float(lat) if lat is not None else None,
                    float(lon) if lon is not None else None,
                    float(speed) if speed is not None else None,
                    1 if ignition is True else 0 if ignition is False else None,
                    float(fuel) if fuel is not None else None,
                    now,
                ),
            )
            self._conn.commit()

    def list_vehicles(self) -> List[Dict[str, Any]]:
        with _DB_LOCK:
            return list(self._conn.execute("SELECT * FROM vehicles ORDER BY imei ASC").fetchall())

    # -------------------- Geofences --------------------
    def create_geofence(self, rec: Dict[str, Any]) -> Dict[str, Any]:
        now = _utc_ms()
        with _DB_LOCK:
            cur = self._conn.execute(
                """
                INSERT INTO geofences (
                  name,category,type,center_lat,center_lon,radius_m,polygon_json,active,start_time,end_time,
                  assigned_user_id,created_by_user_id,created_at_ms
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
                """,
                (
                    rec.get("name"),
                    rec.get("category"),
                    rec.get("type"),
                    rec.get("center_lat"),
                    rec.get("center_lon"),
                    rec.get("radius_m"),
                    rec.get("polygon_json"),
                    1 if rec.get("active", True) else 0,
                    rec.get("start_time"),
                    rec.get("end_time"),
                    rec.get("assigned_user_id"),
                    rec.get("created_by_user_id"),
                    now,
                ),
            )
            self._conn.commit()
            return self.get_geofence(int(cur.lastrowid))

    def list_geofences(self, active_only: bool = False) -> List[Dict[str, Any]]:
        with _DB_LOCK:
            if active_only:
                return list(self._conn.execute("SELECT * FROM geofences WHERE active=1 ORDER BY id DESC").fetchall())
            return list(self._conn.execute("SELECT * FROM geofences ORDER BY id DESC").fetchall())

    def get_geofence(self, geofence_id: int) -> Optional[Dict[str, Any]]:
        with _DB_LOCK:
            return self._conn.execute("SELECT * FROM geofences WHERE id=?", (geofence_id,)).fetchone()

    def delete_geofence(self, geofence_id: int) -> None:
        with _DB_LOCK:
            self._conn.execute("DELETE FROM geofences WHERE id=?", (geofence_id,))
            self._conn.commit()


def default_store_path() -> str:
    return os.path.join(os.path.dirname(__file__), "..", "data", "app.db")
