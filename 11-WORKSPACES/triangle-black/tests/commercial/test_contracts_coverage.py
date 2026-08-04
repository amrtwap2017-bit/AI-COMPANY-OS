import requests
import pytest

BASE_URL = "http://localhost:8030"

@pytest.fixture(scope="module")
def auth_h(auth_headers):
    return auth_headers

def test_contracts_list(auth_h):
    r = requests.get(f"{BASE_URL}/api/v1/contracts/?limit=10", headers=auth_h)
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_contracts_have_fields(auth_h):
    r = requests.get(f"{BASE_URL}/api/v1/contracts/?limit=1", headers=auth_h)
    data = r.json()
    if data:
        c = data[0]
        assert "id" in c
        assert "hotel_id" in c
        assert "title" in c
        assert "status" in c

def test_contract_not_found(auth_h):
    r = requests.get(f"{BASE_URL}/api/v1/contracts/nonexistent-id", headers=auth_h)
    assert r.status_code == 404

def test_contracts_requires_auth():
    import requests as _req
    r = _req.get(f"{BASE_URL}/api/v1/contracts/", timeout=10)
    assert r.status_code in (401, 429)
