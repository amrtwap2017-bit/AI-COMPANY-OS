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
            "test_core_apis","test_business_actions","test_agents",
            "test_sprint078","test_sprint079","test_sprint080",
            "test_sprint100","test_sprint105","test_sprint110",
            "test_sprint115","test_sprint120","test_sprint125",
            "test_sprint130","test_sprint135","test_sprint139",
            "test_sprint140","test_sprint141","test_sprint142",
            "test_sprint143","test_sprint144","test_sprint145",
            "test_sprint146","test_sprint147","test_sprint148",
            "test_sprint149","test_sprint150","test_sprint151",
            "test_sprint152","test_sprint153","test_sprint154","test_sprint155",
            "test_sprint156","test_sprint157","test_sprint158","test_sprint159",
            "test_sprint216_audit","test_sprint217_wo_audit",
            "test_sprint222_security_headers","test_sprint223_sql_safety",
            "test_sprint224_secrets_scan","test_sprint225_login_rate_limit",
            "test_sprint226_cors_jwt",
            "test_sprint228_audit_injection","test_sprint229_performance",
            "test_sprint230_workflow_engine","test_sprint231_sr_wo_slice",
            "test_sprint235_wo_close","test_sprint236_coverage",
            "test_sprint238_gap_coverage","test_sprint240_workflow_api","test_sprint241_column_fix"
            "test_sprint242_workflow_integration",
            "test_sprint243_performance_profile",
            "test_sprint244_push1650","test_sprint_t003_sla","test_tenant_isolation","test_auth_boundary","test_sprint_t005_services","test_sprint_t006_events",
            "test_sprint245_fk_fix",
            "test_sprint246_hydration_fix",
            "test_sprint247_248_dashboard_stats",
            "test_sprint249_indexes_isolation",
        ]
        for h in HEAVY:
            if h in fname and fname not in _waited_heavy:
                _waited_heavy.add(fname)
                time.sleep(62)
                break
    yield
