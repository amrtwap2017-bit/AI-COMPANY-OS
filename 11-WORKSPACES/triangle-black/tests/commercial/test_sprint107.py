"""Sprint-107: 500 milestone — final coverage push"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestLeadDetail:
    def test_lead_detail_exists(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=1",headers=auth_headers)
        _s(r,"ld_list"); assert r.status_code==200
        leads=r.json()
        if leads:
            r2=client.get(f"/api/v1/leads/{leads[0]['id']}",headers=auth_headers)
            _s(r2,"ld_detail"); assert r2.status_code==200
    def test_lead_timeline(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=1",headers=auth_headers)
        _s(r,"lt_list"); assert r.status_code==200
        leads=r.json()
        if leads:
            r2=client.get(f"/api/v1/actions/leads/{leads[0]['id']}/timeline",headers=auth_headers)
            _s(r2,"lt_detail"); assert r2.status_code in (200,404)

class TestAssetDetail:
    def test_asset_detail(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=1",headers=auth_headers)
        _s(r,"ad_list"); assert r.status_code==200
        assets=r.json()
        if assets:
            r2=client.get(f"/api/v1/assets/{assets[0]['id']}",headers=auth_headers)
            _s(r2,"ad_detail"); assert r2.status_code==200
    def test_asset_work_orders(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=1",headers=auth_headers)
        _s(r,"awo_list"); assert r.status_code==200
        assets=r.json()
        if assets:
            r2=client.get(f"/api/v1/assets/{assets[0]['id']}/work-orders",headers=auth_headers)
            _s(r2,"awo"); assert r2.status_code in (200,404)

class TestContractDetail:
    def test_contract_detail(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=1",headers=auth_headers)
        _s(r,"cd_list"); assert r.status_code==200
        contracts=r.json()
        if contracts:
            r2=client.get(f"/api/v1/contracts/{contracts[0]['id']}",headers=auth_headers)
            _s(r2,"cd_detail"); assert r2.status_code==200

class TestInvoiceDetail:
    def test_invoice_detail(self, client, auth_headers):
        r=client.get("/api/v1/invoices/?limit=1",headers=auth_headers)
        _s(r,"id_list"); assert r.status_code==200
        invoices=r.json()
        if invoices:
            r2=client.get(f"/api/v1/invoices/{invoices[0]['id']}",headers=auth_headers)
            _s(r2,"id_detail"); assert r2.status_code==200

class TestAgentDetail:
    def test_agent_detail(self, client, auth_headers):
        r=client.get("/api/v1/agents/?limit=1",headers=auth_headers)
        _s(r,"agd_list"); assert r.status_code==200
        agents=r.json()
        if agents:
            r2=client.get(f"/api/v1/agents/{agents[0]['id']}",headers=auth_headers)
            _s(r2,"agd_detail"); assert r2.status_code==200

class TestSupplierDetail:
    def test_supplier_detail(self, client, auth_headers):
        r=client.get("/api/v1/suppliers/?limit=1",headers=auth_headers)
        _s(r,"sd_list"); assert r.status_code==200
        d=r.json(); items=d.get("results",d) if isinstance(d,dict) else d
        if items:
            r2=client.get(f"/api/v1/suppliers/{items[0]['id']}",headers=auth_headers)
            _s(r2,"sd_detail"); assert r2.status_code==200

class TestWorkOrderDetail:
    def test_wo_detail(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?limit=1",headers=auth_headers)
        _s(r,"wod_list"); assert r.status_code==200
        wos=r.json()
        if wos:
            r2=client.get(f"/api/v1/work-orders/{wos[0]['id']}",headers=auth_headers)
            _s(r2,"wod_detail"); assert r2.status_code==200
