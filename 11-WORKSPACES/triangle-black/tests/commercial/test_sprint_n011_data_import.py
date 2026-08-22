"""
Sprint N-011: Data Import Engine Verification Test Suite
"""
import pytest
import requests

BASE = "http://localhost:8030"

_C = {}
def _auth():
    if "h" not in _C:
        r = requests.post(
            f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        assert r.status_code == 200
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_data_import_schema_validation():
    h = _auth()
    
    # 1. Invalid CSV Header layout
    payload_bad_header = {
        "csv_content": "wrong_col,category,criticality\nChiller Unit A,HVAC,high"
    }
    r1 = requests.post(f"{BASE}/api/v1/data-import/assets", json=payload_bad_header, headers=h, timeout=10)
    assert r1.status_code == 200
    res1 = r1.json()
    assert res1["success"] is False
    assert "Missing required columns" in res1["errors"][0]

    # 2. Perfect CSV execution
    payload_ok = {
        "csv_content": "name,category,criticality\nChiller Unit X,HVAC,high\nWater Boiler Y,Plumbing,medium"
    }
    r2 = requests.post(f"{BASE}/api/v1/data-import/assets", json=payload_ok, headers=h, timeout=10)
    assert r2.status_code == 200
    res2 = r2.json()
    assert res2["success"] is True
    assert res2["imported_count"] == 2
