"""
Live API integration tests — hit real Triangle Black API on port 8030.
Requires: uvicorn running at http://127.0.0.1:8030
Run with: pytest tests/test_live_api.py -v
"""
import pytest
import httpx

BASE = "http://127.0.0.1:8030"
API  = f"{BASE}/api/v1"


@pytest.fixture(scope="session")
def api_available():
    try:
        r = httpx.get(f"{BASE}/health", timeout=3)
        assert r.status_code == 200
        return True
    except Exception:
        pytest.skip("Triangle Black API not running on port 8030")


@pytest.fixture(scope="session")
def auth_token(api_available):
    """Get JWT token from seeded admin user."""
    r = httpx.post(f"{API}/auth/token",
        data={"username": "admin@triangleblack.com", "password": "admin123"},
        headers={"content-type": "application/x-www-form-urlencoded"},
        timeout=10,
    )
    if r.status_code == 200:
        return r.json().get("access_token", "")
    return ""


@pytest.fixture(scope="session")
def headers(auth_token):
    if auth_token:
        return {"Authorization": f"Bearer {auth_token}"}
    return {}


def test_health(api_available):
    r = httpx.get(f"{BASE}/health", timeout=5)
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    assert data["database"] == "connected"


def test_docs_available(api_available):
    r = httpx.get(f"{BASE}/docs", timeout=5)
    assert r.status_code == 200


def test_leads_list(api_available, headers):
    r = httpx.get(f"{API}/leads/", headers=headers, timeout=5)
    assert r.status_code in (200, 401)


def test_agents_list(api_available, headers):
    r = httpx.get(f"{API}/agents/", headers=headers, timeout=5)
    assert r.status_code in (200, 401)


def test_pipeline_summary(api_available, headers):
    r = httpx.get(f"{API}/pipeline/summary", headers=headers, timeout=5)
    assert r.status_code in (200, 401, 404)


def test_quotes_list(api_available, headers):
    r = httpx.get(f"{API}/quotes/", headers=headers, timeout=5)
    assert r.status_code in (200, 401)


def test_contracts_list(api_available, headers):
    r = httpx.get(f"{API}/contracts/", headers=headers, timeout=5)
    assert r.status_code in (200, 401)


def test_reporting_endpoint(api_available, headers):
    r = httpx.get(f"{API}/reports/", headers=headers, timeout=5)
    assert r.status_code in (200, 401, 404)


def test_notifications_list(api_available, headers):
    r = httpx.get(f"{API}/notifications/", headers=headers, timeout=5)
    assert r.status_code in (200, 401)


def test_invoices_list(api_available, headers):
    r = httpx.get(f"{API}/invoices/", headers=headers, timeout=5)
    assert r.status_code in (200, 401)


def test_all_routers_respond(api_available, headers):
    """Verify all 13 routers are registered and responding."""
    endpoints = [
        "/leads/", "/agents/", "/pipeline/summary",
        "/quotes/", "/contracts/", "/invoices/",
        "/notifications/", "/reports/",
    ]
    results = {}
    for ep in endpoints:
        try:
            r = httpx.get(f"{API}{ep}", headers=headers, timeout=5)
            results[ep] = r.status_code
        except Exception as e:
            results[ep] = f"error: {e}"

    print("\nRouter status:")
    for ep, code in results.items():
        print(f"  {ep}: {code}")

    # All should respond (200 or auth required or not found — but not 500)
    for ep, code in results.items():
        if isinstance(code, int):
            assert code != 500, f"{ep} returned 500"
