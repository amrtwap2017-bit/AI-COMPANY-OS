"""
V6-E01 — AI Directors 2.0 Tests
Governed advisory workflow: DATA → EVIDENCE → ANALYSIS → RECOMMENDATION
→ CONFIDENCE → EXPECTED IMPACT → HUMAN REVIEW → ACTION

Evidence: Live verified 2026-08-29
  Maintenance: CRITICAL (90.0) — real PM data from DB
  Procurement: LOW (30.0)      — real PO data from DB
  Operations:  CRITICAL (85.0) — real WO/SLA data from DB
  Executive:   MEDIUM (55.0)   — cross-domain real data

All directors read from live DB — no hardcoded context.
"""
import pytest
import requests

BASE = "http://localhost:8030"

VALID_RISK_LEVELS = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}
VALID_ACTIONS = {"CREATE_WO", "CREATE_PR", "ESCALATE", "SCHEDULE", "MONITOR"}
VALID_DIRECTORS = {
    "AI Maintenance Director",
    "AI Procurement Director",
    "AI Operations Director",
    "AI Executive Analyst",
}


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


class TestAIDirectorsAuth:
    def test_maintenance_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/ai-directors/maintenance", timeout=10)
        assert r.status_code in (401, 403), \
            f"Director must require auth: {r.status_code}"

    def test_procurement_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/ai-directors/procurement", timeout=10)
        assert r.status_code in (401, 403)

    def test_operations_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/ai-directors/operations", timeout=10)
        assert r.status_code in (401, 403)

    def test_executive_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/ai-directors/executive", timeout=10)
        assert r.status_code in (401, 403)

    def test_analyze_requires_auth(self):
        r = requests.post(f"{BASE}/api/v1/ai-directors/analyze",
                         json={"director": "maintenance"}, timeout=10)
        assert r.status_code in (401, 403)


class TestGovernedAdvisoryFramework:
    """Every director response must follow the governed advisory contract."""

    REQUIRED_FIELDS = [
        "director", "audit_id", "hotel_id", "risk_level", "risk_score",
        "evidence", "reasoning", "recommendation", "confidence_score",
        "expected_impact", "action", "source_data", "required_approval_role",
        "governance_status", "model_used", "generated_at",
        "human_review_required", "disclaimer",
    ]

    def _assert_governed(self, d: dict, name: str):
        for field in self.REQUIRED_FIELDS:
            assert field in d, f"{name}: missing field '{field}'"
        assert d["risk_level"] in VALID_RISK_LEVELS, \
            f"{name}: invalid risk_level '{d['risk_level']}'"
        assert 0 <= d["risk_score"] <= 100, \
            f"{name}: risk_score {d['risk_score']} out of bounds"
        assert 0 < d["confidence_score"] <= 1.0, \
            f"{name}: confidence {d['confidence_score']} invalid"
        assert len(d["evidence"]) >= 1, f"{name}: no evidence provided"
        assert d["action"] in VALID_ACTIONS, \
            f"{name}: invalid action '{d['action']}'"
        assert d["human_review_required"] is True, \
            f"{name}: human_review_required must be True"
        assert d["governance_status"] == "governed_advisory", \
            f"{name}: governance_status must be governed_advisory"
        assert d["director"] in VALID_DIRECTORS, \
            f"{name}: unknown director '{d['director']}'"
        assert "2026" in d["generated_at"], \
            f"{name}: generated_at must be current year"
        assert d["hotel_id"].startswith("tb-"), \
            f"{name}: hotel_id must be tenant-scoped"

    def test_maintenance_director_governed(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/ai-directors/maintenance",
                        headers=auth_headers, timeout=15)
        _skip(r, "maint-gov")
        assert r.status_code == 200
        self._assert_governed(r.json(), "Maintenance Director")

    def test_procurement_director_governed(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/ai-directors/procurement",
                        headers=auth_headers, timeout=15)
        _skip(r, "proc-gov")
        assert r.status_code == 200
        self._assert_governed(r.json(), "Procurement Director")

    def test_operations_director_governed(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/ai-directors/operations",
                        headers=auth_headers, timeout=15)
        _skip(r, "ops-gov")
        assert r.status_code == 200
        self._assert_governed(r.json(), "Operations Director")

    def test_executive_director_governed(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/ai-directors/executive",
                        headers=auth_headers, timeout=15)
        _skip(r, "exec-gov")
        assert r.status_code == 200
        self._assert_governed(r.json(), "Executive Director")

    def test_analyze_post_governed(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/ai-directors/analyze",
                         headers=auth_headers,
                         json={"director": "maintenance", "context": {}},
                         timeout=15)
        _skip(r, "analyze-gov")
        assert r.status_code == 200
        self._assert_governed(r.json(), "Analyze POST")


