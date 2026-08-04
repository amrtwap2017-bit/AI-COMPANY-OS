import requests
import pytest

BASE_URL = "http://localhost:8030"

@pytest.fixture(scope="module")
def auth_h(auth_headers):
    return auth_headers

def test_eta_status_ok(auth_h):
    r = requests.get(f"{BASE_URL}/api/v1/eta/status", headers=auth_h)
    assert r.status_code == 200
    d = r.json()
    assert "configured" in d
    assert "sandbox" in d

def test_eta_invoices_list(auth_h):
    r = requests.get(f"{BASE_URL}/api/v1/eta/invoices", headers=auth_h)
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_eta_submit_unconfigured(auth_h):
    r = requests.post(f"{BASE_URL}/api/v1/eta/submit",
        json={"invoice_number": "TEST-001", "total_amount": 1000.0, "tax_amount": 140.0},
        headers=auth_h)
    assert r.status_code == 200
    d = r.json()
    assert d["eta_status"] == "failed"
    assert d["error_message"] is not None

def test_eta_requires_auth():
    import requests as _req
    # /eta/status is public (config check) but /eta/invoices requires auth
    r = _req.get(f"{BASE_URL}/api/v1/eta/invoices", timeout=10)
    assert r.status_code in (401, 429)
