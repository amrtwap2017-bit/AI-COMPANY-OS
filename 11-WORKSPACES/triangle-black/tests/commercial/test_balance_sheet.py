import pytest

def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        import pytest
        pytest.skip(f"Rate limited in full suite — {context}")

"""Sprint-025: Financial GL Balance Sheet Tests"""
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

def test_balance_sheet_returns_200():
    r = _req.get(f"{BASE}/api/v1/financial/gl/balance-sheet", headers=_h(), timeout=15)
    assert r.status_code == 200, f"Got {r.status_code}: {r.text[:100]}"

def test_balance_sheet_has_sections():
    r = _req.get(f"{BASE}/api/v1/financial/gl/balance-sheet", headers=_h(), timeout=15)
    assert r.status_code == 200
    data = r.json()
    for section in ["assets", "liabilities", "equity", "revenue", "expenses"]:
        assert section in data, f"Missing section: {section}"

def test_balance_sheet_has_net_income():
    r = _req.get(f"{BASE}/api/v1/financial/gl/balance-sheet", headers=_h(), timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "net_income" in data
    assert isinstance(data["net_income"], (int, float))

def test_balance_sheet_has_accounts():
    r = _req.get(f"{BASE}/api/v1/financial/gl/balance-sheet", headers=_h(), timeout=15)
    assert r.status_code == 200
    data = r.json()
    assets = data["assets"]
    assert "accounts" in assets
    assert isinstance(assets["accounts"], list)

def test_balance_sheet_summary():
    r = _req.get(f"{BASE}/api/v1/financial/gl/balance-sheet", headers=_h(), timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "summary" in data
    assert "asset_count" in data["summary"]

def test_balance_sheet_generated_at():
    r = _req.get(f"{BASE}/api/v1/financial/gl/balance-sheet", headers=_h(), timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "generated_at" in data
    assert "hotel_id" in data
