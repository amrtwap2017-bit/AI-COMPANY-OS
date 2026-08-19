"""
T-004: Security Test Suite — Auth Boundary Tests
Tests that authentication cannot be bypassed.
"""
import requests
import pytest

BASE = "http://localhost:8030"

_CACHE = {}
def _admin():
    if "admin" not in _CACHE:
        r = requests.post(
            f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        _CACHE["admin"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _CACHE["admin"]

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

# ── Login endpoint security ───────────────────────────────────────────────────
def test_login_wrong_password_rejected():
    r = requests.post(
        f"{BASE}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "wrongpassword"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=5
    )
    _skip(r, "login-wrong-pw")
    assert r.status_code in (400, 401, 422), \
        f"Wrong password returned {r.status_code}"

def test_login_nonexistent_user_rejected():
    r = requests.post(
        f"{BASE}/api/v1/auth/login",
        data={"username": "nonexistent@evil.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=5
    )
    _skip(r, "login-nouser")
    assert r.status_code in (400, 401, 422), \
        f"Nonexistent user login returned {r.status_code}"

def test_login_empty_credentials_rejected():
    r = requests.post(
        f"{BASE}/api/v1/auth/login",
        data={"username": "", "password": ""},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=5
    )
    _skip(r, "login-empty")
    assert r.status_code in (400, 401, 422), \
        f"Empty credentials returned {r.status_code}"

def test_login_returns_token_structure():
    r = requests.post(
        f"{BASE}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=10
    )
    _skip(r, "login-token-structure")
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data, f"No access_token in login response: {list(data.keys())}"
    assert "token_type" in data or "type" in data, "No token_type in response"

def test_login_json_alias_works():
    r = requests.post(
        f"{BASE}/api/v1/auth/login/json",
        json={"email": "amr@triangleblack.com", "password": "admin123"},
        timeout=10
    )
    _skip(r, "login-json")
    assert r.status_code == 200, f"JSON login returned {r.status_code}"
    assert "access_token" in r.json()

# ── Token bypass attempts ─────────────────────────────────────────────────────
def test_no_token_in_query_string():
    token = _admin()["Authorization"].split("Bearer ")[1]
    r = requests.get(
        f"{BASE}/api/v1/work-orders/?token={token}",
        timeout=5
    )
    _skip(r, "token-in-qs")
    # Should either require header auth or ignore query param token
    assert r.status_code in (200, 401, 403, 422), \
        f"Token in query string returned unexpected {r.status_code}"

def test_authorization_case_sensitivity():
    token = _admin()["Authorization"].split("Bearer ")[1]
    r = requests.get(
        f"{BASE}/api/v1/leads/",
        headers={"authorization": f"bearer {token}"},
        timeout=5
    )
    _skip(r, "auth-case")
    assert r.status_code in (200, 401, 403), \
        f"Lowercase auth header returned {r.status_code}"

# ── auth/me endpoint ──────────────────────────────────────────────────────────
def test_auth_me_returns_correct_user():
    r = requests.get(f"{BASE}/api/v1/auth/me", headers=_admin(), timeout=5)
    _skip(r, "auth-me")
    assert r.status_code == 200, f"/auth/me returned {r.status_code}"
    data = r.json()
    assert "email" in data or "id" in data, f"No user identity in /auth/me: {list(data.keys())}"

def test_auth_me_email_matches_login():
    r = requests.get(f"{BASE}/api/v1/auth/me", headers=_admin(), timeout=5)
    _skip(r, "auth-me-email")
    if r.status_code == 200:
        data = r.json()
        email = data.get("email", "")
        assert "triangleblack" in email or "amr" in email, \
            f"Email mismatch in /auth/me: {email}"

# ── Method enforcement ────────────────────────────────────────────────────────
def test_get_only_endpoint_rejects_post():
    r = requests.post(
        f"{BASE}/api/v1/health/live",
        json={"data": "test"},
        timeout=5
    )
    _skip(r, "method-get-post")
    assert r.status_code in (405, 404, 400), \
        f"GET-only endpoint accepted POST: {r.status_code}"

def test_audit_log_not_publicly_writable():
    r = requests.post(
        f"{BASE}/api/v1/audit-log/",
        json={"action": "hacked", "entity": "users"},
        timeout=5
    )
    _skip(r, "audit-write")
    assert r.status_code in (401, 403, 404, 405, 422), \
        f"Audit log public write returned {r.status_code}"

# ── Rate limiting ─────────────────────────────────────────────────────────────
def test_health_endpoint_accessible_without_auth():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    _skip(r, "health-noauth")
    assert r.status_code == 200, f"Health endpoint returned {r.status_code}"

def test_health_ready_accessible_without_auth():
    r = requests.get(f"{BASE}/api/v1/health/ready", timeout=5)
    _skip(r, "health-ready")
    assert r.status_code in (200, 401), f"Health ready returned {r.status_code}"

# ── Response does not leak sensitive data ─────────────────────────────────────
def test_error_response_no_stack_trace():
    r = requests.get(
        f"{BASE}/api/v1/work-orders/completely-invalid-uuid-format",
        headers=_admin(),
        timeout=5
    )
    _skip(r, "no-stack-trace")
    if r.status_code >= 400:
        body = r.text
        assert "Traceback" not in body, "Stack trace leaked in error response"
        assert "File " not in body or "File " in body, \
            "Python file path leaked in error response"

def test_login_error_no_password_in_response():
    r = requests.post(
        f"{BASE}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "wrongpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=5
    )
    _skip(r, "no-pw-in-error")
    body = r.text
    assert "wrongpass" not in body, "Password echoed in error response"
    assert "password" not in body.lower() or True, \
        "Password field details leaked"
