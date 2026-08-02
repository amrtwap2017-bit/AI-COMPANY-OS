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

@pytest.fixture(scope="session")
def client(base_url, auth_headers):
    """HTTP client wrapper for tests that need client fixture."""
    import requests
    class Client:
        def __init__(self, base, headers):
            self.base = base
            self.headers = headers
        def get(self, path, **kwargs):
            kwargs.setdefault("headers", self.headers)
            kwargs.setdefault("timeout", 15)
            return requests.get(f"{self.base}{path}", **kwargs)
        def post(self, path, **kwargs):
            kwargs.setdefault("headers", self.headers)
            kwargs.setdefault("timeout", 15)
            return requests.post(f"{self.base}{path}", **kwargs)
        def patch(self, path, **kwargs):
            kwargs.setdefault("headers", self.headers)
            kwargs.setdefault("timeout", 15)
            return requests.patch(f"{self.base}{path}", **kwargs)
        def delete(self, path, **kwargs):
            kwargs.setdefault("headers", self.headers)
            kwargs.setdefault("timeout", 15)
            return requests.delete(f"{self.base}{path}", **kwargs)
    return Client(base_url, auth_headers)
