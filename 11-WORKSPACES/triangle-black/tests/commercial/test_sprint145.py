"""Sprint-145: Pagination + field validation + count tests"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestLeadsPagination:
    def test_p1(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=10&offset=0",headers=auth_headers)
        _s(r,"lp1"); assert r.status_code==200
    def test_p2(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=10&offset=10",headers=auth_headers)
        _s(r,"lp2"); assert r.status_code==200
    def test_p3(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=10&offset=20",headers=auth_headers)
        _s(r,"lp3"); assert r.status_code==200
    def test_p4(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=5&offset=0",headers=auth_headers)
        _s(r,"lp4"); assert r.status_code==200; assert len(r.json())<=5

class TestAssetsPagination:
    def test_p1(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=10&offset=0",headers=auth_headers)
        _s(r,"ap1"); assert r.status_code==200
    def test_p2(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=10&offset=10",headers=auth_headers)
        _s(r,"ap2"); assert r.status_code==200
    def test_p3(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=5&offset=0",headers=auth_headers)
        _s(r,"ap3"); assert r.status_code==200

class TestContractsPagination:
    def test_p1(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=5&offset=0",headers=auth_headers)
        _s(r,"cp1"); assert r.status_code==200
    def test_p2(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=5&offset=5",headers=auth_headers)
        _s(r,"cp2"); assert r.status_code==200

class TestInvoicesPagination:
    def test_p1(self, client, auth_headers):
        r=client.get("/api/v1/invoices/?limit=5&offset=0",headers=auth_headers)
        _s(r,"ip1"); assert r.status_code==200
    def test_p2(self, client, auth_headers):
        r=client.get("/api/v1/invoices/?limit=5&offset=5",headers=auth_headers)
        _s(r,"ip2"); assert r.status_code==200

class TestFieldValidation:
    def test_leads_fields(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=3",headers=auth_headers)
        _s(r,"fv1"); assert r.status_code==200
        for l in r.json():
            assert "id" in l; assert "name" in l; assert "status" in l; assert "priority" in l
    def test_assets_fields(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=3",headers=auth_headers)
        _s(r,"fv2"); assert r.status_code==200
        for a in r.json():
            assert "id" in a; assert "name" in a; assert "status" in a
    def test_wo_fields(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?limit=3",headers=auth_headers)
        _s(r,"fv3"); assert r.status_code==200
        for wo in r.json():
            assert "id" in wo; assert "title" in wo; assert "status" in wo; assert "priority" in wo; assert "type" in wo
    def test_contract_fields(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=3",headers=auth_headers)
        _s(r,"fv4"); assert r.status_code==200
        for c in r.json():
            assert "id" in c; assert "title" in c; assert "status" in c; assert "total_value" in c
    def test_invoice_fields(self, client, auth_headers):
        r=client.get("/api/v1/invoices/?limit=3",headers=auth_headers)
        _s(r,"fv5"); assert r.status_code==200
        for inv in r.json():
            assert "id" in inv; assert "invoice_number" in inv; assert "status" in inv

class TestCountVerification:
    def test_leads_count(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=100",headers=auth_headers)
        _s(r,"cv1"); assert r.status_code==200; assert len(r.json())>=20
    def test_assets_count(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=100",headers=auth_headers)
        _s(r,"cv2"); assert r.status_code==200; assert len(r.json())>=10
    def test_contracts_count(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=100",headers=auth_headers)
        _s(r,"cv3"); assert r.status_code==200; assert len(r.json())>=3
    def test_invoices_count(self, client, auth_headers):
        r=client.get("/api/v1/invoices/?limit=100",headers=auth_headers)
        _s(r,"cv4"); assert r.status_code==200; assert len(r.json())>=5
    def test_activities_count(self, client, auth_headers):
        r=client.get("/api/v1/activities/?limit=100",headers=auth_headers)
        _s(r,"cv5"); assert r.status_code==200; assert len(r.json())>=1
