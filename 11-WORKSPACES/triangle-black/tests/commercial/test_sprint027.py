import pytest

def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        import pytest
        pytest.skip(f"Rate limited in full suite — {context}")

"""Sprint-027: Balance Sheet Portal + API coverage"""
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

def test_balance_sheet_api_200():
    r = _req.get(f"{BASE}/api/v1/financial/gl/balance-sheet", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_balance_sheet_5_sections():
    r = _req.get(f"{BASE}/api/v1/financial/gl/balance-sheet", headers=_h(), timeout=15)
    d = r.json()
    for s in ["assets","liabilities","equity","revenue","expenses"]:
        assert s in d

def test_balance_sheet_net_income_is_numeric():
    r = _req.get(f"{BASE}/api/v1/financial/gl/balance-sheet", headers=_h(), timeout=15)
    assert isinstance(r.json().get("net_income"), (int, float))

def test_balance_sheet_accounts_are_list():
    r = _req.get(f"{BASE}/api/v1/financial/gl/balance-sheet", headers=_h(), timeout=15)
    d = r.json()
    assert isinstance(d["assets"].get("accounts", []), list)

def test_balance_sheet_summary_counts():
    r = _req.get(f"{BASE}/api/v1/financial/gl/balance-sheet", headers=_h(), timeout=15)
    d = r.json()
    summary = d.get("summary", {})
    total = sum(v for v in summary.values() if isinstance(v, int))
    assert total > 0, "Expected accounts in at least one category"

def test_gl_accounts_list_has_types():
    r = _req.get(f"{BASE}/api/v1/financial/gl/accounts/?limit=20", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    items = d.get("results", d.get("items", d if isinstance(d,list) else []))
    if items:
        assert "account_type" in items[0]
