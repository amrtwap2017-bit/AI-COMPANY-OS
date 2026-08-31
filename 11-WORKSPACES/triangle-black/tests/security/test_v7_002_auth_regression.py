"""
V7-002 Security Regression Tests
Verifies all previously-exposed endpoints now require authentication.
Run after every main.py change to catch auth regressions.
"""
import pytest
import requests

BASE = "http://localhost:8030"

def _status(method, ep, body=None):
    try:
        if method == "GET":
            return requests.get(f"{BASE}{ep}", timeout=5).status_code
        return requests.post(f"{BASE}{ep}", json=body or {}, timeout=5).status_code
    except Exception:
        pytest.skip("Server not running")

class TestEndpointsRequireAuth:
    """All operational endpoints must reject unauthenticated requests."""

    def test_pm_plans_requires_auth(self):
        assert _status("GET", "/api/v1/pm-plans/") in (401, 403), \
            "PM plans must require auth — operational data"

    def test_stock_balances_requires_auth(self):
        assert _status("GET", "/api/v1/stock-balances/") in (401, 403), \
            "Stock balances must require auth — inventory data"

    def test_rfqs_requires_auth(self):
        assert _status("GET", "/api/v1/rfqs/") in (401, 403), \
            "RFQs must require auth — procurement data"

    def test_payment_tracking_requires_auth(self):
        assert _status("GET", "/api/v1/payment-tracking/") in (401, 403), \
            "Payment tracking must require auth — financial data"

    def test_rbac_role_assign_requires_admin(self):
        assert _status("POST", "/api/v1/rbac/users/test-id/role", {"role":"admin"}) in (401, 403), \
            "RBAC role assignment must require admin"

    def test_rbac_users_list_requires_admin(self):
        assert _status("GET", "/api/v1/rbac/users") in (401, 403), \
            "User list must require admin"

    def test_suppliers_requires_auth(self):
        assert _status("GET", "/api/v1/suppliers/") in (401, 403), \
            "Suppliers must require auth"

class TestPublicEndpointsStillWork:
    """Health endpoints must remain public."""

    def test_health_live_is_public(self):
        assert _status("GET", "/api/v1/health/live") == 200, \
            "Health live must remain public"

    def test_health_ready_is_public(self):
        assert _status("GET", "/api/v1/health/ready") == 200, \
            "Health ready must remain public"

    def test_root_is_public(self):
        assert _status("GET", "/") in (200, 307), \
            "Root must remain public"

    def test_ai_signals_requires_auth(self):
        assert _status("GET", "/api/v1/ai/signals/summary") in (401, 403), \
            "AI signals summary must require auth — operational intelligence data"
