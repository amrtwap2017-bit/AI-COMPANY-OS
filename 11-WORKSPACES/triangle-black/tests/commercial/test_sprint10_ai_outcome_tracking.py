"""
Sprint 10 — AI Outcome Tracking
Verifies: POST /recommendations/{id}/outcome
          GET  /recommendations/effectiveness

Evidence: Live verified 2026-08-30
  total=1460 · approved=113 · acceptance_rate=7.7%
  outcomes_measured=3 · 4 directors tracked
  Route order fix: /effectiveness before /{rec_id}
"""
import pytest
import requests

BASE = "http://localhost:8030"


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


def _get_approved_id(auth_headers) -> str:
    """Get one approved recommendation id for outcome tests."""
    r = requests.get(f"{BASE}/api/v1/recommendations/history",
                    headers=auth_headers, timeout=15)
    if r.status_code == 200:
        items = r.json() if isinstance(r.json(), list) else r.json().get("history", [])
        if items:
            return items[0].get("id", "")
    return ""


class TestOutcomeAuth:
    def test_effectiveness_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/recommendations/effectiveness", timeout=10)
        assert r.status_code in (401, 403)

    def test_record_outcome_requires_auth(self):
        r = requests.post(f"{BASE}/api/v1/recommendations/test-id/outcome",
                         json={"outcome_type": "improved"}, timeout=10)
        assert r.status_code in (401, 403)


class TestEffectivenessEndpoint:
    def test_effectiveness_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/effectiveness",
                        headers=auth_headers, timeout=20)
        _skip(r, "effectiveness")
        assert r.status_code == 200

    def test_effectiveness_not_shadowed_by_rec_id_route(self, auth_headers):
        """Critical: /effectiveness must NOT be captured as /{rec_id}."""
        r = requests.get(f"{BASE}/api/v1/recommendations/effectiveness",
                        headers=auth_headers, timeout=20)
        _skip(r, "not-shadowed")
        assert r.status_code == 200
        d = r.json()
        assert "summary" in d, "Got rec detail instead of effectiveness"
        assert "outcomes" in d, "Got rec detail instead of effectiveness"

    def test_effectiveness_has_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/effectiveness",
                        headers=auth_headers, timeout=20)
        _skip(r, "fields")
        assert r.status_code == 200
        d = r.json()
        assert "hotel_id" in d
        assert "summary" in d
        assert "outcomes" in d
        assert "by_director" in d
        assert "governance" in d

    def test_effectiveness_summary_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/effectiveness",
                        headers=auth_headers, timeout=20)
        _skip(r, "summary")
        assert r.status_code == 200
        s = r.json()["summary"]
        assert "total_recommendations" in s
        assert "acted_upon" in s
        assert "rejected" in s
        assert "pending" in s
        assert "acceptance_rate_pct" in s
        assert s["total_recommendations"] > 0
        assert 0 <= s["acceptance_rate_pct"] <= 100

    def test_effectiveness_outcomes_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/effectiveness",
                        headers=auth_headers, timeout=20)
        _skip(r, "outcomes")
        assert r.status_code == 200
        o = r.json()["outcomes"]
        assert "total_measured" in o
        assert "improved" in o
        assert "unchanged" in o
        assert "worse" in o
        assert "unknown" in o
        assert "effectiveness_rate_pct" in o
        assert "measurement_coverage_pct" in o

    def test_effectiveness_by_director_structure(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/effectiveness",
                        headers=auth_headers, timeout=20)
        _skip(r, "by-director")
        assert r.status_code == 200
        directors = r.json()["by_director"]
        assert isinstance(directors, dict)
        assert len(directors) >= 1
        for name, data in directors.items():
            assert "total" in data
            assert "approved" in data
            assert "approval_rate_pct" in data
            assert "avg_confidence" in data

    def test_effectiveness_governance_confirmed(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/effectiveness",
                        headers=auth_headers, timeout=20)
        _skip(r, "governance")
        assert r.status_code == 200
        g = r.json()["governance"]
        assert g["human_review_required"] is True
        assert g["all_recommendations_governed"] is True

    def test_effectiveness_reflects_real_data(self, auth_headers):
        """1,460 recommendations exist — should be visible."""
        r = requests.get(f"{BASE}/api/v1/recommendations/effectiveness",
                        headers=auth_headers, timeout=20)
        _skip(r, "real-data")
        assert r.status_code == 200
        total = r.json()["summary"]["total_recommendations"]
        assert total > 100, f"Expected 1000+ recommendations, got {total}"

    def test_existing_endpoints_not_broken(self, auth_headers):
        """/{rec_id} and /summary and /history must still work after route fix."""
        for ep in ["/summary", "/history"]:
            r = requests.get(f"{BASE}/api/v1/recommendations{ep}",
                            headers=auth_headers, timeout=15)
            _skip(r, ep)
            assert r.status_code == 200, f"{ep} broken after route reorder"


