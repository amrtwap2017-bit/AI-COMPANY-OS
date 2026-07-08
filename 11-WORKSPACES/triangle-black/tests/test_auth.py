"""Tests for authentication endpoints."""
import pytest


def test_login_admin_success(client):
    res = client.post(
        "/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "Admin123!"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert len(data["access_token"]) > 20


def test_login_manager_success(client):
    res = client.post(
        "/api/v1/auth/login",
        data={"username": "sara@triangleblack.com", "password": "Manager123!"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_agent_success(client):
    res = client.post(
        "/api/v1/auth/login",
        data={"username": "hassan@triangleblack.com", "password": "Agent123!"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_wrong_password(client):
    res = client.post(
        "/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "WRONG"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 401


def test_login_unknown_user(client):
    res = client.post(
        "/api/v1/auth/login",
        data={"username": "nobody@test.com", "password": "Test123!"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 401


def test_me_with_valid_token(client, auth):
    res = client.get("/api/v1/auth/me", headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "amr@triangleblack.com"
    assert data["role"] == "admin"


def test_me_without_token(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401


def test_me_with_bad_token(client):
    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalidtoken123"},
    )
    assert res.status_code == 401
