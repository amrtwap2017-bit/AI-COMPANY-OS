"""
Tests: Authentication
"""
import requests
import pytest

def _skip_if_rate_limited(r, context=""):
    import pytest
    if hasattr(r, 'status_code') and r.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")



BASE_URL = "http://localhost:8030"


def test_login_success():
    r = requests.post(f"{BASE_URL}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password():
    r = requests.post(f"{BASE_URL}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "wrongpass"})
    assert r.status_code == 401


def test_login_unknown_user():
    r = requests.post(f"{BASE_URL}/api/v1/auth/login",
        data={"username": "nobody@test.com", "password": "test123"})
    assert r.status_code == 401


def test_token_contains_role(admin_token):
    import base64, json
    parts = admin_token.split(".")
    assert len(parts) == 3
    payload = json.loads(base64.b64decode(parts[1] + "=="))
    assert "role" in payload
    assert payload["role"] == "admin"


def test_token_contains_sub(admin_token):
    import base64, json
    parts = admin_token.split(".")
    payload = json.loads(base64.b64decode(parts[1] + "=="))
    assert "sub" in payload


def test_login_returns_bearer_type():
    r = requests.post(f"{BASE_URL}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"})
    assert r.json()["token_type"] == "bearer"