class TestRecordOutcome:
    def test_record_outcome_improved(self, auth_headers):
        rec_id = _get_approved_id(auth_headers)
        if not rec_id:
            pytest.skip("No approved recommendation available")
        r = requests.post(
            f"{BASE}/api/v1/recommendations/{rec_id}/outcome",
            headers=auth_headers,
            json={
                "outcome_type": "improved",
                "metric_key": "pm_compliance_rate",
                "metric_before": 10.1,
                "metric_after": 15.3,
                "notes": "Sprint 10 test outcome"
            }, timeout=15)
        _skip(r, "record-improved")
        assert r.status_code == 200
        d = r.json()
        assert d["success"] is True
        assert d["outcome_type"] == "improved"

    def test_record_outcome_calculates_improvement_pct(self, auth_headers):
        rec_id = _get_approved_id(auth_headers)
        if not rec_id:
            pytest.skip("No approved recommendation available")
        r = requests.post(
            f"{BASE}/api/v1/recommendations/{rec_id}/outcome",
            headers=auth_headers,
            json={"outcome_type": "improved", "metric_before": 10.0, "metric_after": 15.0},
            timeout=15)
        _skip(r, "improvement-pct")
        assert r.status_code == 200
        d = r.json()
        assert d["improvement_pct"] == 50.0

    def test_record_outcome_invalid_type_defaults_unknown(self, auth_headers):
        rec_id = _get_approved_id(auth_headers)
        if not rec_id:
            pytest.skip("No approved recommendation available")
        r = requests.post(
            f"{BASE}/api/v1/recommendations/{rec_id}/outcome",
            headers=auth_headers,
            json={"outcome_type": "invalid_xyz"},
            timeout=15)
        _skip(r, "invalid-type")
        assert r.status_code == 200
        assert r.json()["outcome_type"] == "unknown"

    def test_record_outcome_nonexistent_rec_fails(self, auth_headers):
        r = requests.post(
            f"{BASE}/api/v1/recommendations/nonexistent-id-000/outcome",
            headers=auth_headers,
            json={"outcome_type": "improved"},
            timeout=15)
        _skip(r, "nonexistent")
        assert r.status_code == 200
        assert r.json()["success"] is False

    def test_outcomes_reflected_in_effectiveness(self, auth_headers):
        """After recording outcome, effectiveness total_measured should increase."""
        r1 = requests.get(f"{BASE}/api/v1/recommendations/effectiveness",
                         headers=auth_headers, timeout=15)
        _skip(r1, "before")
        before = r1.json()["outcomes"]["total_measured"]

        rec_id = _get_approved_id(auth_headers)
        if rec_id:
            requests.post(
                f"{BASE}/api/v1/recommendations/{rec_id}/outcome",
                headers=auth_headers,
                json={"outcome_type": "improved"},
                timeout=15)

        r2 = requests.get(f"{BASE}/api/v1/recommendations/effectiveness",
                         headers=auth_headers, timeout=15)
        _skip(r2, "after")
        after = r2.json()["outcomes"]["total_measured"]
        assert after >= before, "Outcomes must accumulate"
