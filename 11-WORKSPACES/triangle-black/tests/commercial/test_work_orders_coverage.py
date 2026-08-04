import requests
import pytest

BASE_URL = "http://localhost:8030"

@pytest.fixture(scope="module")
def auth_h(auth_headers):
    return auth_headers

def test_work_orders_list(auth_h):
    r = requests.get(f"{BASE_URL}/api/v1/work-orders/?limit=10", headers=auth_h)
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_work_orders_have_fields(auth_h):
    r = requests.get(f"{BASE_URL}/api/v1/work-orders/?limit=1", headers=auth_h)
    data = r.json()
    if data:
        w = data[0]
        assert "id" in w
        assert "title" in w
        assert "status" in w
        assert "priority" in w

def test_work_order_create(auth_h):
    r = requests.post(f"{BASE_URL}/api/v1/work-orders/",
        json={"title": "Test Coverage WO", "type": "corrective", "priority": "low"},
        headers=auth_h)
    assert r.status_code in (200, 201)

def test_work_orders_status_filter(auth_h):
    r = requests.get(f"{BASE_URL}/api/v1/work-orders/?status=open&limit=5", headers=auth_h)
    assert r.status_code == 200

def test_work_orders_requires_auth():
    import requests as _req
    r = _req.get(f"{BASE_URL}/api/v1/work-orders/", timeout=10)
    assert r.status_code in (401, 429)