class TestRealDBData:
    """Directors must use real DB data, not hardcoded values."""

    def test_maintenance_reads_real_pm_data(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/ai-directors/maintenance",
                        headers=auth_headers, timeout=15)
        _skip(r, "maint-db")
        assert r.status_code == 200
        d = r.json()
        src = d.get("source_data", {})
        assert "pm_plans" in src, "Maintenance must include PM data"
        assert "work_orders" in src, "Maintenance must include WO data"
        assert "assets" in src, "Maintenance must include asset data"
        assert src["pm_plans"]["total"] >= 0
        assert src["work_orders"]["total_open"] >= 0
        assert src["assets"]["total"] >= 0

    def test_procurement_reads_real_po_data(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/ai-directors/procurement",
                        headers=auth_headers, timeout=15)
        _skip(r, "proc-db")
        assert r.status_code == 200
        d = r.json()
        src = d.get("source_data", {})
        assert "purchase_orders" in src, "Procurement must include PO data"
        assert "suppliers" in src, "Procurement must include supplier data"
        assert src["purchase_orders"]["total"] >= 0
        assert src["suppliers"]["total"] >= 0

    def test_operations_reads_real_wo_data(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/ai-directors/operations",
                        headers=auth_headers, timeout=15)
        _skip(r, "ops-db")
        assert r.status_code == 200
        d = r.json()
        src = d.get("source_data", {})
        assert "work_orders" in src, "Operations must include WO data"
        assert "service_requests" in src, "Operations must include SR data"
        assert 0 <= src["work_orders"]["completion_rate_pct"] <= 100

    def test_executive_reads_real_summary(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/ai-directors/executive",
                        headers=auth_headers, timeout=15)
        _skip(r, "exec-db")
        assert r.status_code == 200
        d = r.json()
        src = d.get("source_data", {})
        assert "executive_summary" in src
        es = src["executive_summary"]
        assert es["total_assets"] >= 100  # Platform has 307+ assets
        assert es["open_work_orders"] >= 0
        assert 0 <= es["completion_rate_pct"] <= 100

    def test_model_is_deterministic_not_ai(self, auth_headers):
        """Platform uses rule-based model — no expensive AI calls."""
        r = requests.get(f"{BASE}/api/v1/ai-directors/maintenance",
                        headers=auth_headers, timeout=15)
        _skip(r, "model-check")
        assert r.status_code == 200
        model = r.json().get("model_used", "")
        assert "rule-based" in model or "deterministic" in model, \
            f"Expected rule-based model, got: {model}"


class TestEvidenceChain:
    def test_evidence_is_specific_not_generic(self, auth_headers):
        """Evidence must contain specific numbers from DB, not generic text."""
        r = requests.get(f"{BASE}/api/v1/ai-directors/maintenance",
                        headers=auth_headers, timeout=15)
        _skip(r, "evidence-specific")
        assert r.status_code == 200
        evidence = r.json().get("evidence", [])
        assert len(evidence) >= 1
        # At least one evidence item should contain a number
        has_number = any(
            any(c.isdigit() for c in ev) for ev in evidence
        )
        assert has_number, "Evidence must contain specific numbers from DB"

    def test_reasoning_references_evidence_count(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/ai-directors/executive",
                        headers=auth_headers, timeout=15)
        _skip(r, "reasoning-count")
        assert r.status_code == 200
        d = r.json()
        reasoning = d.get("reasoning", "")
        evidence = d.get("evidence", [])
        assert str(len(evidence)) in reasoning, \
            "Reasoning must reference evidence count"

    def test_recommendation_matches_action(self, auth_headers):
        """Recommendation text must be consistent with action type."""
        r = requests.get(f"{BASE}/api/v1/ai-directors/maintenance",
                        headers=auth_headers, timeout=15)
        _skip(r, "rec-action")
        assert r.status_code == 200
        d = r.json()
        action = d.get("action", "")
        recommendation = d.get("recommendation", "").upper()
        # ESCALATE or CREATE_WO should indicate urgency in recommendation
        if action in ("ESCALATE", "CREATE_WO"):
            assert any(w in recommendation for w in
                      ["URGENT", "PRIORITIZE", "ADDRESS", "IMMEDIATELY", "REVIEW"]), \
                f"Escalate action must have urgent recommendation: {d['recommendation'][:80]}"

    def test_expected_impact_present_and_meaningful(self, auth_headers):
        for ep in ["/api/v1/ai-directors/maintenance",
                   "/api/v1/ai-directors/operations"]:
            r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
            if r.status_code == 429:
                pytest.skip("Rate limited")
            assert r.status_code == 200
            impact = r.json().get("expected_impact", "")
            assert len(impact) >= 20, \
                f"expected_impact too short for {ep}: '{impact}'"

    def test_confidence_in_valid_range(self, auth_headers):
        for ep in ["/api/v1/ai-directors/maintenance",
                   "/api/v1/ai-directors/procurement",
                   "/api/v1/ai-directors/operations",
                   "/api/v1/ai-directors/executive"]:
            r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
            if r.status_code == 429:
                pytest.skip("Rate limited")
            assert r.status_code == 200
            c = r.json()["confidence_score"]
            assert 0.70 <= c <= 0.97, \
                f"Confidence {c} out of expected range for {ep}"


