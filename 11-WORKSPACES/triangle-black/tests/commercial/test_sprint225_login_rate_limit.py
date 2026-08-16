"""Sprint-225: Login brute force protection tests"""
import requests

BASE = "http://localhost:8030"

def test_login_rate_limit_module_present():
    """Login rate limiting middleware must be present in main.py."""
    from pathlib import Path
    source = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/main.py").read_text()
    assert "_LOGIN_MAX_ATTEMPTS" in source
    assert "_LOGIN_WINDOW_SECONDS" in source
    assert "login_rate_limit_middleware" in source

def test_login_max_attempts_is_reasonable():
    """Login rate limit must be between 3 and 20 attempts per window."""
    from pathlib import Path
    source = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/main.py").read_text()
    import re
    m = re.search(r"_LOGIN_MAX_ATTEMPTS\s*=\s*(\d+)", source)
    assert m, "LOGIN_MAX_ATTEMPTS not found"
    val = int(m.group(1))
    assert 3 <= val <= 20, f"LOGIN_MAX_ATTEMPTS={val} should be between 3 and 20"

def test_login_window_is_reasonable():
    """Login window must be between 30 and 300 seconds."""
    from pathlib import Path
    source = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/main.py").read_text()
    import re
    m = re.search(r"_LOGIN_WINDOW_SECONDS\s*=\s*(\d+)", source)
    assert m, "_LOGIN_WINDOW_SECONDS not found"
    val = int(m.group(1))
    assert 30 <= val <= 300, f"_LOGIN_WINDOW_SECONDS={val} should be between 30 and 300"

def test_valid_login_still_works():
    """Valid login must still work after rate limiter is added."""
    r = requests.post(f"{BASE}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
    assert r.status_code == 200
    assert "access_token" in r.json()

def test_health_endpoint_not_affected_by_login_limiter():
    """Health endpoint must never be blocked by login rate limiter."""
    for _ in range(5):
        r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
        assert r.status_code == 200

def test_login_returns_429_retry_after_header_structure():
    """429 responses must include Retry-After header."""
    from pathlib import Path
    source = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/main.py").read_text()
    assert '"Retry-After"' in source or "'Retry-After'" in source
    assert "LOGIN_RATE_LIMITED" in source

def test_localhost_whitelisted_from_login_limiter():
    """Localhost must be whitelisted from login rate limiting (for tests)."""
    for _ in range(8):
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": "wrong@example.com", "password": "wrongpassword"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=5)
        assert r.status_code != 429, f"Localhost was rate limited on login attempt — whitelist broken"
