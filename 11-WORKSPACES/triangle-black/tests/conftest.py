"""
Triangle Black — Test Configuration
"""
import pytest
import requests

BASE_URL = "http://localhost:8030"

@pytest.fixture(scope="session")
def admin_token():
    """Get admin JWT token for all tests. Login once, reuse across all tests."""
    import time
    for attempt in range(3):
        r = requests.post(f"{BASE_URL}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"})
        if r.status_code == 200:
            return r.json()["access_token"]
        if r.status_code == 429:
            print(f"Rate limited, waiting 65 seconds (attempt {attempt+1}/3)...")
            time.sleep(65)
        else:
            break
    assert False, f"Login failed after retries: {r.status_code} {r.text}"

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

@pytest.fixture(scope="session")
def auth(auth_headers):
    """Alias for auth_headers — some tests use 'auth' fixture name."""
    return auth_headers

@pytest.fixture(scope="session")
def headers(auth_headers):
    """Alias for auth_headers — some tests use 'headers' fixture name."""
    return auth_headers

@pytest.fixture(scope="session")
def manager_auth(base_url):
    """Manager auth headers for tests requiring manager role."""
    import time
    import requests as _req
    for _ in range(3):
        r = _req.post(f"{base_url}/api/v1/auth/login",
            data={"username": "sara@triangleblack.com", "password": "manager123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"})
        if r.status_code == 200:
            token = r.json().get("access_token", "")
            return {"Authorization": f"Bearer {token}"}
        time.sleep(65)
    return {}


_waited_modules = set()

@pytest.fixture(autouse=True)
def wait_between_test_files(request):
    """Wait once per test module to allow rate limit reset."""
    import time
    global _waited_modules
    if hasattr(request, 'node') and hasattr(request.node, 'fspath'):
        fname = str(request.node.fspath)
        if any(x in fname for x in ['test_quotes', 'test_notifications']):
            if fname not in _waited_modules:
                _waited_modules.add(fname)
                time.sleep(62)
    yield

_waited_modules2 = set()

@pytest.fixture(autouse=True)
def wait_for_leads_module(request):
    """Wait once before test_leads.py to avoid rate limit."""
    import time
    global _waited_modules2
    if hasattr(request, 'node') and hasattr(request.node, 'fspath'):
        fname = str(request.node.fspath)
        if 'test_leads' in fname and 'commercial' not in fname:
            if fname not in _waited_modules2:
                _waited_modules2.add(fname)
                time.sleep(62)
    yield


# Sprint-063: live_http marker registration
# Tests marked @pytest.mark.live_http require a running server
# Run isolated: .venv/bin/python -m pytest -m live_http
# Normal suite excludes them automatically via pytest.ini addopts
def pytest_configure(config):
    config.addinivalue_line(
        "markers",
        "live_http: marks tests that make real HTTP requests to localhost:8030"
    )


_waited_heavy = set()

@pytest.fixture(autouse=True)
def wait_for_heavy_modules(request):
    """Wait before modules with many HTTP calls to prevent rate limit cascade."""
    import time
    global _waited_heavy
    if hasattr(request, "node") and hasattr(request.node, "fspath"):
        fname = str(request.node.fspath)
        HEAVY = [
            "test_sprint084", "test_sprint083", "test_sprint082",
            "test_sprint081", "test_sprint080", "test_sprint078",
            "test_core_apis","test_business_actions","test_agents","test_sprint100","test_sprint101","test_sprint102","test_sprint103","test_sprint104","test_sprint105","test_sprint106","test_sprint107","test_sprint108","test_sprint109","test_sprint110","test_sprint111","test_sprint112","test_sprint113","test_sprint114","test_sprint115","test_sprint116","test_sprint117","test_sprint118","test_sprint119","test_sprint120"
        ]
        for h in HEAVY:
            if h in fname and fname not in _waited_heavy:
                _waited_heavy.add(fname)
                time.sleep(62)
                break
    yield
