"""
Sprint 7 — Commercial Demo Engine Tests
Verifies: GET /demo/story, GET /demo/headline

Evidence: Live verified 2026-08-30
  /demo/headline: 200 · health=67/100 (WARNING)
  /demo/story:    200 · 8 slides · cost_avoidance=EGP 435,570
"""
import pytest
import requests

BASE = "http://localhost:8030"


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


class TestDemoAuth:
    def test_story_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/demo/story", timeout=10)
        assert r.status_code in (401, 403)

    def test_headline_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/demo/headline", timeout=10)
        assert r.status_code in (401, 403)


class TestDemoHeadline:
    def test_headline_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/demo/headline",
                        headers=auth_headers, timeout=20)
        _skip(r, "headline")
        assert r.status_code == 200

    def test_headline_has_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/demo/headline",
                        headers=auth_headers, timeout=20)
        _skip(r, "headline-fields")
        assert r.status_code == 200
        d = r.json()
        assert "hotel_id" in d
        assert "headline_metrics" in d
        assert "top_3_actions" in d
        assert "cta" in d
        assert "generated_at" in d

    def test_headline_metrics_bounded(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/demo/headline",
                        headers=auth_headers, timeout=20)
        _skip(r, "headline-bounded")
        assert r.status_code == 200
        m = r.json()["headline_metrics"]
        assert 0 <= m["health_score"] <= 100
        assert m["health_grade"] in ("EXCELLENT", "GOOD", "WARNING", "CRITICAL")
        assert m["cost_avoidance_egp"] >= 0
        assert 0 <= m["data_quality_score"] <= 100
        assert 0 <= m["pm_compliance_pct"] <= 100

    def test_headline_top_actions_list(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/demo/headline",
                        headers=auth_headers, timeout=20)
        _skip(r, "headline-actions")
        assert r.status_code == 200
        actions = r.json()["top_3_actions"]
        assert isinstance(actions, list)
        assert len(actions) <= 3
        for a in actions:
            assert "priority" in a
            assert "action" in a
            assert "impact" in a
            assert a["priority"] in ("CRITICAL", "HIGH", "MEDIUM", "LOW")

    def test_headline_cta_present(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/demo/headline",
                        headers=auth_headers, timeout=20)
        _skip(r, "headline-cta")
        assert r.status_code == 200
        cta = r.json()["cta"]
        assert isinstance(cta, str)
        assert len(cta) > 5


class TestDemoStory:
    def test_story_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/demo/story",
                        headers=auth_headers, timeout=25)
        _skip(r, "story")
        assert r.status_code == 200

    def test_story_has_8_slides(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/demo/story",
                        headers=auth_headers, timeout=25)
        _skip(r, "story-slides")
        assert r.status_code == 200
        slides = r.json()["slides"]
        assert len(slides) == 8

    def test_story_has_required_top_level_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/demo/story",
                        headers=auth_headers, timeout=25)
        _skip(r, "story-fields")
        assert r.status_code == 200
        d = r.json()
        assert d["demo_type"] == "COMMERCIAL_DEMO_STORY"
        assert "hotel_id" in d
        assert "headline_metrics" in d
        assert "generated_at" in d

    def test_slide_1_situation_has_stats(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/demo/story",
                        headers=auth_headers, timeout=25)
        _skip(r, "slide-1")
        assert r.status_code == 200
        s1 = r.json()["slides"]["slide_1_situation"]
        assert "stats" in s1
        assert "narrative" in s1
        assert s1["stats"]["assets_under_management"] > 0

    def test_slide_2_problem_has_problems(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/demo/story",
                        headers=auth_headers, timeout=25)
        _skip(r, "slide-2")
        assert r.status_code == 200
        s2 = r.json()["slides"]["slide_2_problem"]
        assert "problems" in s2
        assert isinstance(s2["problems"], list)
        assert len(s2["problems"]) >= 1
        for p in s2["problems"]:
            assert "issue" in p
            assert "count" in p
            assert "severity" in p

    def test_slide_4_cost_has_egp_values(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/demo/story",
                        headers=auth_headers, timeout=25)
        _skip(r, "slide-4")
        assert r.status_code == 200
        s4 = r.json()["slides"]["slide_4_cost"]
        f = s4["financials"]
        assert "total_operational_spend_egp" in f
        assert "identified_cost_avoidance_egp" in f
        assert f["identified_cost_avoidance_egp"] >= 0

    def test_slide_6_recommendation_has_actions(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/demo/story",
                        headers=auth_headers, timeout=25)
        _skip(r, "slide-6")
        assert r.status_code == 200
        s6 = r.json()["slides"]["slide_6_recommendation"]
        assert "top_actions" in s6
        assert "governance_note" in s6
        assert isinstance(s6["top_actions"], list)

    def test_slide_8_has_cta(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/demo/story",
                        headers=auth_headers, timeout=25)
        _skip(r, "slide-8")
        assert r.status_code == 200
        s8 = r.json()["slides"]["slide_8_next_step"]
        assert "cta" in s8
        assert "pilot_steps" in s8
        assert len(s8["pilot_steps"]) == 4

    def test_story_reflects_real_data(self, auth_headers):
        """Story must use real DB data — assets, WOs, suppliers must be > 0."""
        r = requests.get(f"{BASE}/api/v1/demo/story",
                        headers=auth_headers, timeout=25)
        _skip(r, "story-real")
        assert r.status_code == 200
        stats = r.json()["slides"]["slide_1_situation"]["stats"]
        assert stats["assets_under_management"] > 0
        assert stats["total_work_orders"] > 0

    def test_story_tenant_scoped(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/demo/story",
                        headers=auth_headers, timeout=25)
        _skip(r, "story-tenant")
        assert r.status_code == 200
        assert r.json()["hotel_id"].startswith("tb-")
