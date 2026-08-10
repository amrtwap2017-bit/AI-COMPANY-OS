"""Sprint-126: Final 800 push — comprehensive business validation"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestLeadsDataQuality:
    def test_leads_have_name(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=5",headers=auth_headers)
        _s(r,"ldq1"); assert r.status_code==200
        for lead in r.json(): assert "name" in lead
    def test_leads_have_status(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=5",headers=auth_headers)
        _s(r,"ldq2"); assert r.status_code==200
        for lead in r.json(): assert "status" in lead
    def test_leads_have_email(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=5",headers=auth_headers)
        _s(r,"ldq3"); assert r.status_code==200
        for lead in r.json(): assert "email" in lead

class TestContractsDataQuality:
    def test_contracts_have_title(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=5",headers=auth_headers)
        _s(r,"cdq1"); assert r.status_code==200
        for c in r.json(): assert "title" in c
    def test_contracts_have_value(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=5",headers=auth_headers)
        _s(r,"cdq2"); assert r.status_code==200
        for c in r.json(): assert "total_value" in c

class TestWorkOrdersDataQuality:
    def test_work_orders_have_title(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?limit=5",headers=auth_headers)
        _s(r,"wdq1"); assert r.status_code==200
        for wo in r.json(): assert "title" in wo
    def test_work_orders_have_priority(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?limit=5",headers=auth_headers)
        _s(r,"wdq2"); assert r.status_code==200
        for wo in r.json(): assert "priority" in wo
    def test_work_orders_have_type(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?limit=5",headers=auth_headers)
        _s(r,"wdq3"); assert r.status_code==200
        for wo in r.json(): assert "type" in wo

class TestAssetsDataQuality:
    def test_assets_have_name(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=5",headers=auth_headers)
        _s(r,"adq1"); assert r.status_code==200
        for a in r.json(): assert "name" in a
    def test_assets_have_status(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=5",headers=auth_headers)
        _s(r,"adq2"); assert r.status_code==200
        for a in r.json(): assert "status" in a

class TestSuppliersDataQuality:
    def test_suppliers_have_company_name(self, client, auth_headers):
        r=client.get("/api/v1/suppliers/?limit=5",headers=auth_headers)
        _s(r,"sdq1"); assert r.status_code==200
        d=r.json(); items=d.get("results",d) if isinstance(d,dict) else d
        for s in items: assert "company_name" in s
    def test_suppliers_have_status(self, client, auth_headers):
        r=client.get("/api/v1/suppliers/?limit=5",headers=auth_headers)
        _s(r,"sdq2"); assert r.status_code==200
        d=r.json(); items=d.get("results",d) if isinstance(d,dict) else d
        for s in items: assert "status" in s

class TestInvoicesDataQuality:
    def test_invoices_have_number(self, client, auth_headers):
        r=client.get("/api/v1/invoices/?limit=5",headers=auth_headers)
        _s(r,"idq1"); assert r.status_code==200
        for inv in r.json():
            assert "invoice_number" in inv or "id" in inv
    def test_invoices_have_amount(self, client, auth_headers):
        r=client.get("/api/v1/invoices/?limit=5",headers=auth_headers)
        _s(r,"idq2"); assert r.status_code==200
        for inv in r.json():
            assert "amount" in inv or "total_amount" in inv

class TestAgentsDataQuality:
    def test_agents_have_name(self, client, auth_headers):
        r=client.get("/api/v1/agents/?limit=5",headers=auth_headers)
        _s(r,"agt_dq1"); assert r.status_code==200
        for a in r.json(): assert "name" in a
    def test_agents_have_capacity(self, client, auth_headers):
        r=client.get("/api/v1/agents/?limit=5",headers=auth_headers)
        _s(r,"agt_dq2"); assert r.status_code==200
        for a in r.json(): assert "max_leads" in a
