import requests
import pytest

BASE_URL = "http://localhost:8030"

@pytest.fixture(scope="module")
def auth_h(auth_headers):
    return auth_headers

def test_employees_list_empty_ok(auth_h):
    r = requests.get(f"{BASE_URL}/api/v1/employees/", headers=auth_h)
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_employee_create(auth_h):
    r = requests.post(f"{BASE_URL}/api/v1/employees/",
        json={"name": "Test Employee", "department": "Engineering"},
        headers=auth_h)
    assert r.status_code == 201
    d = r.json()
    assert d["name"] == "Test Employee"
    assert d["hotel_id"] is not None
    return d["id"]

def test_employee_get(auth_h):
    cr = requests.post(f"{BASE_URL}/api/v1/employees/",
        json={"name": "Get Test Employee"},
        headers=auth_h)
    emp_id = cr.json()["id"]
    r = requests.get(f"{BASE_URL}/api/v1/employees/{emp_id}", headers=auth_h)
    assert r.status_code == 200
    assert r.json()["id"] == emp_id

def test_employee_tenant_isolation(auth_h):
    r = requests.get(f"{BASE_URL}/api/v1/employees/nonexistent-id", headers=auth_h)
    assert r.status_code == 404

def test_employees_requires_auth():
    import requests as _req
    r = _req.get(f"{BASE_URL}/api/v1/employees/", timeout=10)
    assert r.status_code in (401, 429)
