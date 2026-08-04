import requests
import pytest

BASE_URL = "http://localhost:8030"

@pytest.fixture(scope="module")
def auth_h(auth_headers):
    return auth_headers

def test_gl_list_ok(auth_h):
    r = requests.get(f"{BASE_URL}/api/v1/financial/gl/", headers=auth_h)
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_gl_summary_ok(auth_h):
    r = requests.get(f"{BASE_URL}/api/v1/financial/gl/summary", headers=auth_h)
    assert r.status_code == 200
    d = r.json()
    assert "total_entries" in d
    assert "total_debit" in d
    assert "total_credit" in d
    assert "balance" in d

def test_gl_create_entry(auth_h):
    r = requests.post(f"{BASE_URL}/api/v1/financial/gl/",
        json={"description": "Test entry", "total_debit": 1000.0, "total_credit": 1000.0},
        headers=auth_h)
    assert r.status_code == 201
    d = r.json()
    assert d["entry_number"] is not None
    assert d["total_debit"] == 1000.0

def test_gl_requires_auth():
    import requests as _req
    r = _req.get(f"{BASE_URL}/api/v1/financial/gl/", timeout=10)
    assert r.status_code in (401, 429)
