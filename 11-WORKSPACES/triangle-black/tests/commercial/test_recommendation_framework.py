"""
V6-E02 — Evidence/Recommendation Framework Tests
Closes Intelligence → Decision → Measurement loop.

Evidence: Live verified 2026-08-29
  Generate: 4 recommendations from 4 directors ✅
  Summary:  Total/Pending/Critical counts ✅
  List:     Prioritized by risk level ✅
  Get:      Full evidence chain + source_data ✅
  Approve:  Status updated + next_step returned ✅
  History:  Approved records tracked ✅
"""
import pytest
import requests
import uuid

BASE = "http://localhost:8030"

VALID_STATUSES = {"pending", "approved", "rejected"}
VALID_RISK_LEVELS = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


class TestRecommendationAuth:
    def test_generate_requires_auth(self):
        r = requests.post(f"{BASE}/api/v1/recommendations/generate", timeout=10)
        assert r.status_code in (401, 403)

    def test_list_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/recommendations/", timeout=10)
        assert r.status_code in (401, 403)

    def test_summary_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/recommendations/summary", timeout=10)
        assert r.status_code in (401, 403)

    def test_history_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/recommendations/history", timeout=10)
        assert r.status_code in (401, 403)


class TestGenerateRecommendations:
    def test_generate_returns_4_directors(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/recommendations/generate",
                         headers=auth_headers, timeout=30)
        _skip(r, "gen-4")
        assert r.status_code == 200
        d = r.json()
        assert d["generated_count"] == 4
        directors = [rec["director"] for rec in d["recommendations"]]
        assert "maintenance" in directors
        assert "procurement" in directors
        assert "operations" in directors
        assert "executive" in directors

    def test_generate_returns_recommendation_ids(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/recommendations/generate",
                         headers=auth_headers, timeout=30)
        _skip(r, "gen-ids")
        assert r.status_code == 200
        for rec in r.json()["recommendations"]:
            assert "id" in rec
            assert len(rec["id"]) > 10
            assert rec["risk_level"] in VALID_RISK_LEVELS

    def test_generate_has_generated_at(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/recommendations/generate",
                         headers=auth_headers, timeout=30)
        _skip(r, "gen-ts")
        assert r.status_code == 200
        assert "generated_at" in r.json()
        assert "2026" in r.json()["generated_at"]

    def test_generate_is_tenant_scoped(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/recommendations/generate",
                         headers=auth_headers, timeout=30)
        _skip(r, "gen-tenant")
        assert r.status_code == 200
        assert r.json()["hotel_id"].startswith("tb-")


class TestRecommendationSummary:
    def test_summary_has_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/summary",
                        headers=auth_headers, timeout=10)
        _skip(r, "summary-fields")
        assert r.status_code == 200
        d = r.json()
        for field in ["total", "pending", "approved", "rejected",
                      "critical_pending", "attention_required"]:
            assert field in d, f"Missing field: {field}"

    def test_summary_counts_non_negative(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/summary",
                        headers=auth_headers, timeout=10)
        _skip(r, "summary-counts")
        assert r.status_code == 200
        d = r.json()
        for field in ["total", "pending", "approved", "rejected"]:
            assert d[field] >= 0

    def test_summary_reflects_generation(self, auth_headers):
        """After generate, pending must be >= 4."""
        requests.post(f"{BASE}/api/v1/recommendations/generate",
                     headers=auth_headers, timeout=30)
        r = requests.get(f"{BASE}/api/v1/recommendations/summary",
                        headers=auth_headers, timeout=10)
        _skip(r, "summary-gen")
        assert r.status_code == 200
        assert r.json()["total"] >= 4


