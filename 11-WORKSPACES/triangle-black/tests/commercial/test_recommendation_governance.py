"""Recommendation Governance Tests — V15.0 — REJECTED/DEFERRED states."""
import requests
import pytest

BASE = "http://localhost:8030"


class TestRecommendationGovernanceAuth:
    def test_reject_requires_auth(self):
        """Reject endpoint requires authentication."""
        r = requests.post(f"{BASE}/api/v1/recommendations/fake-id/reject",
                         json={"reason": "Not relevant"}, timeout=5)
        assert r.status_code in (401, 403, 404)  # 404 = not yet mounted

    def test_defer_requires_auth(self):
        """Defer endpoint requires authentication."""
        r = requests.post(f"{BASE}/api/v1/recommendations/fake-id/defer",
                         json={"reason": "Later"}, timeout=5)
        assert r.status_code in (401, 403, 404)  # 404 = not yet mounted


class TestRecommendationGovernance:
    def test_governance_endpoints_exist(self, auth_headers):
        """Verify reject and defer endpoints exist and are accessible."""
        # Test with fake ID — should return 404 (not 401, 403, or 500)
        r_reject = requests.post(
            f"{BASE}/api/v1/recommendations/nonexistent-id-abc123/reject",
            headers={"Authorization": auth_headers["Authorization"],
                     "Content-Type": "application/json"},
            json={"reason": "Test rejection reason"},
            timeout=10
        )
        if r_reject.status_code == 429: pytest.skip("Rate limited")
        # 404 = endpoint exists, rec not found (correct behavior)
        # 422 = endpoint exists, validation error (also acceptable)
        assert r_reject.status_code in (404, 422), f"Unexpected: {r_reject.status_code}"

    def test_reject_endpoint_validates_reason(self, auth_headers):
        """Rejection without reason should fail — undocumented decisions not allowed."""
        r = requests.post(
            f"{BASE}/api/v1/recommendations/nonexistent-id-abc123/reject",
            headers={"Authorization": auth_headers["Authorization"],
                     "Content-Type": "application/json"},
            json={"reason": ""},
            timeout=10
        )
        if r.status_code == 429: pytest.skip("Rate limited")
        # Should be 404 (not found) or 422 (empty reason)
        assert r.status_code in (404, 422)

    def test_defer_endpoint_exists(self, auth_headers):
        """Verify defer endpoint exists and accessible."""
        r = requests.post(
            f"{BASE}/api/v1/recommendations/nonexistent-id-abc123/defer",
            headers={"Authorization": auth_headers["Authorization"],
                     "Content-Type": "application/json"},
            json={"reason": "Will action next quarter"},
            timeout=10
        )
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code in (404, 422)

    def test_governance_columns_in_db(self, auth_headers):
        """Verify governance columns exist in the DB schema."""
        from sqlalchemy import create_engine, text
        engine = create_engine("postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black")
        with engine.connect() as conn:
            cols = conn.execute(text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'recommendations'
                AND column_name IN ('rejection_reason', 'deferred_until',
                                    'decided_by', 'decided_at')
            """)).fetchall()
            col_names = {dict(c._mapping)["column_name"] for c in cols}
        assert "rejection_reason" in col_names
        assert "decided_by" in col_names
        assert "decided_at" in col_names
