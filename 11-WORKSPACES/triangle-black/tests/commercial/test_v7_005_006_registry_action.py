"""
V7-005 + V7-006 — KPI Registry + Action Queue Tests
"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

class TestKPIRegistry:
    def test_registry_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/kpi-engine/registry",
                        headers=auth_headers, timeout=10)
        _skip(r, "registry")
        assert r.status_code == 200

    def test_registry_has_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/kpi-engine/registry",
                        headers=auth_headers, timeout=10)
        _skip(r, "registry-fields")
        assert r.status_code == 200
        d = r.json()
        assert "registry_version" in d
        assert "kpi_count" in d
        assert "governance_rules" in d
        assert "kpis" in d
        assert d["kpi_count"] >= 5

    def test_each_kpi_has_formula(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/kpi-engine/registry",
                        headers=auth_headers, timeout=10)
        _skip(r, "kpi-formula")
        assert r.status_code == 200
        for kpi in r.json()["kpis"]:
            assert "formula" in kpi, f"KPI {kpi.get('kpi_id')} missing formula"
            assert len(kpi["formula"]) > 5

    def test_registry_has_governance_rules(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/kpi-engine/registry",
                        headers=auth_headers, timeout=10)
        _skip(r, "governance")
        assert r.status_code == 200
        rules = r.json()["governance_rules"]
        assert len(rules) >= 3

    def test_mttr_kpi_documents_limitation(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/kpi-engine/registry",
                        headers=auth_headers, timeout=10)
        _skip(r, "mttr-limitation")
        assert r.status_code == 200
        kpis = {k["kpi_id"]: k for k in r.json()["kpis"]}
        assert "mttr" in kpis
        mttr = kpis["mttr"]
        assert "VERY_LOW" in mttr.get("confidence_note", ""), \
            "MTTR registry must document VERY_LOW confidence"

    def test_cost_avoidance_has_commercial_warning(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/kpi-engine/registry",
                        headers=auth_headers, timeout=10)
        _skip(r, "cost-warning")
        assert r.status_code == 200
        kpis = {k["kpi_id"]: k for k in r.json()["kpis"]}
        if "cost_avoidance_estimate" in kpis:
            kpi = kpis["cost_avoidance_estimate"]
            assert "commercial_warning" in kpi or "LOW" in kpi.get("confidence_note",""), \
                "Cost avoidance must have commercial warning"

class TestActionQueue:
    def test_action_queue_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/recommendations/action-queue", timeout=5)
        assert r.status_code in (401, 403)

    def test_action_queue_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/action-queue",
                        headers=auth_headers, timeout=15)
        _skip(r, "action-queue")
        assert r.status_code == 200

    def test_action_queue_has_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/action-queue",
                        headers=auth_headers, timeout=15)
        _skip(r, "queue-fields")
        assert r.status_code == 200
        d = r.json()
        assert "hotel_id" in d
        assert "total_pending" in d
        assert "p0_count" in d
        assert "p1_count" in d
        assert "urgent_count" in d
        assert "action_queue" in d
        assert "governance_note" in d

    def test_action_queue_items_have_priority(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/action-queue",
                        headers=auth_headers, timeout=15)
        _skip(r, "priority")
        assert r.status_code == 200
        for item in r.json()["action_queue"]:
            assert item["priority"] in ("P0","P1","P2","P3")
            assert item["timing"] in ("Act today","Act this week","Act this month","Plan")

    def test_action_queue_governance_note(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/recommendations/action-queue",
                        headers=auth_headers, timeout=15)
        _skip(r, "gov-note")
        assert r.status_code == 200
        note = r.json()["governance_note"]
        assert "human approval" in note.lower() or "advisory" in note.lower()

    def test_action_queue_not_shadowed(self, auth_headers):
        """Ensure /action-queue not captured by /{recommendation_id}."""
        r = requests.get(f"{BASE}/api/v1/recommendations/action-queue",
                        headers=auth_headers, timeout=15)
        _skip(r, "not-shadowed")
        assert r.status_code == 200
        d = r.json()
        assert "action_queue" in d, "Got recommendation detail instead of queue"

    def test_existing_endpoints_preserved(self, auth_headers):
        for ep in ["/summary", "/history", "/effectiveness"]:
            r = requests.get(f"{BASE}/api/v1/recommendations{ep}",
                           headers=auth_headers, timeout=10)
            _skip(r, ep)
            assert r.status_code == 200, f"{ep} broken"
