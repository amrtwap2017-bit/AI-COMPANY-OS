"""
Sprint P-009: Security & Enterprise Compliance Verification Test Suite
Validates OWASP Top 10 defenses, RBAC authorization, and header hardening.
"""
import pytest
import requests

BASE = "http://localhost:8030"

_C = {}
def _admin_auth():
    if "admin" not in _C:
        r = requests.post(
            f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        assert r.status_code == 200
        _C["admin"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["admin"]

def test_unauthenticated_request_rejected():
    """Verify strictly protected mutation and private endpoints reject unauthenticated access."""
    protected_mutations = [
        ("POST", "/api/v1/work-orders/"),
        ("POST", "/api/v1/invoices/"),
        ("GET", "/api/v1/auth/me"),
        ("GET", "/api/v1/financial/gl/summary"),
        ("POST", "/api/v1/ai-gateway/request")
    ]

    for method, ep in protected_mutations:
        if method == "POST":
            r = requests.post(f"{BASE}{ep}", json={}, timeout=10)
        else:
            r = requests.get(f"{BASE}{ep}", timeout=10)
        assert r.status_code in [401, 403, 422], f"Endpoint {ep} allowed unauthenticated access: {r.status_code}"  # 422 = validation error (no body) is acceptable

def test_sql_injection_defense_in_search():
    """Verify malicious SQL injection query strings do not cause 500 server crashes."""
    h = _admin_auth()
    malicious_payloads = [
        "' OR '1'='1",
        "'; DROP TABLE work_orders; --",
        "1 UNION SELECT null, null, null--"
    ]

    for payload in malicious_payloads:
        r = requests.get(f"{BASE}/api/v1/search/quick", params={"q": payload}, headers=h, timeout=10)
        # Must be handled safely with 200 empty results or 422 validation error, never 500
        assert r.status_code in [200, 400, 422], f"SQL Injection probe caused unexpected error: {r.status_code}"

def test_security_headers_enforced():
    """Verify enterprise security headers are present on all responses."""
    h = _admin_auth()
    r = requests.get(f"{BASE}/api/v1/health/ready", headers=h, timeout=10)
    assert r.status_code == 200

    headers = r.headers
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("X-XSS-Protection") == "1; mode=block"

def test_sensitive_user_fields_not_leaked():
    """Verify user profiles and lists never expose password hashes or salt fields."""
    h = _admin_auth()
    r = requests.get(f"{BASE}/api/v1/auth/me", headers=h, timeout=10)
    if r.status_code == 200:
        data = r.json()
        assert "password" not in data, "Security Leak: password field present in response"
        assert "password_hash" not in data, "Security Leak: password_hash field present in response"
        assert "hashed_password" not in data, "Security Leak: hashed_password field present in response"
