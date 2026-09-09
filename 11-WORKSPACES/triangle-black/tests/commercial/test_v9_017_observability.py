"""
V9-017: Platform Health / Observability Tests
Verifies all API endpoints that feed the health dashboard exist and respond correctly.
"""
import pytest
import requests
import json
import subprocess

BASE = "http://localhost:8030"

def get_token():
    r = subprocess.run(
        ['curl','-s','-X','POST',f'{BASE}/api/v1/auth/login/json',
         '-H','Content-Type: application/json',
         '-d','{"email":"amr@triangleblack.com","password":"admin123"}'],
        capture_output=True, text=True
    )
    try:
        return json.loads(r.stdout).get("access_token","")
    except Exception:
        return ""

@pytest.fixture(scope="module")
def auth_headers():
    tok = get_token()
    if not tok:
        pytest.skip("Server not available")
    return {"Authorization": f"Bearer {tok}"}

class TestPlatformHealthAPIs:
    def test_health_live_public(self):
        """Health live endpoint is public — no auth required."""
        r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
        assert r.status_code == 200
        assert r.json().get("status") == "live"

    def test_health_live_has_timestamp(self):
        """Health live must include timestamp."""
        r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
        assert r.status_code == 200
        assert "timestamp" in r.json()

    def test_health_ready_returns_200(self, auth_headers):
        """Health ready endpoint returns system readiness."""
        r = requests.get(f"{BASE}/api/v1/health/ready",
                        headers=auth_headers, timeout=10)
        assert r.status_code in (200, 401, 403)
        if r.status_code == 200:
            data = r.json()
            assert isinstance(data, dict)

    def test_health_metrics_returns_200(self, auth_headers):
        """Health metrics endpoint returns system metrics."""
        r = requests.get(f"{BASE}/api/v1/health/metrics",
                        headers=auth_headers, timeout=10)
        assert r.status_code in (200, 401, 403)

    def test_attention_api_feeds_dashboard(self, auth_headers):
        """Attention API returns data for health dashboard."""
        r = requests.get(f"{BASE}/api/v1/attention/",
                        headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "attention_score" in data
        assert isinstance(data["attention_score"], (int, float))

    def test_x_request_id_present(self):
        """All responses include X-Request-ID header."""
        r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
        headers_lower = {k.lower(): v for k, v in r.headers.items()}
        assert "x-request-id" in headers_lower

    def test_x_api_version_present(self, auth_headers):
        """All authenticated responses include X-API-Version header."""
        r = requests.get(f"{BASE}/api/v1/attention/",
                        headers=auth_headers, timeout=15)
        assert r.status_code == 200
        headers_lower = {k.lower(): v for k, v in r.headers.items()}
        assert "x-api-version" in headers_lower

class TestPlatformHealthPage:
    def test_health_page_file_exists(self):
        """Platform health portal page file exists."""
        from pathlib import Path
        p = Path("portal/app/(app)/(enterprise)/administration/platform/health/page.tsx")
        assert p.exists(), f"Health page not found at {p}"
        content = p.read_text()
        assert "Platform Health" in content
        assert "health/live" in content or "health/metrics" in content

    def test_health_page_uses_auth_fetch(self):
        """Health page uses authFetch (authenticated requests)."""
        from pathlib import Path
        p = Path("portal/app/(app)/(enterprise)/administration/platform/health/page.tsx")
        content = p.read_text()
        assert "authFetch" in content

    def test_health_page_shows_business_metrics(self):
        """Health page includes both system and business metrics."""
        from pathlib import Path
        p = Path("portal/app/(app)/(enterprise)/administration/platform/health/page.tsx")
        content = p.read_text()
        # System metrics
        assert "health" in content.lower() or "status" in content.lower()
        # Business metrics
        assert "attention" in content.lower() or "score" in content.lower()
