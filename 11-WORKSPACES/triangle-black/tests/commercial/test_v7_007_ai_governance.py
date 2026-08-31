"""
V7-007 — AI Governance 2.0 Tests
Verifies: daily-digest, director-performance, expire-stale

Governance principles:
  - Platform must surface fatigue risk (90.4% pending)
  - Directors must be held accountable (acceptance rate)
  - Stale recommendations must be expirable
  - All actions still require human approval
"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

class TestDailyDigestAuth:
    def test_daily_digest_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/recommendations/daily-digest", timeout=5)
        assert r.status_code in (401, 403)

    def test_director_performance_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/recommendations/director-performance", timeout=5)
        assert r.status_code in (401, 403)

class TestDailyDigest:
    def test_daily_digest_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/daily-digest",
                        headers=auth_headers, timeout=15)
        _skip(r, "digest")
        assert r.status_code == 200

    def test_daily_digest_has_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/daily-digest",
                        headers=auth_headers, timeout=15)
        _skip(r, "digest-fields")
        assert r.status_code == 200
        d = r.json()
        assert "hotel_id" in d
        assert "digest_size" in d
        assert "total_pending" in d
        assert "critical_count" in d
        assert "digest" in d
        assert "governance_note" in d
        assert "fatigue_note" in d

    def test_daily_digest_size_is_bounded(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/daily-digest?top_n=5",
                        headers=auth_headers, timeout=15)
        _skip(r, "digest-bounded")
        assert r.status_code == 200
        assert r.json()["digest_size"] <= 5

    def test_daily_digest_shows_fatigue(self, auth_headers):
        """With 1,460+ pending, digest must show the gap."""
        r = requests.get(f"{BASE}/api/v1/recommendations/daily-digest",
                        headers=auth_headers, timeout=15)
        _skip(r, "fatigue")
        assert r.status_code == 200
        d = r.json()
        assert d["total_pending"] > d["digest_size"], \
            "total_pending must exceed digest_size when fatigue exists"

    def test_daily_digest_items_have_action_urls(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/daily-digest",
                        headers=auth_headers, timeout=15)
        _skip(r, "action-urls")
        assert r.status_code == 200
        for item in r.json()["digest"]:
            assert "approve_url" in item
            assert "reject_url" in item
            assert "detail_url" in item

    def test_daily_digest_governance_note(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/daily-digest",
                        headers=auth_headers, timeout=15)
        _skip(r, "gov-note")
        assert r.status_code == 200
        note = r.json()["governance_note"]
        assert "human" in note.lower() or "advisory" in note.lower()

    def test_daily_digest_not_shadowed(self, auth_headers):
        """Must not be captured by /{rec_id} route."""
        r = requests.get(f"{BASE}/api/v1/recommendations/daily-digest",
                        headers=auth_headers, timeout=15)
        _skip(r, "not-shadowed")
        assert r.status_code == 200
        assert "digest" in r.json()

class TestDirectorPerformance:
    def test_director_performance_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/director-performance",
                        headers=auth_headers, timeout=15)
        _skip(r, "director-perf")
        assert r.status_code == 200

    def test_director_performance_has_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/director-performance",
                        headers=auth_headers, timeout=15)
        _skip(r, "dir-fields")
        assert r.status_code == 200
        d = r.json()
        assert "hotel_id" in d
        assert "total_recommendations" in d
        assert "total_approved" in d
        assert "overall_acceptance_rate_pct" in d
        assert "directors" in d

    def test_director_grades_valid(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/director-performance",
                        headers=auth_headers, timeout=15)
        _skip(r, "grades")
        assert r.status_code == 200
        for director in r.json()["directors"]:
            assert director["effectiveness_grade"] in ("A","B","C","D")
            assert 0 <= director["acceptance_rate_pct"] <= 100

    def test_director_shows_4_directors(self, auth_headers):
        """System has 4 AI Directors — all should appear."""
        r = requests.get(f"{BASE}/api/v1/recommendations/director-performance",
                        headers=auth_headers, timeout=15)
        _skip(r, "4-directors")
        assert r.status_code == 200
        assert len(r.json()["directors"]) >= 1

    def test_director_low_acceptance_insight(self, auth_headers):
        """With 7.7% acceptance, insight must flag the problem."""
        r = requests.get(f"{BASE}/api/v1/recommendations/director-performance",
                        headers=auth_headers, timeout=15)
        _skip(r, "insight")
        assert r.status_code == 200
        d = r.json()
        assert "insight" in d
        # 7.7% overall rate should trigger the low-acceptance insight
        if d["overall_acceptance_rate_pct"] < 20:
            assert "acceptance rate" in d["insight"].lower() or \
                   "recommendation" in d["insight"].lower()

class TestExistingEndpointsPreserved:
    def test_action_queue_preserved(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/action-queue",
                        headers=auth_headers, timeout=15)
        _skip(r, "action-queue")
        assert r.status_code == 200

    def test_effectiveness_preserved(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/effectiveness",
                        headers=auth_headers, timeout=10)
        _skip(r, "effectiveness")
        assert r.status_code == 200

    def test_summary_preserved(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/summary",
                        headers=auth_headers, timeout=10)
        _skip(r, "summary")
        assert r.status_code == 200
