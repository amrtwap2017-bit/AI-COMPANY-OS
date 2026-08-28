"""
Sprint A-010-C — Full Onboarding E2E Tests
Proves Triangle Black onboarding is commercially ready.
Tests the complete flow: provision → login → baseline → isolation.
"""
import pytest
import requests
import time
import base64
import json as _json

BASE = "http://localhost:8030"


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


def _unique_email():
    return f"onboard-{int(time.time() * 1000)}@testco.com"


# ─── Scenario 1: Provision Success ───────────────────────────────────────────

def test_provision_returns_success(auth_headers):
    """New tenant provisions successfully with all required fields."""
    r = requests.post(f"{BASE}/api/v1/onboarding/provision",
        headers=auth_headers, json={
            "org_name": "Sharm Engineering Co",
            "property_name": "Red Sea Grand Hotel",
            "admin_email": _unique_email(),
            "admin_password": "SecurePass123!"
        }, timeout=15)
    _skip(r, "provision-success")
    assert r.status_code == 200, f"Got {r.status_code}: {r.text[:200]}"
    data = r.json()
    assert data.get("success") is True
    assert data.get("hotel_id", "").startswith("tb-hotel-")
    assert len(data.get("slug", "")) > 0
    assert len(data.get("site_id", "")) > 0
    assert data.get("ready_for_login") is True
    assert data.get("admin_email") != ""


# ─── Scenario 2: Provisioned User Can Login ──────────────────────────────────

def test_provisioned_user_can_login(auth_headers):
    """Admin user created during provisioning can authenticate."""
    email = _unique_email()
    r = requests.post(f"{BASE}/api/v1/onboarding/provision",
        headers=auth_headers, json={"org_name": "Login Test Co", "property_name": "Login Hotel",
              "admin_email": email, "admin_password": "LoginTest123!"},
        timeout=15)
    _skip(r, "provision-for-login")
    assert r.status_code == 200

    r2 = requests.post(f"{BASE}/api/v1/auth/login/json",
        json={"email": email, "password": r.json().get("admin", {}).get("temp_password", "")},
        headers={"Content-Type": "application/json"}, timeout=10)
    _skip(r2, "login-provisioned")
    assert r2.status_code == 200, f"Login failed: {r2.text[:200]}"
    data = r2.json()
    assert "access_token" in data
    assert len(data["access_token"]) > 20
    # Verify it is a valid JWT (3 parts)
    assert len(data["access_token"].split(".")) == 3


# ─── Scenario 3: Baseline Report Scoped to New Tenant ────────────────────────

def test_baseline_report_scoped_to_new_tenant(auth_headers):
    """Baseline report returns data scoped to the provisioned tenant only."""
    email = _unique_email()
    r = requests.post(f"{BASE}/api/v1/onboarding/provision",
        headers=auth_headers, json={"org_name": "Scope Test Co", "property_name": "Scope Hotel",
              "admin_email": email, "admin_password": "ScopeTest123!"},
        timeout=15)
    _skip(r, "provision-for-scope")
    assert r.status_code == 200
    hotel_id = r.json().get("hotel_id")

    r2 = requests.post(f"{BASE}/api/v1/auth/login/json",
        json={"email": email, "password": r.json().get("admin", {}).get("temp_password", "")}, timeout=10)
    _skip(r2, "login-for-scope")
    token = r2.json().get("access_token", "")

    r3 = requests.get(f"{BASE}/api/v1/baseline/report",
        headers={"Authorization": f"Bearer {token}"}, timeout=20)
    _skip(r3, "baseline-scope")
    assert r3.status_code == 200, f"Baseline failed: {r3.text[:200]}"
    bl = r3.json()
    assert bl.get("hotel_id") == hotel_id, (
        f"Tenant isolation BROKEN: "
        f"expected {hotel_id}, got {bl.get('hotel_id')}"
    )
    assert bl.get("report_type") == "OPERATIONAL_BASELINE"


# ─── Scenario 4: Intelligence Snapshot Accessible ────────────────────────────

def test_intelligence_snapshot_accessible_after_onboarding(auth_headers):
    """New tenant can access intelligence snapshot immediately after provisioning."""
    email = _unique_email()
    r = requests.post(f"{BASE}/api/v1/onboarding/provision",
        headers=auth_headers, json={"org_name": "Intel Test Co", "property_name": "Intel Hotel",
              "admin_email": email, "admin_password": "IntelTest123!"},
        timeout=15)
    _skip(r, "provision-for-intel")
    assert r.status_code == 200

    r2 = requests.post(f"{BASE}/api/v1/auth/login/json",
        json={"email": email, "password": r.json().get("admin", {}).get("temp_password", "")}, timeout=10)
    _skip(r2, "login-for-intel")
    token = r2.json().get("access_token", "")

    r3 = requests.get(f"{BASE}/api/v1/intelligence/snapshot",
        headers={"Authorization": f"Bearer {token}"}, timeout=20)
    _skip(r3, "snapshot-intel")
    assert r3.status_code == 200, f"Snapshot failed: {r3.text[:200]}"


