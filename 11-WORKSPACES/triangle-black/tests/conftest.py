"""
Triangle Black — Test Configuration
"""
import pytest
import requests

BASE_URL = "http://localhost:8030"

@pytest.fixture(scope="session")
def admin_token():
    """Get admin JWT token for all tests."""
    r = requests.post(f"{BASE_URL}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"})
    assert r.status_code == 200, f"Login failed: {r.text}"
    return r.json()["access_token"]

@pytest.fixture(scope="session")
def auth_headers(admin_token):
    """Authorization headers for authenticated requests."""
    return {"Authorization": f"Bearer {admin_token}"}

@pytest.fixture(scope="session")
def base_url():
    return BASE_URL
