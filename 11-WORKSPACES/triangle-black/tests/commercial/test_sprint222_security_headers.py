"""Sprint-222: Security headers tests"""
import requests

BASE = "http://localhost:8030"

def test_x_content_type_options_present():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert "X-Content-Type-Options" in r.headers
    assert r.headers["X-Content-Type-Options"] == "nosniff"

def test_x_frame_options_present():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert "X-Frame-Options" in r.headers
    assert r.headers["X-Frame-Options"] == "DENY"

def test_x_xss_protection_present():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert "X-XSS-Protection" in r.headers

def test_referrer_policy_present():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert "Referrer-Policy" in r.headers
    assert "strict-origin" in r.headers["Referrer-Policy"]

def test_permissions_policy_present():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert "Permissions-Policy" in r.headers

def test_cross_domain_policy_present():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert "X-Permitted-Cross-Domain-Policies" in r.headers
    assert r.headers["X-Permitted-Cross-Domain-Policies"] == "none"

def test_rate_limit_headers_still_present():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert "X-RateLimit-Limit" in r.headers

def test_request_id_header_still_present():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert "X-Request-ID" in r.headers

def test_security_headers_on_api_endpoint():
    r = requests.get(f"{BASE}/api/v1/cache/status", timeout=5)
    assert "X-Content-Type-Options" in r.headers
    assert "X-Frame-Options" in r.headers
    assert "Referrer-Policy" in r.headers
