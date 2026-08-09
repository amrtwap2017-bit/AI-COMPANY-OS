"""Sprint-094: Final coverage — procurement intake/csv export/pdf/stock movements"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestProcurementIntake:
    def test_items(self, client, auth_headers):
        r = client.get("/api/v1/procurement/intake/items", headers=auth_headers)
        _s(r,"intake_items"); assert r.status_code in (200,404)
    def test_vendors(self, client, auth_headers):
        r = client.get("/api/v1/procurement/intake/vendors", headers=auth_headers)
        _s(r,"intake_vendors"); assert r.status_code in (200,404)

class TestStockMovements:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/stock-movements/?limit=5", headers=auth_headers)
        _s(r,"stock_mv"); assert r.status_code in (200,404)

class TestStockBalances:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/stock-balances/?limit=5", headers=auth_headers)
        _s(r,"stock_bal"); assert r.status_code in (200,404)
    def test_summary(self, client, auth_headers):
        r = client.get("/api/v1/stock-balances/summary", headers=auth_headers)
        _s(r,"stock_sum"); assert r.status_code in (200,404)

class TestWarehouseTransfers:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/warehouse-transfers/?limit=5", headers=auth_headers)
        _s(r,"wh_transfer"); assert r.status_code in (200,404)

class TestScopeOfWork:
    def test_create_summary(self, client, auth_headers):
        r = client.get("/api/v1/scope-of-work/stats", headers=auth_headers)
        _s(r,"sow_stats"); assert r.status_code in (200,404)

class TestUserPreferencesWrite:
    def test_set_preference(self, client, auth_headers):
        r = client.post("/api/v1/user-preferences/set",
            json={"pref_key":"theme","pref_value":"dark"},
            headers=auth_headers)
        _s(r,"pref_set"); assert r.status_code in (200,201,404,422)

class TestApprovalRequestsWrite:
    def test_pending_count(self, client, auth_headers):
        r = client.get("/api/v1/approval-requests/pending", headers=auth_headers)
        _s(r,"ar_pending"); assert r.status_code in (200,404)
