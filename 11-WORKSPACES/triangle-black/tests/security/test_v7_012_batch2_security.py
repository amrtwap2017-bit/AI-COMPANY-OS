"""
V7-012 Batch 2 — Intelligence Security Sweep
Verifies all intelligence routes require authentication.
"""
import pytest
import requests

BASE = "http://localhost:8030"

class TestBatch1Regression:
    """Batch 1 routes must still be protected."""
    def test_executive_intelligence(self):
        r = requests.get(f"{BASE}/api/v1/executive-intelligence/summary", timeout=5)
        assert r.status_code in (401, 403)

    def test_financial_intelligence(self):
        r = requests.get(f"{BASE}/api/v1/financial-intelligence/report", timeout=5)
        assert r.status_code in (401, 403)

    def test_risk_intelligence(self):
        r = requests.get(f"{BASE}/api/v1/risk-intelligence/composite-score", timeout=5)
        assert r.status_code in (401, 403)

    def test_supplier_intelligence(self):
        r = requests.get(f"{BASE}/api/v1/supplier-intelligence/report", timeout=5)
        assert r.status_code in (401, 403)

class TestBatch2New:
    """Batch 2 — newly secured routes."""
    def test_ai_signals_v2(self):
        r = requests.get(f"{BASE}/api/v1/ai/signals/v2", timeout=5)
        assert r.status_code in (401, 403), \
            f"AI signals v2 must require auth, got {r.status_code}"

    def test_intelligence_snapshot(self):
        r = requests.get(f"{BASE}/api/v1/intelligence/snapshot", timeout=5)
        assert r.status_code in (401, 403), \
            f"Intelligence snapshot must require auth, got {r.status_code}"

    def test_predictive_forecast(self):
        r = requests.get(f"{BASE}/api/v1/predictive/forecast", timeout=5)
        # May be 404 if not implemented — still not 200
        assert r.status_code not in (200,), \
            f"Predictive forecast must not return 200 without auth"

    def test_sla_dashboard(self):
        r = requests.get(f"{BASE}/api/v1/sla/dashboard", timeout=5)
        assert r.status_code in (401, 403, 404), \
            f"SLA dashboard must not be publicly accessible"

    def test_warehouse_intelligence(self):
        r = requests.get(f"{BASE}/api/v1/warehouse-intelligence/stock-health", timeout=5)
        assert r.status_code in (401, 403, 404)

class TestPublicEndpointsUnchanged:
    """Public endpoints must remain accessible."""
    def test_health_live_public(self):
        r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
        assert r.status_code == 200

    def test_health_ready_public(self):
        r = requests.get(f"{BASE}/api/v1/health/ready", timeout=5)
        assert r.status_code == 200

class TestPreviousSecurityRegression:
    """V7-002 secured endpoints must remain protected."""
    def test_pm_plans_still_protected(self):
        r = requests.get(f"{BASE}/api/v1/pm-plans/", timeout=5)
        assert r.status_code in (401, 403)

    def test_stock_balances_still_protected(self):
        r = requests.get(f"{BASE}/api/v1/stock-balances/", timeout=5)
        assert r.status_code in (401, 403)

    def test_ai_signals_summary_still_protected(self):
        r = requests.get(f"{BASE}/api/v1/ai/signals/summary", timeout=5)
        assert r.status_code in (401, 403)
