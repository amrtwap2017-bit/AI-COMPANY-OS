import pytest
import requests

BASE = "http://localhost:8030"

@pytest.fixture(scope="session")
def token():
    r = requests.post(
        f"{BASE}/api/v1/auth/login",
        data={"username": "admin@triangleblack.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    return r.json()["access_token"]

@pytest.fixture(scope="session")
def headers(token):
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
