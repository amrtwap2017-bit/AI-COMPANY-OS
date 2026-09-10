"""
V10-011: Pilot Onboarding Engine Tests
Baseline KPI capture, progress tracking, ROI measurement.
"""
import pytest
import requests
import json
import subprocess
from pathlib import Path

BASE = "http://localhost:8030"

def get_token():
    r = subprocess.run(
        ['curl','-s','-X','POST',f'{BASE}/api/v1/auth/login/json',
         '-H','Content-Type: application/json',
         '-d','{"email":"amr@triangleblack.com","password":"admin123"}'],
        capture_output=True, text=True
    )
    try:
        return json.loads(r.stdout).get("access_token","")
    except:
        return ""

@pytest.fixture(scope="module")
def auth_headers():
    tok = get_token()
    if not tok:
        pytest.skip("Server not available")
    return {"Authorization": f"Bearer {tok}"}

class TestPilotBaselineModule:
    def test_baseline_module_exists(self):
        """V10-011: Baseline service module exists."""
        p = Path("src/commercial/pilot_control/baseline.py")
        assert p.exists(), "baseline.py not found"

    def test_baseline_service_importable(self):
        """V10-011: PilotBaselineService can be imported."""
        import sys
        sys.path.insert(0, ".")
        from src.commercial.pilot_control.baseline import PilotBaselineService
        assert PilotBaselineService is not None

class TestPilotEndpoints:
    def test_pilot_status_returns_200(self, auth_headers):
        """Pilot status endpoint works."""
        r = requests.get(f"{BASE}/api/v1/pilot/status",
                        headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "pilot_phase" in data
        assert "scores" in data
        assert "key_metrics" in data

    def test_pilot_baseline_returns_200(self, auth_headers):
        """Pilot baseline capture returns full snapshot."""
        r = requests.get(f"{BASE}/api/v1/pilot/baseline",
                        headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "work_orders" in data
        assert "maintenance" in data
        assert "performance" in data
        assert "data_quality" in data
        assert "pilot_scores" in data

    def test_baseline_has_linkage_metric(self, auth_headers):
        """Baseline includes WO→Asset linkage metric."""
        r = requests.get(f"{BASE}/api/v1/pilot/baseline",
                        headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "asset_linkage_pct" in data["work_orders"]
        assert isinstance(data["work_orders"]["asset_linkage_pct"], (int, float))

    def test_baseline_has_confidence(self, auth_headers):
        """Baseline includes data confidence metadata."""
        r = requests.get(f"{BASE}/api/v1/pilot/baseline",
                        headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "intelligence_confidence" in data["data_quality"]
        assert data["data_quality"]["intelligence_confidence"] in [
            "HIGH", "MEDIUM", "LOW", "VERY_LOW"
        ]

    def test_pilot_roi_returns_200(self, auth_headers):
        """Pilot ROI endpoint returns measurement."""
        r = requests.get(f"{BASE}/api/v1/pilot/roi",
                        headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "current_state" in data
        assert "targets" in data
        assert "gaps" in data
        assert "roi_narrative" in data

    def test_pilot_checklist_returns_200(self, auth_headers):
        """Pilot checklist returns phase-based progress."""
        r = requests.get(f"{BASE}/api/v1/pilot/checklist",
                        headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "completion_pct" in data
        assert "phases" in data
        assert len(data["phases"]) >= 3
        assert "next_priority" in data

    def test_pilot_phase_is_valid(self, auth_headers):
        """Pilot phase is one of the expected values."""
        r = requests.get(f"{BASE}/api/v1/pilot/status",
                        headers=auth_headers, timeout=15)
        assert r.status_code == 200
        phase = r.json().get("pilot_phase")
        assert phase in ["data_import", "operational_control", "intelligence", "optimization"]

    def test_pilot_scores_exist(self, auth_headers):
        """Pilot scores show operational, data quality, intelligence."""
        r = requests.get(f"{BASE}/api/v1/pilot/status",
                        headers=auth_headers, timeout=15)
        assert r.status_code == 200
        scores = r.json().get("scores", {})
        assert "operational_control" in scores
        assert "data_quality_score" in scores
        assert "intelligence_score" in scores
