"""
Route Order Regression Tests
CRITICAL: FastAPI static routes MUST come before dynamic routes.
These tests prevent re-introduction of the /actionable route shadow bug.
"""
import pytest
import requests

BASE = "http://localhost:8030"


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


class TestRecommendationRouteOrder:
    """
    The critical test: /actionable and /outcomes/summary must NEVER
    be shadowed by /{rec_id} dynamic route.
    """

    def test_actionable_not_captured_as_rec_id(self, auth_headers):
        """GET /recommendations/actionable must return actionable list, not a rec detail."""
        r = requests.get(f"{BASE}/api/v1/recommendations/actionable",
                        headers=auth_headers, timeout=15)
        _skip(r, "actionable")
        assert r.status_code == 200
        d = r.json()
        # A rec detail would have 'director', 'evidence' etc.
        # /actionable response must have 'actionable_count' or 'items'
        assert "recommendation" not in d or "actionable_count" in d, \
            "ROUTE SHADOW BUG: /actionable is being captured as /{rec_id}"
        assert "actionable_count" in d or "items" in d, \
            f"Expected actionable response, got: {list(d.keys())[:5]}"

    def test_outcomes_summary_not_captured_as_rec_id(self, auth_headers):
        """GET /recommendations/outcomes/summary must return ROI funnel, not a rec detail."""
        r = requests.get(f"{BASE}/api/v1/recommendations/outcomes/summary",
                        headers=auth_headers, timeout=15)
        _skip(r, "outcomes-summary")
        assert r.status_code == 200
        d = r.json()
        assert "recommendation_funnel" in d or "outcome_verification" in d, \
            f"ROUTE SHADOW BUG: /outcomes/summary captured as rec_id. Got: {list(d.keys())[:5]}"

    def test_effectiveness_not_captured_as_rec_id(self, auth_headers):
        """GET /recommendations/effectiveness must return effectiveness data."""
        r = requests.get(f"{BASE}/api/v1/recommendations/effectiveness",
                        headers=auth_headers, timeout=15)
        _skip(r, "effectiveness")
        assert r.status_code == 200
        d = r.json()
        assert "summary" in d and "outcomes" in d, \
            f"ROUTE SHADOW BUG: /effectiveness captured as rec_id. Got: {list(d.keys())[:5]}"

    def test_dynamic_rec_id_still_works(self, auth_headers):
        """Dynamic /{rec_id} route must still work after static route ordering fix."""
        # Get a real rec ID first
        r = requests.get(f"{BASE}/api/v1/recommendations/?limit=1",
                        headers=auth_headers, timeout=15)
        _skip(r, "get-rec")
        assert r.status_code == 200
        recs = r.json().get("recommendations", [])
        if not recs:
            pytest.skip("No recommendations to test /{rec_id}")
        rec_id = recs[0]["id"]
        r2 = requests.get(f"{BASE}/api/v1/recommendations/{rec_id}",
                         headers=auth_headers, timeout=15)
        _skip(r2, "rec-by-id")
        assert r2.status_code == 200
        assert r2.json()["id"] == rec_id

    def test_fastapi_registered_routes_order(self):
        """
        Verify FastAPI's actual registered route order via inspection.
        Static routes MUST appear before dynamic routes.
        """
        import sys, os
        sys.path.insert(0, ".")
        os.environ.setdefault("TB_SECRET_KEY", "test")
        os.environ.setdefault("DATABASE_URL",
            "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black")
        from src.main import app
        
        rec_routes = []
        for route in app.routes:
            path = getattr(route, "path", "")
            if "/recommendations" in path and "/api/v1/" in path:
                is_dynamic = "{" in path
                rec_routes.append((path, is_dynamic))
        
        first_dynamic_pos = None
        for i, (path, is_dynamic) in enumerate(rec_routes):
            if is_dynamic and first_dynamic_pos is None:
                first_dynamic_pos = i
        
        if first_dynamic_pos is None:
            pytest.skip("No dynamic routes found")
        
        # Check that all static routes appear before first dynamic
        late_statics = [(i, path) for i, (path, is_dynamic) in enumerate(rec_routes)
                        if not is_dynamic and i > first_dynamic_pos]
        
        assert not late_statics, \
            f"ROUTE ORDER BUG: Static routes after dynamic route: {late_statics}"


class TestCanonicalMetricRegistry:
    def test_canonical_metrics_endpoint(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/pilot/metrics/canonical",
                        headers=auth_headers, timeout=20)
        _skip(r, "canonical-metrics")
        assert r.status_code == 200
        d = r.json()
        assert "metrics" in d
        metrics = d["metrics"]
        assert "wo_asset_linkage" in metrics
        assert "pm_asset_linkage" in metrics
        assert "pm_compliance" in metrics
        assert "rec_acceptance_rate" in metrics
        assert "rec_outcome_rate" in metrics

    def test_each_metric_has_confidence(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/pilot/metrics/canonical",
                        headers=auth_headers, timeout=20)
        _skip(r, "metric-confidence")
        assert r.status_code == 200
        for name, metric in r.json()["metrics"].items():
            assert "confidence" in metric, f"Metric {name} missing confidence"
            assert "value" in metric, f"Metric {name} missing value"
            assert "calculated_at" in metric, f"Metric {name} missing calculated_at"


class TestAttentionLifecycle:
    def test_lifecycle_endpoint(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/pilot/attention/lifecycle",
                        headers=auth_headers, timeout=10)
        _skip(r, "attention-lifecycle")
        assert r.status_code == 200
        d = r.json()
        assert "open_items" in d
        assert "lifecycle_metrics" in d

    def test_create_and_transition_p0_item(self, auth_headers):
        import requests as req
        # Create
        r1 = req.post(f"{BASE}/api/v1/pilot/attention/item",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"priority": "P0", "title": "Test P0 Item — Route Regression"},
            timeout=10)
        _skip(r1, "create-attention")
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1.get("success") is True
        item_id = d1.get("item_id")
        assert item_id

        # Acknowledge
        r2 = req.post(f"{BASE}/api/v1/pilot/attention/item/{item_id}/transition",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"status": "ACKNOWLEDGED"},
            timeout=10)
        _skip(r2, "ack-attention")
        assert r2.status_code == 200
        assert r2.json().get("to_status") == "ACKNOWLEDGED"


class TestDataProvenance:
    def test_provenance_endpoint(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/pilot/metrics/provenance",
                        headers=auth_headers, timeout=30)
        _skip(r, "provenance")
        assert r.status_code == 200
        d = r.json()
        assert "classification" in d
        assert "real_linkage" in d

    def test_provenance_has_real_count(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/pilot/metrics/provenance",
                        headers=auth_headers, timeout=30)
        _skip(r, "provenance-real")
        assert r.status_code == 200
        classification = r.json()["classification"]["classification"]
        assert "REAL" in classification
        assert classification["REAL"] > 0, "Should have some REAL WOs"
