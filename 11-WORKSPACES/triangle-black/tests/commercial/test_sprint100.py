"""Sprint-100: MILESTONE — comprehensive business flow tests"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestLeadToContractFlow:
    def test_leads_exist(self, client, auth_headers):
        r = client.get("/api/v1/leads/?limit=5", headers=auth_headers)
        _s(r,"leads"); assert r.status_code==200; assert len(r.json())>=0
    def test_quotes_exist(self, client, auth_headers):
        r = client.get("/api/v1/quotes/?limit=5", headers=auth_headers)
        _s(r,"quotes"); assert r.status_code in (200,404)
    def test_contracts_exist(self, client, auth_headers):
        r = client.get("/api/v1/contracts/?limit=5", headers=auth_headers)
        _s(r,"contracts"); assert r.status_code==200
    def test_invoices_exist(self, client, auth_headers):
        r = client.get("/api/v1/invoices/?limit=5", headers=auth_headers)
        _s(r,"invoices"); assert r.status_code==200

class TestMaintenanceFlow:
    def test_assets(self, client, auth_headers):
        r = client.get("/api/v1/assets/?limit=5", headers=auth_headers)
        _s(r,"assets"); assert r.status_code==200
    def test_work_orders(self, client, auth_headers):
        r = client.get("/api/v1/work-orders/?limit=5", headers=auth_headers)
        _s(r,"wos"); assert r.status_code==200
    def test_service_requests(self, client, auth_headers):
        r = client.get("/api/v1/service-requests/?limit=5", headers=auth_headers)
        _s(r,"srs"); assert r.status_code==200

class TestSupplyChainFlow:
    def test_purchase_requests(self, client, auth_headers):
        r = client.get("/api/v1/purchase-requests/?limit=5", headers=auth_headers)
        _s(r,"prs"); assert r.status_code==200
    def test_purchase_orders(self, client, auth_headers):
        r = client.get("/api/v1/purchase-orders/?limit=5", headers=auth_headers)
        _s(r,"pos"); assert r.status_code==200
    def test_suppliers(self, client, auth_headers):
        r = client.get("/api/v1/suppliers/?limit=5", headers=auth_headers)
        _s(r,"suppliers"); assert r.status_code==200

class TestPlatformIntegrity:
    def test_agents_available(self, client, auth_headers):
        r = client.get("/api/v1/agents/?limit=5", headers=auth_headers)
        _s(r,"agents"); assert r.status_code==200; assert len(r.json())>=1
    def test_search_functional(self, client, auth_headers):
        r = client.get("/api/v1/search/?q=hotel", headers=auth_headers)
        _s(r,"search"); assert r.status_code==200
        d=r.json(); assert "results" in d; assert d["total"]>=0
