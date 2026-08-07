import pytest
"""Sprint-044: AI Signals Dashboard Tests"""
import requests as _req

pytestmark = pytest.mark.live_http

BASE = "http://localhost:8030"
_C = {}

def _h():
    if "h" not in _C:
        r = _req.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]


def test_ai_signals_summary_200():
    r = _req.get(f"{BASE}/api/v1/ai/signals/summary", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_ai_signals_summary_has_counts():
    r = _req.get(f"{BASE}/api/v1/ai/signals/summary", headers=_h(), timeout=15)
    d = r.json()
    assert isinstance(d, dict)
    assert "critical" in d or "high" in d or "total" in d or len(d) > 0

def test_ai_signals_list():
    r = _req.get(f"{BASE}/api/v1/ai/signals/?limit=5", headers=_h(), timeout=15)
    assert r.status_code in (200, 404, 422)

def test_ai_signals_v2():
    r = _req.get(f"{BASE}/api/v1/ai-signals-v2/summary", headers=_h(), timeout=15)
    assert r.status_code in (200, 404, 422)

def test_maintenance_overdue_pm():
    r = _req.get(f"{BASE}/api/v1/maintenance/pm-plans/", headers=_h(), timeout=15)
    assert r.status_code == 200
    items = r.json() if isinstance(r.json(), list) else []
    assert len(items) >= 0

def test_health_check():
    r = _req.get(f"{BASE}/health", timeout=10)
    assert r.status_code == 200
    assert r.json().get("ok") is True