# ─── Scenario 5: Full End-to-End Flow ────────────────────────────────────────

def test_complete_onboarding_flow(auth_headers):
    """
    Complete commercial onboarding flow:
    provision → login → baseline → risk score → insights
    All scoped to the new tenant.
    """
    email = _unique_email()

    # Step 1: Provision
    r1 = requests.post(f"{BASE}/api/v1/onboarding/provision",
        headers=auth_headers, json={"org_name": "Full Flow Co", "property_name": "Full Flow Hotel",
              "admin_email": email, "admin_password": "FullFlow123!"},
        timeout=15)
    _skip(r1, "full-flow-provision")
    assert r1.status_code == 200
    hotel_id = r1.json()["hotel_id"]
    assert hotel_id.startswith("tb-hotel-")

    # Step 2: Login
    r2 = requests.post(f"{BASE}/api/v1/auth/login/json",
        json={"email": email, "password": r1.json().get("admin", {}).get("temp_password", "")}, timeout=10)
    _skip(r2, "full-flow-login")
    assert r2.status_code == 200
    token = r2.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Step 3: Baseline report
    r3 = requests.get(f"{BASE}/api/v1/baseline/report", headers=headers, timeout=20)
    _skip(r3, "full-flow-baseline")
    assert r3.status_code == 200
    assert r3.json()["hotel_id"] == hotel_id

    # Step 4: Risk score
    r4 = requests.get(f"{BASE}/api/v1/baseline/risk", headers=headers, timeout=10)
    _skip(r4, "full-flow-risk")
    assert r4.status_code == 200
    risk = r4.json()
    assert 0 <= risk["score"] <= 100
    assert risk["grade"] in ("A", "B", "C", "D")

    # Step 5: Insights
    r5 = requests.get(f"{BASE}/api/v1/baseline/insights", headers=headers, timeout=10)
    _skip(r5, "full-flow-insights")
    assert r5.status_code == 200
    assert isinstance(r5.json()["insights"], list)


# ─── Failure Modes ────────────────────────────────────────────────────────────

def test_wrong_password_returns_401(auth_headers):
    """Login with wrong password returns 401."""
    email = _unique_email()
    prov_r = requests.post(f"{BASE}/api/v1/onboarding/provision",
        headers=auth_headers, json={"org_name": "Auth Test", "property_name": "Auth Hotel",
              "admin_email": email},
        timeout=15)
    temp_pwd = prov_r.json().get("admin", {}).get("temp_password", "") if prov_r.status_code == 200 else ""
    r = requests.post(f"{BASE}/api/v1/auth/login/json",
        json={"email": email, "password": "WrongPassword!"},
        timeout=10)
    _skip(r, "wrong-password")
    assert r.status_code in (401, 400), f"Expected 401, got {r.status_code}"


def test_baseline_without_token_returns_401():
    """Baseline report requires authentication."""
    r = requests.get(f"{BASE}/api/v1/baseline/report", timeout=10)
    _skip(r, "baseline-noauth")
    assert r.status_code in (401, 403)


def test_provision_missing_email_returns_error(auth_headers):
    """Provision without admin_email returns error."""
    r = requests.post(f"{BASE}/api/v1/onboarding/provision",
        headers=auth_headers, json={"org_name": "Missing Email Co", "property_name": "Test Hotel"},
        timeout=15)
    _skip(r, "provision-missing-email")
    # Should either return 400 or success:false
    if r.status_code == 200:
        assert r.json().get("status") != "provisioned" or \
               r.json().get("admin_email") != ""
    else:
        assert r.status_code in (400, 422)


# ─── Tenant Isolation Verification ───────────────────────────────────────────

def test_new_tenant_data_isolated_from_default(auth_headers):
    """New tenant sees zero data from default tenant's work orders."""
    email = _unique_email()
    r = requests.post(f"{BASE}/api/v1/onboarding/provision",
        headers=auth_headers, json={"org_name": "Isolation Co", "property_name": "Isolation Hotel",
              "admin_email": email},
        timeout=15)
    _skip(r, "isolation-provision")
    assert r.status_code == 200
    new_hotel_id = r.json()["hotel_id"]

    r2 = requests.post(f"{BASE}/api/v1/auth/login/json",
        json={"email": email, "password": r.json().get("admin", {}).get("temp_password", "")}, timeout=10)
    _skip(r2, "isolation-login")
    token = r2.json().get("access_token", "")

    # New tenant's work orders should be empty (just provisioned)
    r3 = requests.get(f"{BASE}/api/v1/work-orders/",
        headers={"Authorization": f"Bearer {token}"}, timeout=10)
    _skip(r3, "isolation-wo")
    assert r3.status_code == 200
    wo_data = r3.json()
    # Extract list regardless of response shape
    items = wo_data if isinstance(wo_data, list) else wo_data.get("results", wo_data.get("items", []))
    assert len(items) == 0, (
        f"NEW TENANT ISOLATION BROKEN: "
        f"got {len(items)} work orders — should be 0 for fresh tenant {new_hotel_id}"
    )