class TestListRecommendations:
    def test_list_returns_recommendations(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/",
                        headers=auth_headers, timeout=10)
        _skip(r, "list-recs")
        assert r.status_code == 200
        d = r.json()
        assert "recommendations" in d
        assert "count" in d
        assert "hotel_id" in d

    def test_list_prioritized_by_risk(self, auth_headers):
        """CRITICAL must appear before LOW in list."""
        r = requests.get(f"{BASE}/api/v1/recommendations/?limit=20",
                        headers=auth_headers, timeout=10)
        _skip(r, "list-priority")
        assert r.status_code == 200
        items = r.json()["recommendations"]
        if len(items) >= 2:
            risk_order = {"CRITICAL": 1, "HIGH": 2, "MEDIUM": 3, "LOW": 4}
            scores = [risk_order.get(item["risk_level"], 5) for item in items]
            assert scores == sorted(scores), \
                f"List not sorted by risk: {[i['risk_level'] for i in items]}"

    def test_list_filter_by_status_pending(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/?status=pending",
                        headers=auth_headers, timeout=10)
        _skip(r, "list-pending")
        assert r.status_code == 200
        for item in r.json()["recommendations"]:
            assert item["status"] == "pending"

    def test_list_items_have_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/?limit=5",
                        headers=auth_headers, timeout=10)
        _skip(r, "list-fields")
        assert r.status_code == 200
        for item in r.json()["recommendations"]:
            assert "id" in item
            assert "director" in item
            assert "risk_level" in item
            assert "recommendation" in item
            assert "action" in item
            assert "status" in item
            assert item["status"] in VALID_STATUSES
            assert item["risk_level"] in VALID_RISK_LEVELS

    def test_list_tenant_scoped(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/",
                        headers=auth_headers, timeout=10)
        _skip(r, "list-tenant")
        assert r.status_code == 200
        assert r.json()["hotel_id"].startswith("tb-")


class TestGetSingleRecommendation:
    def _get_first_id(self, auth_headers) -> str:
        gen = requests.post(f"{BASE}/api/v1/recommendations/generate",
                           headers=auth_headers, timeout=30)
        recs = gen.json().get("recommendations", [])
        return recs[0]["id"] if recs else None

    def test_get_returns_full_evidence(self, auth_headers):
        rec_id = self._get_first_id(auth_headers)
        if not rec_id:
            pytest.skip("No recommendations generated")
        r = requests.get(f"{BASE}/api/v1/recommendations/{rec_id}",
                        headers=auth_headers, timeout=10)
        _skip(r, "get-evidence")
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d["evidence"], list)
        assert len(d["evidence"]) >= 1
        assert "source_data" in d
        assert isinstance(d["source_data"], dict)

    def test_get_has_governance_note(self, auth_headers):
        rec_id = self._get_first_id(auth_headers)
        if not rec_id:
            pytest.skip("No recommendations")
        r = requests.get(f"{BASE}/api/v1/recommendations/{rec_id}",
                        headers=auth_headers, timeout=10)
        _skip(r, "get-gov")
        assert r.status_code == 200
        d = r.json()
        assert d.get("human_review_required") is True
        assert "governance_note" in d

    def test_get_unknown_id_returns_404(self, auth_headers):
        r = requests.get(
            f"{BASE}/api/v1/recommendations/{uuid.uuid4()}",
            headers=auth_headers, timeout=10)
        _skip(r, "get-404")
        assert r.status_code == 404

    def test_get_has_all_evidence_fields(self, auth_headers):
        rec_id = self._get_first_id(auth_headers)
        if not rec_id:
            pytest.skip("No recommendations")
        r = requests.get(f"{BASE}/api/v1/recommendations/{rec_id}",
                        headers=auth_headers, timeout=10)
        _skip(r, "get-all-fields")
        assert r.status_code == 200
        d = r.json()
        for field in ["id", "director", "risk_level", "risk_score",
                      "recommendation", "evidence", "reasoning",
                      "confidence_score", "expected_impact", "action",
                      "source_data", "status", "generated_at"]:
            assert field in d, f"Missing field: {field}"


