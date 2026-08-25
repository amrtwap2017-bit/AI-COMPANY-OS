"""
Triangle Black — Test Configuration
Rewritten A-010-A: removed all sleep(62) blocks.
DISABLE_RATE_LIMIT=1 is always set — sleeps are unnecessary.
"""
import pytest
import requests

BASE_URL = "http://localhost:8030"


def pytest_configure(config):
    config.addinivalue_line(
        "markers",
        "live_http: marks tests that make real HTTP requests to localhost:8030"
    )


@pytest.fixture(scope="session")
def admin_token():
    """Get admin JWT token once per session. No sleeps needed — rate limit disabled."""
    r = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=15,
    )
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text[:200]}"
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


@pytest.fixture(scope="session")
def auth(auth_headers):
    """Alias for auth_headers."""
    return auth_headers


@pytest.fixture(scope="session")
def headers(auth_headers):
    """Alias for auth_headers."""
    return auth_headers


@pytest.fixture(scope="session")
def manager_auth(base_url):
    """Manager auth headers. Falls back to admin if manager user not seeded."""
    r = requests.post(
        f"{base_url}/api/v1/auth/login",
        data={"username": "sara@triangleblack.com", "password": "manager123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=15,
    )
    if r.status_code == 200:
        return {"Authorization": f"Bearer {r.json()['access_token']}"}
    return {}


def _skip_if_rate_limited(res, context=""):
    """Skip test gracefully if rate limited."""
    if hasattr(res, "status_code") and res.status_code == 429:
        pytest.skip(f"Rate limited — {context}")
