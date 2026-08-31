"""
V7-022 — API Governance Tests
Verifies: response headers, error format, version, request-id

These tests enforce the API contract documented in docs/v7/V7_API_GOVERNANCE.md
Run after any middleware change to catch regressions.
"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

class TestRequiredHeaders:
    """Every response must include these headers."""

    def test_health_has_request_id(self):
        r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
        assert "x-request-id" in r.headers, "X-Request-ID missing"

    def test_health_has_content_type(self):
        r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
        assert "application/json" in r.headers.get("content-type", "")

    def test_health_has_api_version(self):
        r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
        assert "x-api-version" in r.headers, "X-API-Version header missing"
        assert r.headers["x-api-version"] == "7.0", \
            f"Expected X-API-Version: 7.0, got {r.headers.get('x-api-version')}"

    def test_authenticated_endpoint_has_request_id(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/data-quality/score",
                        headers=auth_headers, timeout=10)
        _skip(r, "dq-headers")
        assert "x-request-id" in r.headers

    def test_authenticated_endpoint_has_api_version(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/data-quality/score",
                        headers=auth_headers, timeout=10)
        _skip(r, "dq-version")
        assert r.headers.get("x-api-version") == "7.0"

    def test_request_ids_are_unique(self):
        """Each request gets a unique ID."""
        ids = set()
        for _ in range(5):
            r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
            rid = r.headers.get("x-request-id", "")
            assert rid, "No X-Request-ID"
            ids.add(rid)
        assert len(ids) > 1, "Request IDs must be unique per request"

    def test_client_request_id_propagated(self):
        """Client-provided X-Request-ID should be echoed back."""
        custom_id = "my-test-correlation-id-12345"
        r = requests.get(f"{BASE}/api/v1/health/live",
                        headers={"X-Request-ID": custom_id}, timeout=5)
        returned = r.headers.get("x-request-id", "")
        assert returned == custom_id, \
            f"Client X-Request-ID not echoed: expected {custom_id}, got {returned}"

class TestErrorFormat:
    """All errors must use consistent format."""

    def test_404_has_detail_field(self):
        r = requests.get(f"{BASE}/api/v1/nonexistent-xyz-endpoint", timeout=5)
        assert r.status_code == 404
        body = r.json()
        assert "detail" in body, "404 must have 'detail' field"

    def test_401_has_detail_field(self):
        r = requests.get(f"{BASE}/api/v1/pm-plans/", timeout=5)
        assert r.status_code in (401, 403)
        body = r.json()
        assert "detail" in body, "401/403 must have 'detail' field"

    def test_error_has_request_id_in_header(self):
        r = requests.get(f"{BASE}/api/v1/nonexistent-xyz-endpoint", timeout=5)
        assert "x-request-id" in r.headers, "Error responses must include X-Request-ID"

    def test_no_stack_trace_in_errors(self):
        """Errors must never expose stack traces."""
        r = requests.get(f"{BASE}/api/v1/nonexistent-xyz-endpoint", timeout=5)
        body = str(r.json())
        assert "Traceback" not in body
        assert "File " not in body
        assert "line " not in body.lower()[:50]

    def test_401_not_200(self):
        """Unauthenticated requests must never return 200."""
        sensitive = [
            "/api/v1/pm-plans/",
            "/api/v1/stock-balances/",
            "/api/v1/recommendations/summary",
        ]
        for ep in sensitive:
            r = requests.get(f"{BASE}{ep}", timeout=5)
            assert r.status_code != 200, \
                f"{ep} returned 200 without auth — SECURITY REGRESSION"

class TestAPIVersion:
    """API version must be consistent."""

    def test_version_endpoint_returns_7(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/version",
                        headers=auth_headers, timeout=5)
        _skip(r, "version")
        if r.status_code == 200:
            v = r.json().get("version", "")
            assert "7" in str(v), f"Version should be 7.x, got {v}"

    def test_api_version_header_consistent(self, auth_headers):
        """X-API-Version must be 7.0 across all endpoints."""
        endpoints = [
            "/api/v1/health/live",
            "/api/v1/health/ready",
        ]
        for ep in endpoints:
            r = requests.get(f"{BASE}{ep}", timeout=5)
            v = r.headers.get("x-api-version", "")
            assert v == "7.0", \
                f"{ep} has X-API-Version='{v}' (expected '7.0')"

class TestRateLimitHeaders:
    """Rate limit headers must be present."""

    def test_rate_limit_header_present(self):
        r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
        assert "x-ratelimit-limit" in r.headers or \
               "x-ratelimit-remaining" in r.headers, \
               "Rate limit headers must be present"

class TestContentType:
    """All responses must be JSON."""

    def test_success_response_is_json(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
        assert "application/json" in r.headers.get("content-type", "")

    def test_error_response_is_json(self):
        r = requests.get(f"{BASE}/api/v1/nonexistent-xyz-endpoint", timeout=5)
        assert "application/json" in r.headers.get("content-type", "")
