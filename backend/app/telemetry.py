from __future__ import annotations

import time
import json
from typing import Any, Dict, Optional


def _pick(d: Dict[str, Any], *keys: str) -> Optional[Any]:
    for k in keys:
        if k in d and d[k] is not None:
            return d[k]
    return None


def _to_float(v: Any) -> Optional[float]:
    if v is None:
        return None
    try:
        return float(v)
    except Exception:
        return None


def _to_bool(v: Any) -> Optional[bool]:
    if v is None:
        return None
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float)):
        return bool(int(v))
    if isinstance(v, str):
        s = v.strip().lower()
        if s in {"1", "true", "on", "yes", "y"}:
            return True
        if s in {"0", "false", "off", "no", "n"}:
            return False
    return None


def normalize(device: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize a single vendor device record into our compact schema.

    Vendor field names are uncertain; we map defensively.

    Returns a dict with keys:
      - imei, lat, lon, speed, ignition, fuel (optional), timestamp, raw, raw_json
    """

    imei = _pick(device, "imei", "deviceUniqueId", "deviceId", "id", "uniqueId")
    if imei is None:
        imei = "unknown"

    lat = _to_float(_pick(device, "lat", "latitude", "Latitude", "gpsLat", "gps_lat"))
    lon = _to_float(_pick(device, "lon", "lng", "longitude", "Longitude", "gpsLon", "gps_lon"))

    speed = _to_float(_pick(device, "speed", "Speed", "spd", "gpsSpeed"))
    ignition = _to_bool(_pick(device, "ignition", "Ignition", "acc", "ACC", "engine", "engineOn"))

    # Fuel is frequently present as percentage or units (vendor-specific).
    fuel = _to_float(_pick(device, "fuel", "Fuel", "fuelLevel", "fuel_level", "fuelPercent", "fuel_percentage"))

    ts = _pick(device, "timestamp", "ts", "deviceTime", "fixTime", "serverTime", "time")
    now_ms = int(time.time() * 1000)
    timestamp_ms: int
    if isinstance(ts, (int, float)):
        timestamp_ms = int(ts)
        if timestamp_ms < 10_000_000_000:  # seconds
            timestamp_ms *= 1000
    elif isinstance(ts, str):
        try:
            import datetime as _dt

            dt = _dt.datetime.fromisoformat(ts.replace("Z", "+00:00"))
            timestamp_ms = int(dt.timestamp() * 1000)
        except Exception:
            timestamp_ms = now_ms
    else:
        timestamp_ms = now_ms

    raw = device
    raw_json = json.dumps(raw, ensure_ascii=False, separators=(",", ":"))

    out: Dict[str, Any] = {
        "imei": str(imei),
        "lat": lat,
        "lon": lon,
        "speed": speed,
        "ignition": ignition,
        "timestamp": timestamp_ms,
        "raw": raw,
        "raw_json": raw_json,
    }
    if fuel is not None:
        out["fuel"] = fuel
    return out
