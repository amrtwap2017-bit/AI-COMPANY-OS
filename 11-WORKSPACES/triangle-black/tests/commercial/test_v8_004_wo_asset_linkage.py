"""
V8-004 — WO Asset Linkage Enforcement Tests
Platform must encourage (soft) and eventually require (hard) asset linkage.

Strategy:
  SOFT: Warning on WO creation without asset
  HARD: Block transition to in_progress without asset
"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def _get_asset_id(auth_headers) -> str:
    from sqlalchemy import create_engine, text
    engine = create_engine("postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black")
    with engine.connect() as conn:
        row = conn.execute(text(
            "SELECT id FROM assets WHERE hotel_id='tb-default-hotel-000000000001' LIMIT 1"
        )).fetchone()
        return row[0] if row else ""

class TestWOCreationWarning:
    def test_wo_creation_requires_auth(self):
        r = requests.post(f"{BASE}/api/v1/work-orders/",
                         json={"title": "test"}, timeout=5)
        assert r.status_code in (401, 403)

    def test_wo_without_asset_gets_warning(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/work-orders/",
                         headers=auth_headers,
                         json={"title": "Test no asset V8-004",
                               "priority": "medium",
                               "hotel_id": "tb-default-hotel-000000000001"},
                         timeout=10)
        _skip(r, "wo-create")
        assert r.status_code in (200, 201), f"WO creation failed: {r.text[:100]}"
        d = r.json()
        assert "data_quality_warning" in d, \
            "WO without asset must include data_quality_warning"
        assert "MTTR" in d["data_quality_warning"] or "asset" in d["data_quality_warning"].lower()
        assert d.get("asset_linkage_required") is True
        # Cleanup
        wo_id = d.get("id", "")
        if wo_id:
            requests.delete(f"{BASE}/api/v1/work-orders/{wo_id}",
                          headers=auth_headers, timeout=5)

    def test_wo_with_asset_no_warning(self, auth_headers):
        asset_id = _get_asset_id(auth_headers)
        if not asset_id:
            pytest.skip("No assets found")
        r = requests.post(f"{BASE}/api/v1/work-orders/",
                         headers=auth_headers,
                         json={"title": "Test with asset V8-004",
                               "priority": "medium",
                               "hotel_id": "tb-default-hotel-000000000001",
                               "asset_id": asset_id},
                         timeout=10)
        _skip(r, "wo-create-asset")
        assert r.status_code in (200, 201)
        d = r.json()
        assert d.get("asset_linkage_required") is not True, \
            "WO with asset should NOT have asset_linkage_required=True"
        # Cleanup
        wo_id = d.get("id", "")
        if wo_id:
            requests.delete(f"{BASE}/api/v1/work-orders/{wo_id}",
                          headers=auth_headers, timeout=5)

class TestTransitionAssetEnforcement:
    def test_in_progress_without_asset_blocked(self, auth_headers):
        """Cannot move to in_progress without asset — hard enforcement."""
        # Create WO without asset
        r = requests.post(f"{BASE}/api/v1/work-orders/",
                         headers=auth_headers,
                         json={"title": "Transition test V8-004",
                               "hotel_id": "tb-default-hotel-000000000001"},
                         timeout=10)
        _skip(r, "create")
        if r.status_code not in (200, 201):
            pytest.skip("Could not create test WO")
        wo_id = r.json().get("id", "")
        if not wo_id:
            pytest.skip("No WO id returned")

        try:
            # Try to transition to in_progress — must be blocked
            r2 = requests.post(f"{BASE}/api/v1/work-orders/{wo_id}/transition",
                              headers=auth_headers,
                              json={"to_state": "in_progress"},
                              timeout=10)
            _skip(r2, "transition")
            assert r2.status_code == 422, \
                f"in_progress without asset must return 422, got {r2.status_code}"
            d = r2.json()
            detail = d.get("detail", {})
            if isinstance(detail, dict):
                assert detail.get("code") == "ASSET_REQUIRED"
        finally:
            requests.delete(f"{BASE}/api/v1/work-orders/{wo_id}",
                          headers=auth_headers, timeout=5)

    def test_in_progress_with_asset_allowed(self, auth_headers):
        """Can move to in_progress when asset is linked."""
        asset_id = _get_asset_id(auth_headers)
        if not asset_id:
            pytest.skip("No assets found")
        r = requests.post(f"{BASE}/api/v1/work-orders/",
                         headers=auth_headers,
                         json={"title": "Transition+asset V8-004",
                               "hotel_id": "tb-default-hotel-000000000001",
                               "asset_id": asset_id},
                         timeout=10)
        _skip(r, "create-asset")
        if r.status_code not in (200, 201):
            pytest.skip("Could not create test WO with asset")
        wo_id = r.json().get("id", "")
        if not wo_id:
            pytest.skip("No WO id")
        try:
            r2 = requests.post(f"{BASE}/api/v1/work-orders/{wo_id}/transition",
                              headers=auth_headers,
                              json={"to_state": "in_progress"},
                              timeout=10)
            _skip(r2, "transition-asset")
            # Should NOT be 422 (may be 200 or other valid transition response)
            assert r2.status_code != 422, \
                f"WO with asset should not be blocked from in_progress"
        finally:
            requests.delete(f"{BASE}/api/v1/work-orders/{wo_id}",
                          headers=auth_headers, timeout=5)

class TestDataQualityImpact:
    def test_data_quality_warning_has_correct_fields(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/work-orders/",
                         headers=auth_headers,
                         json={"title": "DQ test V8-004",
                               "hotel_id": "tb-default-hotel-000000000001"},
                         timeout=10)
        _skip(r, "dq")
        if r.status_code not in (200, 201):
            pytest.skip("Could not create WO")
        d = r.json()
        wo_id = d.get("id", "")
        try:
            assert "data_quality_warning" in d
            assert "asset_linkage_required" in d
        finally:
            if wo_id:
                requests.delete(f"{BASE}/api/v1/work-orders/{wo_id}",
                              headers=auth_headers, timeout=5)
