from collections import deque

from app.alerts_worker import TelemetryPoint, detect_fuel_drop_alert


def test_no_alert_with_single_point():
    points = deque([TelemetryPoint(imei="1", ts_ms=1000, fuel=90.0)], maxlen=5)
    assert detect_fuel_drop_alert(points, threshold=10, window_seconds=120) is None


def test_alert_when_drop_exceeds_threshold_within_window():
    points = deque(maxlen=5)
    points.append(TelemetryPoint(imei="1", ts_ms=0, fuel=80.0))
    points.append(TelemetryPoint(imei="1", ts_ms=60_000, fuel=60.0))
    alert = detect_fuel_drop_alert(points, threshold=10, window_seconds=120)
    assert alert is not None
    assert alert["type"] == "fuel_drop"
    assert alert["imei"] == "1"
    assert alert["drop"] > 10


def test_no_alert_if_outside_time_window():
    points = deque(maxlen=5)
    points.append(TelemetryPoint(imei="1", ts_ms=0, fuel=90.0))
    points.append(TelemetryPoint(imei="1", ts_ms=300_000, fuel=60.0))
    alert = detect_fuel_drop_alert(points, threshold=10, window_seconds=120)
    assert alert is None


def test_no_alert_if_drop_not_exceed_threshold():
    points = deque(maxlen=5)
    points.append(TelemetryPoint(imei="1", ts_ms=0, fuel=80.0))
    points.append(TelemetryPoint(imei="1", ts_ms=30_000, fuel=72.0))
    alert = detect_fuel_drop_alert(points, threshold=10, window_seconds=120)
    assert alert is None
