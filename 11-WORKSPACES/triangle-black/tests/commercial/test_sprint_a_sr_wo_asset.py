"""
Sprint A: SR→WO Asset Passthrough Tests
Verifies that asset_id is correctly carried from SR to created WO.
"""
import pytest
import requests
import json
import subprocess

BASE = "http://localhost:8030"

def get_token():
    r = subprocess.run(
        ['curl','-s','-X','POST',f'{BASE}/api/v1/auth/login/json',
         '-H','Content-Type: application/json',
         '-d','{"email":"amr@triangleblack.com","password":"admin123"}'],
        capture_output=True, text=True)
    try:
        return json.loads(r.stdout).get("access_token","")
    except:
        return ""

@pytest.fixture(scope="module")
def auth_headers():
    tok = get_token()
    if not tok:
        pytest.skip("Server not available")
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}

@pytest.fixture(scope="module")
def first_asset_id(auth_headers):
    r = requests.get(f"{BASE}/api/v1/assets/?limit=1", headers=auth_headers, timeout=10)
    if r.status_code != 200: return None
    data = r.json()
    items = data if isinstance(data, list) else data.get("items", data.get("assets", []))
    return items[0]["id"] if items else None

class TestSRtoWOAssetPassthrough:
    def test_sr_with_asset_creates_linked_wo(self, auth_headers, first_asset_id):
        """Sprint A: SR with asset_id must create WO with same asset_id."""
        if not first_asset_id:
            pytest.skip("No assets available")

        # Create SR with asset
        r_sr = requests.post(f"{BASE}/api/v1/service-requests/",
                            headers=auth_headers,
                            json={"title": "SprintA test", "description": "test",
                                  "category": "HVAC", "urgency": "high",
                                  "asset_id": first_asset_id},
                            timeout=10)
        assert r_sr.status_code in (200, 201), f"SR creation failed: {r_sr.text[:100]}"
        sr_id = r_sr.json().get("id")
        assert sr_id

        # Convert to WO
        r_wo = requests.post(f"{BASE}/api/v1/service-requests/{sr_id}/convert-to-wo",
                            headers=auth_headers, timeout=10)
        assert r_wo.status_code in (200, 201), f"Conversion failed: {r_wo.text[:100]}"
        wo_id = r_wo.json().get("work_order_id")
        assert wo_id

        # Verify WO has asset_id
        r_check = requests.get(f"{BASE}/api/v1/work-orders/{wo_id}",
                              headers=auth_headers, timeout=10)
        assert r_check.status_code == 200
        wo = r_check.json()
        assert wo.get("asset_id") == first_asset_id, \
            f"Asset not passed through: WO.asset_id={wo.get('asset_id')}, SR.asset_id={first_asset_id}"

    def test_sr_without_asset_creates_unlinked_wo(self, auth_headers):
        """SR without asset_id should create WO without asset (no fabrication)."""
        r_sr = requests.post(f"{BASE}/api/v1/service-requests/",
                            headers=auth_headers,
                            json={"title": "No-asset SR", "description": "test",
                                  "category": "general", "urgency": "normal"},
                            timeout=10)
        assert r_sr.status_code in (200, 201)
        sr_id = r_sr.json().get("id")

        r_wo = requests.post(f"{BASE}/api/v1/service-requests/{sr_id}/convert-to-wo",
                            headers=auth_headers, timeout=10)
        if r_wo.status_code in (200, 201):
            wo_id = r_wo.json().get("work_order_id")
            r_check = requests.get(f"{BASE}/api/v1/work-orders/{wo_id}",
                                  headers=auth_headers, timeout=10)
            if r_check.status_code == 200:
                # WO should NOT have a fabricated asset_id
                wo = r_check.json()
                assert wo.get("asset_id") is None, \
                    "WO should not have asset when SR had none"