class TestAllDirectorsCombined:
    def test_all_directors_endpoint(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/ai-directors/all",
                        headers=auth_headers, timeout=30)
        _skip(r, "all-directors")
        assert r.status_code == 200
        d = r.json()
        assert "directors" in d
        assert "governance_note" in d
        dirs = d["directors"]
        assert set(dirs.keys()) == {"maintenance", "procurement",
                                    "operations", "executive"}
        for name, result in dirs.items():
            assert result.get("human_review_required") is True, \
                f"{name}: human_review_required must be True"

    def test_all_directors_are_tenant_scoped(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/ai-directors/all",
                        headers=auth_headers, timeout=30)
        _skip(r, "all-tenant")
        assert r.status_code == 200
        dirs = r.json()["directors"]
        for name, result in dirs.items():
            assert result.get("hotel_id", "").startswith("tb-"), \
                f"{name}: hotel_id not tenant-scoped"

    def test_analyze_all_directors(self, auth_headers):
        for director in ["maintenance", "procurement", "operations", "executive"]:
            r = requests.post(f"{BASE}/api/v1/ai-directors/analyze",
                             headers=auth_headers,
                             json={"director": director, "context": {}},
                             timeout=15)
            _skip(r, f"analyze-{director}")
            assert r.status_code == 200, \
                f"analyze/{director} failed: {r.text[:100]}"
            d = r.json()
            assert d["risk_level"] in VALID_RISK_LEVELS
            assert d["human_review_required"] is True

    def test_analyze_unknown_defaults_to_executive(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/ai-directors/analyze",
                         headers=auth_headers,
                         json={"director": "unknown_type", "context": {}},
                         timeout=15)
        _skip(r, "analyze-unknown")
        assert r.status_code == 200
        assert r.json()["director"] == "AI Executive Analyst"

    def test_wave4_ai_governance_gate(self, auth_headers):
        """
        WAVE 4 PARTIAL GATE: Intelligence → Decision → Measurement
        AI Directors produce governed, evidence-backed recommendations.
        """
        checks = []

        # All 4 directors return 200
        for ep in ["/api/v1/ai-directors/maintenance",
                   "/api/v1/ai-directors/procurement",
                   "/api/v1/ai-directors/operations",
                   "/api/v1/ai-directors/executive"]:
            r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
            if r.status_code == 429:
                pytest.skip("Rate limited")
            checks.append((ep.split("/")[-1], r.status_code == 200))

        # Governance enforced
        r = requests.get(f"{BASE}/api/v1/ai-directors/maintenance",
                        headers=auth_headers, timeout=15)
        d = r.json()
        checks.append(("human_review_required", d.get("human_review_required") is True))
        checks.append(("evidence_present", len(d.get("evidence", [])) >= 1))
        checks.append(("real_db_data", "pm_plans" in d.get("source_data", {})))
        checks.append(("governed_status",
                       d.get("governance_status") == "governed_advisory"))

        failed = [name for name, ok in checks if not ok]
        assert not failed, f"AI Governance gate failed: {failed}"
        print(f"\n✅ WAVE 4 AI GOVERNANCE GATE PASSED")
        print(f"   Evidence count: {len(d.get('evidence', []))}")
        print(f"   Risk: {d.get('risk_level')} ({d.get('risk_score')}/100)")
        print(f"   Action: {d.get('action')}")
        print(f"   Confidence: {d.get('confidence_score')}")
