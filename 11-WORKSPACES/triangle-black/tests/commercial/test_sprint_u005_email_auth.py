"""
Tests for Sprint U-005: Security & Auth Closure on Email Service
"""
import requests
import pytest
from pathlib import Path

BASE = "http://localhost:8030"
SRC = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/commercial/email_service")

def _s(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_email_router_requires_auth_dependencies():
    src = (SRC / "router.py").read_text()
    assert "get_current_user" in src
    assert "get_hotel_id" in src

def test_unauthenticated_email_send_blocked():
    r = requests.post(
        f"{BASE}/api/v1/email/send",
        json={"to_email": "test@example.com", "subject": "Test", "template_name": "welcome"},
        timeout=5
    )
    _s(r, "email-send-noauth")
    assert r.status_code in (401, 403, 422)

def test_unauthenticated_email_logs_blocked():
    r = requests.get(f"{BASE}/api/v1/email/logs", timeout=5)
    _s(r, "email-logs-noauth")
    assert r.status_code in (401, 403, 422)
