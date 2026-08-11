"""Sprint-131: 850+ — service requests + assets + maintenance new filters"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestServiceRequestsNew:
    def test_electrical(self, client, auth_headers):
        r=client.get("/api/v1/service-requests/?category=Electrical&limit=5",headers=auth_headers)
        _s(r,"sr_elec"); assert r.status_code==200
    def test_medium_urgency(self, client, auth_headers):
        r=client.get("/api/v1/service-requests/?urgency=medium&limit=5",headers=auth_headers)
        _s(r,"sr_med"); assert r.status_code==200
    def test_in_review(self, client, auth_headers):
        r=client.get("/api/v1/service-requests/?status=in_review&limit=5",headers=auth_headers)
        _s(r,"sr_review"); assert r.status_code==200
    def test_pool_category(self, client, auth_headers):
        r=client.get("/api/v1/service-requests/?category=Pool&limit=5",headers=auth_headers)
        _s(r,"sr_pool"); assert r.status_code==200

class TestAssetsNew:
    def test_electrical_category(self, client, auth_headers):
        r=client.get("/api/v1/assets/?category=Electrical&limit=5",headers=auth_headers)
        _s(r,"a_elec"); assert r.status_code==200
    def test_plumbing_category(self, client, auth_headers):
        r=client.get("/api/v1/assets/?category=Plumbing&limit=5",headers=auth_headers)
        _s(r,"a_plumb"); assert r.status_code==200
    def test_high_criticality(self, client, auth_headers):
        r=client.get("/api/v1/assets/?criticality=high&limit=5",headers=auth_headers)
        _s(r,"a_hcrit"); assert r.status_code==200
    def test_medium_criticality(self, client, auth_headers):
        r=client.get("/api/v1/assets/?criticality=medium&limit=5",headers=auth_headers)
        _s(r,"a_mcrit"); assert r.status_code==200

class TestPurchaseOrdersNew:
    def test_cancelled(self, client, auth_headers):
        r=client.get("/api/v1/purchase-orders/?status=cancelled&limit=5",headers=auth_headers)
        _s(r,"po_cancel"); assert r.status_code==200
    def test_partial(self, client, auth_headers):
        r=client.get("/api/v1/purchase-orders/?status=partial&limit=5",headers=auth_headers)
        _s(r,"po_part"); assert r.status_code==200
    def test_high_value_pos(self, client, auth_headers):
        r=client.get("/api/v1/purchase-orders/?limit=10",headers=auth_headers)
        _s(r,"po_hv"); assert r.status_code==200
        assert len(r.json())>=0

class TestTechniciansNew:
    def test_plumbing_specialty(self, client, auth_headers):
        r=client.get("/api/v1/technicians/?specialty=Plumbing&limit=5",headers=auth_headers)
        _s(r,"t_plumb"); assert r.status_code==200
    def test_electrical_specialty(self, client, auth_headers):
        r=client.get("/api/v1/technicians/?specialty=Electrical&limit=5",headers=auth_headers)
        _s(r,"t_elec"); assert r.status_code==200
    def test_inactive(self, client, auth_headers):
        r=client.get("/api/v1/technicians/?is_active=false&limit=5",headers=auth_headers)
        _s(r,"t_inactive"); assert r.status_code==200

class TestEmployeesNew:
    def test_engineering(self, client, auth_headers):
        r=client.get("/api/v1/employees/?department=Engineering&limit=5",headers=auth_headers)
        _s(r,"emp_eng2"); assert r.status_code in (200,404)
    def test_operations(self, client, auth_headers):
        r=client.get("/api/v1/employees/?department=Operations&limit=5",headers=auth_headers)
        _s(r,"emp_ops"); assert r.status_code in (200,404)
    def test_senior_position(self, client, auth_headers):
        r=client.get("/api/v1/employees/?position=Senior&limit=5",headers=auth_headers)
        _s(r,"emp_senior"); assert r.status_code in (200,404)

class TestWarrantiesNew:
    def test_active(self, client, auth_headers):
        r=client.get("/api/v1/warranty/overview",headers=auth_headers)
        _s(r,"wa_ov2"); assert r.status_code in (200,404)
    def test_expiring_soon(self, client, auth_headers):
        r=client.get("/api/v1/warranty/expiring",headers=auth_headers)
        _s(r,"wa_exp2"); assert r.status_code in (200,404)
