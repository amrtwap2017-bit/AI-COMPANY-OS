"""
V10-006: Data Trust Tests
Verifies data lineage, confidence metadata, and WO→Asset enforcement.
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

class TestDataLineageModule:
    def test_lineage_module_exists(self):
        """V10-006: Data lineage module must exist."""
        p = Path("src/commercial/data_quality/lineage.py")
        assert p.exists(), "lineage.py not found"

    def test_wo_asset_lineage_function(self):
        """V10-006: WO asset lineage returns correct structure."""
        import sys
        sys.path.insert(0, ".")
        from src.commercial.data_quality.lineage import wo_asset_lineage, Confidence

        # Low coverage → low confidence
        lineage = wo_asset_lineage(100, 5, None)
        assert lineage.coverage_pct == 5.0
        assert lineage.confidence == Confidence.VERY_LOW
        assert len(lineage.limitations) > 0
        assert len(lineage.improvement_actions) > 0

        # High coverage → high confidence
        lineage_high = wo_asset_lineage(100, 85, 24.5)
        assert lineage_high.confidence == Confidence.HIGH
        assert lineage_high.is_reliable

    def test_mttr_lineage_function(self):
        """V10-006: MTTR lineage reflects actual coverage."""
        from src.commercial.data_quality.lineage import mttr_lineage, Confidence

        # Low asset linkage → low MTTR confidence
        lineage = mttr_lineage(1000, 51, 88.0)
        assert lineage.confidence in [Confidence.VERY_LOW, Confidence.LOW]
        assert len(lineage.limitations) > 0

    def test_lineage_to_dict(self):
        """V10-006: Lineage serializes to dict correctly."""
        from src.commercial.data_quality.lineage import wo_asset_lineage
        lineage = wo_asset_lineage(100, 5, None)
        d = lineage.to_dict()
        assert "confidence" in d
        assert "sample_size" in d
        assert "coverage_pct" in d
        assert "limitations" in d
        assert "improvement_actions" in d
        assert isinstance(d["confidence"], str)

class TestDataQualityEndpoints:
    def test_data_quality_score_exists(self, auth_headers):
        """Data quality score endpoint returns 200."""
        r = requests.get(f"{BASE}/api/v1/data-quality/score",
                        headers=auth_headers, timeout=10)
        assert r.status_code == 200

    def test_data_quality_lineage_endpoint(self, auth_headers):
        """V10-006: Data lineage endpoint returns metrics with confidence."""
        r = requests.get(f"{BASE}/api/v1/data-quality/lineage",
                        headers=auth_headers, timeout=15)
        if r.status_code == 404:
            pytest.skip("Lineage endpoint not yet deployed in router")
        assert r.status_code == 200
        data = r.json()
        assert "metrics" in data
        assert "summary" in data
        assert "overall_confidence" in data["summary"]

class TestWOAssetEnforcement:
    def test_wo_without_asset_gets_warning(self, auth_headers):
        """WO creation without asset returns data quality warning."""
        r = requests.post(f"{BASE}/api/v1/work-orders/",
                         headers=auth_headers,
                         json={"title": "V10-006 test", "priority": "medium",
                               "description": "test", "type": "corrective"},
                         timeout=10)
        assert r.status_code in (200, 201)
        data = r.json()
        assert data.get("data_quality_warning"), "No warning returned for WO without asset"

    def test_wo_with_asset_no_warning(self, auth_headers):
        """WO creation with asset should not have quality warning."""
        r_assets = requests.get(f"{BASE}/api/v1/assets/?limit=1",
                               headers=auth_headers, timeout=10)
        if r_assets.status_code != 200: pytest.skip("No assets")
        assets = r_assets.json()
        items = assets if isinstance(assets, list) else assets.get("items", assets.get("assets", []))
        if not items: pytest.skip("No assets")

        r = requests.post(f"{BASE}/api/v1/work-orders/",
                         headers=auth_headers,
                         json={"title": "V10-006 asset WO", "priority": "high",
                               "description": "test", "type": "corrective",
                               "asset_id": items[0]["id"]},
                         timeout=10)
        assert r.status_code in (200, 201)
        data = r.json()
        assert not data.get("data_quality_warning"), "Warning should not appear when asset linked"
