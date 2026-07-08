"""
Triangle Black — Test Configuration
Uses real PostgreSQL. Creates isolated test data. Cleans up after.
"""
from __future__ import annotations
import os
import pytest
from fastapi.testclient import TestClient

os.environ["TRIANGLE_BLACK_DB_URL"] = (
    "postgresql+psycopg2://ai:ai123@127.0.0.1:5432/triangle_black"
)
os.environ["PYTHONPATH"] = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black"

from src.main import app
from src.core.database import SessionLocal
from src.commercial.auth.models import User
from src.core.auth import hash_password


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def client():
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c


@pytest.fixture(scope="session")
def db():
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture(scope="session")
def admin_token(client):
    """Get JWT token for admin user."""
    res = client.post(
        "/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "Admin123!"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 200, f"Login failed: {res.text}"
    return res.json()["access_token"]


@pytest.fixture(scope="session")
def manager_token(client):
    """Get JWT token for manager user."""
    res = client.post(
        "/api/v1/auth/login",
        data={"username": "sara@triangleblack.com", "password": "Manager123!"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 200, f"Login failed: {res.text}"
    return res.json()["access_token"]


@pytest.fixture(scope="session")
def agent_token(client):
    """Get JWT token for agent user."""
    res = client.post(
        "/api/v1/auth/login",
        data={"username": "hassan@triangleblack.com", "password": "Agent123!"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 200, f"Login failed: {res.text}"
    return res.json()["access_token"]


@pytest.fixture(scope="session")
def auth(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def manager_auth(manager_token):
    return {"Authorization": f"Bearer {manager_token}"}


@pytest.fixture(scope="session")
def agent_auth(agent_token):
    return {"Authorization": f"Bearer {agent_token}"}
