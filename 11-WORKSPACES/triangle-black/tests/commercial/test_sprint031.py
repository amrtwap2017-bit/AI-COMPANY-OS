"""Sprint-031: Vendor Scorecard Tests"""
import requests as _req

BASE = "http://localhost:8030"
_C = {}

def _h():
    if "h" not in _C:
        r = _req.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_vendor_scorecard_list_200():
    r = _req.get(f"{BASE}/api/v1/vendor-scorecards/?limit=10", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_vendor_scorecard_has_count():
    r = _req.get(f"{BASE}/api/v1/vendor-scorecards/?limit=10", headers=_h(), timeout=15)
    d = r.json()
    assert "count" in d or "results" in d

def test_vendor_scorecard_has_score_fields():
    r = _req.get(f"{BASE}/api/v1/vendor-scorecards/?limit=3", headers=_h(), timeout=15)
    d = r.json()
    items = d.get("results", d if isinstance(d, list) else [])
    if items:
        s = items[0]
        assert "overall_score" in s
        assert "on_time_pct" in s
        assert "quality_score" in s

def test_vendor_scorecard_sorted_by_score():
    r = _req.get(f"{BASE}/api/v1/vendor-scorecards/?limit=20", headers=_h(), timeout=15)
    d = r.json()
    items = d.get("results", [])
    if len(items) > 1:
        scores = [float(i.get("overall_score", 0)) for i in items]
        assert scores == sorted(scores, reverse=True)

def test_vendors_list_200():
    r = _req.get(f"{BASE}/api/v1/vendors/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_vendors_have_hotel_id():
    r = _req.get(f"{BASE}/api/v1/vendors/?limit=1", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("results", [])
    if items:
        assert "hotel_id" in items[0]
