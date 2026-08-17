"""T-004: Auth boundary tests — login security, rate limiting, token validation"""
import requests
import pytest
import time

BASE = "http://localhost:8030"

def _s(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

# ── Login endpoint security ──────────────────────────────────────────────────
def test_wrong_password_returns_401():
    r = requests.post(f"{BASE}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "WRONG_PASSWORD"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
    assert r.status_code in (401, 400, 422), \
        f"Wrong password accepted — got {r.status_code}"

def test_wrong_email_returns_401():
    r = requests.post(f"{BASE}/api/v1/auth/login",
        data={"username": "nonexistent@fake.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
    assert r.status_code in (401, 400, 422), \
        f"Wrong email accepted — got {r.status_code}"

def test_empty_credentials_returns_error():
    r = requests.post(f"{BASE}/api/v1/auth/login",
        data={"username": "", "password": ""},
        headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
    assert r.status_code in (401, 400, 422), \
        f"Empty credentials accepted — got {r.status_code}"

def test_login_does_not_expose_password_in_response():
    r = requests.post(f"{BASE}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
    if r.status_code == 200:
        body = r.text
        assert "admin123" not in body, "Password exposed in login response"
        assert "password" not in body.lower() or "token" in body.lower(), \
            "Suspicious password field in response"

def test_login_response_has_required_token_fields():
    r = requests.post(f"{BASE}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data, "No access_token in login response"
    assert data.get("access_token", "") != "", "Empty access_token"

def test_json_login_alias_works():
    r = requests.post(f"{BASE}/api/v1/auth/login/json",
        json={"email": "amr@triangleblack.com", "password": "admin123"},
        timeout=10)
    assert r.status_code in (200, 404), \
        f"JSON login alias error: {r.status_code}"
    if r.status_code == 200:
        assert "access_token" in r.json()

# ── Token content security ───────────────────────────────────────────────────
def test_token_is_not_in_response_url():
    r = requests.post(f"{BASE}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
    assert r.status_code == 200
    assert r.url == f"{BASE}/api/v1/auth/login", \
        f"Login redirected with token in URL: {r.url}"

def test_token_has_three_jwt_parts():
    r = requests.post(f"{BASE}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
    assert r.status_code == 200
    token = r.json().get("access_token", "")
    parts = token.split(".")
    assert len(parts) == 3, f"Token is not valid JWT format (expected 3 parts, got {len(parts)})"

# ── SQL injection attempts ───────────────────────────────────────────────────
def test_sql_injection_in_login_email():
    payloads = [
        "' OR '1'='1",
        "admin@test.com' --",
        "' UNION SELECT * FROM users --",
    ]
    for payload in payloads:
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": payload, "password": "test"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _s(r, "sql-inject")
        assert r.status_code in (401, 400, 422, 429), \
            f"SQL injection payload may have succeeded: '{payload}' → {r.status_code}"

def test_sql_injection_in_search():
    payloads = ["'; DROP TABLE work_orders; --", "' OR 1=1 --", "UNION SELECT 1,2,3"]
    for payload in payloads:
        r = requests.get(f"{BASE}/api/v1/search/?q={payload}",
            headers={"Authorization": "Bearer dummy"}, timeout=5)
        _s(r, "sql-search")
        assert r.status_code not in (500,), \
            f"Search SQL injection caused 500: '{payload}'"

# ── CORS and headers ─────────────────────────────────────────────────────────
def test_cors_not_wildcard_origin():
    r = requests.options(f"{BASE}/api/v1/work-orders/",
        headers={"Origin": "http://evil-attacker.com",
                 "Access-Control-Request-Method": "GET"},
        timeout=5)
    acao = r.headers.get("Access-Control-Allow-Origin", "")
    assert acao != "*", \
        "CRITICAL: CORS allows wildcard origin — any site can access API"

def test_content_type_options_prevents_sniffing():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    xcto = r.headers.get("X-Content-Type-Options", "")
    assert xcto == "nosniff", \
        f"X-Content-Type-Options not set to nosniff: '{xcto}'"

def test_xframe_options_prevents_clickjacking():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    xfo = r.headers.get("X-Frame-Options", "")
    assert xfo in ("DENY", "SAMEORIGIN"), \
        f"X-Frame-Options not set correctly: '{xfo}'"

# ── Rate limiting on login ───────────────────────────────────────────────────
def test_login_rate_limit_config_exists():
    from pathlib import Path
    src = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/main.py").read_text()
    assert "_LOGIN_MAX_ATTEMPTS" in src, "Login rate limit config missing"
    assert "_LOGIN_WINDOW_SECONDS" in src, "Login rate limit window missing"
    assert "login_rate_limit_middleware" in src, "Login rate limit middleware missing"
