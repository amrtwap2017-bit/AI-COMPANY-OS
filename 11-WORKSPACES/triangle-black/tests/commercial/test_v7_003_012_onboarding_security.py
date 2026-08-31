"""
V7-003 + V7-012 — Onboarding Checklist + Security Sweep Tests
"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

class TestOnboardingChecklist:
    def test_checklist_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/onboarding/checklist", timeout=5)
        assert r.status_code in (401, 403), "Checklist must require auth"

    def test_checklist_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/onboarding/checklist",
                        headers=auth_headers, timeout=15)
        _skip(r, "checklist")
        assert r.status_code == 200

    def test_checklist_has_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/onboarding/checklist",
                        headers=auth_headers, timeout=15)
        _skip(r, "checklist-fields")
        assert r.status_code == 200
        d = r.json()
        assert "hotel_id" in d
        assert "completion_pct" in d
        assert "completed_steps" in d
        assert "total_steps" in d
        assert "steps" in d
        assert "next_action" in d
        assert "pilot_ready" in d

    def test_checklist_has_7_steps(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/onboarding/checklist",
                        headers=auth_headers, timeout=15)
        _skip(r, "7-steps")
        assert r.status_code == 200
        steps = r.json()["steps"]
        assert len(steps) == 7

    def test_checklist_steps_have_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/onboarding/checklist",
                        headers=auth_headers, timeout=15)
        _skip(r, "step-fields")
        assert r.status_code == 200
        for step in r.json()["steps"]:
            assert "step" in step
            assert "label" in step
            assert "status" in step
            assert "count" in step
            assert "action" in step
            assert "endpoint" in step
            assert step["status"] in ("COMPLETE", "IN_PROGRESS", "PENDING")

    def test_checklist_completion_bounded(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/onboarding/checklist",
                        headers=auth_headers, timeout=15)
        _skip(r, "completion-bounded")
        assert r.status_code == 200
        d = r.json()
        assert 0 <= d["completion_pct"] <= 100
        assert d["completed_steps"] <= d["total_steps"]

    def test_checklist_step1_always_complete(self, auth_headers):
        """Property is always provisioned if we're making API calls."""
        r = requests.get(f"{BASE}/api/v1/onboarding/checklist",
                        headers=auth_headers, timeout=15)
        _skip(r, "step1")
        assert r.status_code == 200
        step1 = r.json()["steps"][0]
        assert step1["step"] == 1
        assert step1["status"] == "COMPLETE"

    def test_checklist_pilot_ready_with_data(self, auth_headers):
        """With existing assets/suppliers/PM, should be pilot-ready."""
        r = requests.get(f"{BASE}/api/v1/onboarding/checklist",
                        headers=auth_headers, timeout=15)
        _skip(r, "pilot-ready")
        assert r.status_code == 200
        d = r.json()
        # We have 628 assets, 1000 suppliers, 722 PM plans
        # completion_pct should be high
        assert d["completion_pct"] >= 50, \
            f"With existing data, completion should be >= 50%, got {d['completion_pct']}%"

class TestIntelligenceSecured:
    """V7-012: Critical intelligence endpoints must require auth."""

    def test_executive_intelligence_protected(self):
        r = requests.get(f"{BASE}/api/v1/executive-intelligence/summary", timeout=5)
        assert r.status_code in (401, 403), \
            "Executive intelligence must require auth"

    def test_financial_intelligence_protected(self):
        r = requests.get(f"{BASE}/api/v1/financial-intelligence/report", timeout=5)
        assert r.status_code in (401, 403), \
            "Financial intelligence must require auth"

    def test_risk_intelligence_protected(self):
        r = requests.get(f"{BASE}/api/v1/risk-intelligence/composite-score", timeout=5)
        assert r.status_code in (401, 403), \
            "Risk intelligence must require auth"

    def test_supplier_intelligence_protected(self):
        r = requests.get(f"{BASE}/api/v1/supplier-intelligence/report", timeout=5)
        assert r.status_code in (401, 403), \
            "Supplier intelligence must require auth"

    def test_existing_security_regression(self):
        """Regression: previously secured endpoints must stay secured."""
        protected_before = [
            "/api/v1/pm-plans/",
            "/api/v1/stock-balances/",
            "/api/v1/rfqs/",
            "/api/v1/payment-tracking/",
            "/api/v1/suppliers/",
            "/api/v1/ai/signals/summary",
        ]
        for ep in protected_before:
            r = requests.get(f"{BASE}{ep}", timeout=5)
            assert r.status_code in (401, 403), \
                f"REGRESSION: {ep} was protected but now returns {r.status_code}"

class TestOnboardingExistingEndpoints:
    """Existing onboarding endpoints must still work."""

    def test_status_preserved(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/onboarding/status",
                        headers=auth_headers, timeout=10)
        _skip(r, "status")
        assert r.status_code == 200

    def test_data_quality_preserved(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/data-quality/score",
                        headers=auth_headers, timeout=15)
        _skip(r, "dq")
        assert r.status_code == 200
