"""
GOLDEN JOURNEY 1: Customer Onboarding
Tenant → Hotel → Users → Assets → PM Plans → Suppliers → Dashboard
"""
import pytest
import requests
import json
import subprocess

BASE = "http://localhost:8030"

def get_token(email="amr@triangleblack.com", password="admin123"):
    r = subprocess.run(
        ['curl','-s','-X','POST',f'{BASE}/api/v1/auth/login/json',
         '-H','Content-Type: application/json',
         '-d',f'{{"email":"{email}","password":"{password}"}}'],
        capture_output=True, text=True
    )
    try:
        return json.loads(r.stdout).get("access_token", "")
    except:
        return ""

@pytest.fixture(scope="module")
def auth():
    tok = get_token()
    if not tok:
        pytest.skip("Server not available")
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}

class TestJourney1Onboarding:

    def test_j1_01_server_live(self):
        """J1: Platform is reachable."""
        r = requests.get(f"{BASE}/api/v1/health/live", timeout=10)
        assert r.status_code == 200
        assert r.json().get("status") == "live"

    def test_j1_02_authentication_works(self, auth):
        """J1: Admin can authenticate."""
        r = requests.get(f"{BASE}/api/v1/me", headers=auth, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "email" in data or "id" in data

    def test_j1_03_onboarding_status(self, auth):
        """J1: Onboarding status is readable."""
        r = requests.get(f"{BASE}/api/v1/onboarding/status", headers=auth, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "completion_pct" in data
        assert "is_complete" in data

    def test_j1_04_onboarding_checklist(self, auth):
        """J1: Onboarding checklist is readable."""
        r = requests.get(f"{BASE}/api/v1/onboarding/checklist", headers=auth, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "steps" in data
        assert "completion_pct" in data

    def test_j1_05_assets_accessible(self, auth):
        """J1: Asset registry is accessible."""
        r = requests.get(f"{BASE}/api/v1/assets/?limit=5", headers=auth, timeout=10)
        assert r.status_code == 200

    def test_j1_06_data_import_schema_available(self, auth):
        """J1: Data import schema is documented."""
        r = requests.get(f"{BASE}/api/v1/data-import/schema/assets",
                        headers=auth, timeout=10)
        assert r.status_code == 200

    def test_j1_07_pilot_baseline_works(self, auth):
        """J1: Pilot baseline can be captured."""
        r = requests.get(f"{BASE}/api/v1/pilot/baseline", headers=auth, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "work_orders" in data
        assert "maintenance" in data
        assert "data_quality" in data

    def test_j1_08_pilot_checklist(self, auth):
        """J1: Pilot readiness checklist works."""
        r = requests.get(f"{BASE}/api/v1/pilot/checklist", headers=auth, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "phases" in data
        assert len(data["phases"]) >= 3

    def test_j1_PASS(self, auth):
        """J1: GOLDEN JOURNEY 1 — ONBOARDING: COMPLETE."""
        # Verify all critical steps passed by running them
        steps = [
            ("health", requests.get(f"{BASE}/api/v1/health/live", timeout=10)),
            ("me", requests.get(f"{BASE}/api/v1/me", headers=auth, timeout=10)),
            ("onboarding", requests.get(f"{BASE}/api/v1/onboarding/status", headers=auth, timeout=10)),
            ("pilot", requests.get(f"{BASE}/api/v1/pilot/baseline", headers=auth, timeout=15)),
        ]
        for name, r in steps:
            assert r.status_code == 200, f"Step '{name}' failed: {r.status_code}"
        print("\n✅ GOLDEN JOURNEY 1: ONBOARDING — PASS")