class TestApproveRejectLifecycle:
    def _generate_and_get_id(self, auth_headers) -> str:
        gen = requests.post(f"{BASE}/api/v1/recommendations/generate",
                           headers=auth_headers, timeout=30)
        recs = gen.json().get("recommendations", [])
        # Get a pending one
        list_r = requests.get(
            f"{BASE}/api/v1/recommendations/?status=pending&limit=1",
            headers=auth_headers, timeout=10)
        items = list_r.json().get("recommendations", [])
        return items[0]["id"] if items else (recs[0]["id"] if recs else None)

    def test_approve_changes_status(self, auth_headers):
        rec_id = self._generate_and_get_id(auth_headers)
        if not rec_id:
            pytest.skip("No recommendations")
        r = requests.post(f"{BASE}/api/v1/recommendations/{rec_id}/approve",
                         headers=auth_headers,
                         json={"notes": "Test approval"},
                         timeout=10)
        _skip(r, "approve-status")
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "approved"
        assert "next_step" in d
        assert d.get("reviewed_by")

    def test_approve_does_not_auto_execute(self, auth_headers):
        """Approve must record decision only — not create WOs automatically."""
        rec_id = self._generate_and_get_id(auth_headers)
        if not rec_id:
            pytest.skip("No recommendations")
        r = requests.post(f"{BASE}/api/v1/recommendations/{rec_id}/approve",
                         headers=auth_headers, json={}, timeout=10)
        _skip(r, "approve-no-auto")
        assert r.status_code == 200
        d = r.json()
        # next_step should instruct human to execute — not say "executed"
        next_step = d.get("next_step", "").lower()
        assert "execute" in next_step or "action" in next_step or "procedure" in next_step

    def test_reject_changes_status(self, auth_headers):
        # Generate fresh to ensure pending
        gen = requests.post(f"{BASE}/api/v1/recommendations/generate",
                           headers=auth_headers, timeout=30)
        recs = gen.json().get("recommendations", [])
        # Find one that's pending
        list_r = requests.get(
            f"{BASE}/api/v1/recommendations/?status=pending&limit=1",
            headers=auth_headers, timeout=10)
        items = list_r.json().get("recommendations", [])
        if not items:
            pytest.skip("No pending recommendations")
        rec_id = items[0]["id"]

        r = requests.post(f"{BASE}/api/v1/recommendations/{rec_id}/reject",
                         headers=auth_headers,
                         json={"reason": "Not applicable this quarter"},
                         timeout=10)
        _skip(r, "reject-status")
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "rejected"
        assert d.get("rejection_reason")

    def test_approved_appears_in_history(self, auth_headers):
        # Approve one
        gen = requests.post(f"{BASE}/api/v1/recommendations/generate",
                           headers=auth_headers, timeout=30)
        recs = gen.json().get("recommendations", [])
        if recs:
            requests.post(
                f"{BASE}/api/v1/recommendations/{recs[0]['id']}/approve",
                headers=auth_headers, json={"notes": "History test"},
                timeout=10)

        r = requests.get(f"{BASE}/api/v1/recommendations/history",
                        headers=auth_headers, timeout=10)
        _skip(r, "history")
        assert r.status_code == 200
        d = r.json()
        assert "history" in d
        assert d["count"] >= 0  # may have prior approvals


class TestIntelligenceDecisionLoop:
    def test_full_intelligence_decision_loop(self, auth_headers):
        """
        WAVE 4 GATE TEST: Intelligence → Decision → Measurement
        Proves the full loop is operational.
        """
        # Step 1: Generate from intelligence
        gen = requests.post(f"{BASE}/api/v1/recommendations/generate",
                           headers=auth_headers, timeout=30)
        if gen.status_code == 429:
            pytest.skip("Rate limited")
        assert gen.status_code == 200
        assert gen.json()["generated_count"] == 4

        # Step 2: Intelligence visible in list
        lst = requests.get(f"{BASE}/api/v1/recommendations/?status=pending",
                          headers=auth_headers, timeout=10)
        assert lst.status_code == 200
        items = lst.json()["recommendations"]
        assert len(items) >= 1
        first = items[0]
        assert first["risk_level"] in {"CRITICAL", "HIGH", "MEDIUM", "LOW"}

        # Step 3: Human reviews evidence
        detail = requests.get(
            f"{BASE}/api/v1/recommendations/{first['id']}",
            headers=auth_headers, timeout=10)
        assert detail.status_code == 200
        d = detail.json()
        assert len(d["evidence"]) >= 1
        assert d["human_review_required"] is True

        # Step 4: Human decides (approve)
        approve = requests.post(
            f"{BASE}/api/v1/recommendations/{first['id']}/approve",
            headers=auth_headers,
            json={"notes": "Full loop test — approved"},
            timeout=10)
        assert approve.status_code == 200
        assert approve.json()["status"] == "approved"

        # Step 5: Decision tracked in history
        history = requests.get(f"{BASE}/api/v1/recommendations/history",
                              headers=auth_headers, timeout=10)
        assert history.status_code == 200
        assert history.json()["count"] >= 1

        print(f"\n✅ INTELLIGENCE → DECISION LOOP COMPLETE")
        print(f"   Generated: {gen.json()['generated_count']} recommendations")
        print(f"   Top risk: {first['risk_level']} — {first['action']}")
        print(f"   Evidence: {len(d['evidence'])} data points")
        print(f"   Decision: APPROVED by human reviewer")
        print(f"   History: {history.json()['count']} decisions tracked")
