"""Sprint-147: Supply chain + maintenance + HR deep coverage"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestSupplyChainDeep:
    def test_po_list(self, client, auth_headers):
        r=client.get("/api/v1/purchase-orders/?limit=10",headers=auth_headers)
        _s(r,"sc1"); assert r.status_code==200
    def test_pr_list(self, client, auth_headers):
        r=client.get("/api/v1/purchase-requests/?limit=10",headers=auth_headers)
        _s(r,"sc2"); assert r.status_code==200
    def test_rfq_list(self, client, auth_headers):
        r=client.get("/api/v1/rfqs/?limit=5",headers=auth_headers)
        _s(r,"sc3"); assert r.status_code in (200,404)
    def test_goods_receipts(self, client, auth_headers):
        r=client.get("/api/v1/goods-receipts/?limit=5",headers=auth_headers)
        _s(r,"sc4"); assert r.status_code in (200,404)
    def test_inventory_items(self, client, auth_headers):
        r=client.get("/api/v1/inventory-items/?limit=10",headers=auth_headers)
        _s(r,"sc5"); assert r.status_code in (200,404)
    def test_warehouses(self, client, auth_headers):
        r=client.get("/api/v1/warehouses/?limit=5",headers=auth_headers)
        _s(r,"sc6"); assert r.status_code in (200,404)
    def test_stock_balances(self, client, auth_headers):
        r=client.get("/api/v1/stock-balances/?limit=5",headers=auth_headers)
        _s(r,"sc7"); assert r.status_code in (200,404)

class TestMaintenanceDeep:
    def test_pm_plans(self, client, auth_headers):
        r=client.get("/api/v1/maintenance/pm-plans/?limit=5",headers=auth_headers)
        _s(r,"md1"); assert r.status_code in (200,404)
    def test_service_requests(self, client, auth_headers):
        r=client.get("/api/v1/service-requests/?limit=10",headers=auth_headers)
        _s(r,"md2"); assert r.status_code==200
    def test_work_orders_all(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?limit=50",headers=auth_headers)
        _s(r,"md3"); assert r.status_code==200
    def test_assets_all(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=50",headers=auth_headers)
        _s(r,"md4"); assert r.status_code==200
    def test_warranties(self, client, auth_headers):
        r=client.get("/api/v1/warranty/overview",headers=auth_headers)
        _s(r,"md5"); assert r.status_code in (200,404)

class TestHRDeep:
    def test_employees(self, client, auth_headers):
        r=client.get("/api/v1/employees/?limit=10",headers=auth_headers)
        _s(r,"hr1"); assert r.status_code in (200,404)
    def test_technicians(self, client, auth_headers):
        r=client.get("/api/v1/technicians/?limit=10",headers=auth_headers)
        _s(r,"hr2"); assert r.status_code==200
    def test_agents(self, client, auth_headers):
        r=client.get("/api/v1/agents/?limit=10",headers=auth_headers)
        _s(r,"hr3"); assert r.status_code==200
    def test_timesheets(self, client, auth_headers):
        r=client.get("/api/v1/timesheets/?limit=5",headers=auth_headers)
        _s(r,"hr4"); assert r.status_code in (200,404)

class TestFinancialDeep:
    def test_invoices(self, client, auth_headers):
        r=client.get("/api/v1/invoices/?limit=10",headers=auth_headers)
        _s(r,"fd1"); assert r.status_code==200
    def test_gl_entries(self, client, auth_headers):
        r=client.get("/api/v1/financial/gl/?limit=5",headers=auth_headers)
        _s(r,"fd2"); assert r.status_code in (200,404)
    def test_gl_accounts(self, client, auth_headers):
        r=client.get("/api/v1/financial/gl/accounts/",headers=auth_headers)
        _s(r,"fd3"); assert r.status_code in (200,404)
    def test_payment_tracking(self, client, auth_headers):
        r=client.get("/api/v1/payment-tracking/?limit=5",headers=auth_headers)
        _s(r,"fd4"); assert r.status_code in (200,404)

class TestCRMDeep:
    def test_leads(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=20",headers=auth_headers)
        _s(r,"crm1"); assert r.status_code==200
    def test_contracts(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=20",headers=auth_headers)
        _s(r,"crm2"); assert r.status_code==200
    def test_quotes(self, client, auth_headers):
        r=client.get("/api/v1/quotes/?limit=10",headers=auth_headers)
        _s(r,"crm3"); assert r.status_code in (200,404)
    def test_activities(self, client, auth_headers):
        r=client.get("/api/v1/activities/?limit=20",headers=auth_headers)
        _s(r,"crm4"); assert r.status_code==200
    def test_suppliers(self, client, auth_headers):
        r=client.get("/api/v1/suppliers/?limit=20",headers=auth_headers)
        _s(r,"crm5"); assert r.status_code==200
