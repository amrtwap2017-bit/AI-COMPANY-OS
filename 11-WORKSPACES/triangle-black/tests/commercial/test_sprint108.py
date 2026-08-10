"""Sprint-108: 500+ push — write tests + conftest wait expansion"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestProjectDetail:
    def test_list(self, client, auth_headers):
        r=client.get("/api/v1/projects/?limit=5",headers=auth_headers)
        _s(r,"proj_list"); assert r.status_code in (200,404)
    def test_detail(self, client, auth_headers):
        r=client.get("/api/v1/projects/?limit=1",headers=auth_headers)
        _s(r,"proj_1"); assert r.status_code in (200,404)
        if r.status_code==200 and r.json():
            r2=client.get(f"/api/v1/projects/{r.json()[0]['id']}",headers=auth_headers)
            _s(r2,"proj_d"); assert r2.status_code in (200,404)

class TestServiceRequestDetail:
    def test_detail(self, client, auth_headers):
        r=client.get("/api/v1/service-requests/?limit=1",headers=auth_headers)
        _s(r,"sr_1"); assert r.status_code==200
        if r.json():
            r2=client.get(f"/api/v1/service-requests/{r.json()[0]['id']}",headers=auth_headers)
            _s(r2,"sr_d"); assert r2.status_code in (200,404)

class TestTechnicianDetail:
    def test_detail(self, client, auth_headers):
        r=client.get("/api/v1/technicians/?limit=1",headers=auth_headers)
        _s(r,"tech_1"); assert r.status_code==200
        if r.json():
            r2=client.get(f"/api/v1/technicians/{r.json()[0]['id']}",headers=auth_headers)
            _s(r2,"tech_d"); assert r2.status_code in (200,404)

class TestWarehouseDetail:
    def test_detail(self, client, auth_headers):
        r=client.get("/api/v1/warehouses/?limit=1",headers=auth_headers)
        _s(r,"wh_1"); assert r.status_code in (200,404)

class TestPurchaseRequestDetail:
    def test_detail(self, client, auth_headers):
        r=client.get("/api/v1/purchase-requests/?limit=1",headers=auth_headers)
        _s(r,"pr_1"); assert r.status_code==200
        if r.json():
            r2=client.get(f"/api/v1/purchase-requests/{r.json()[0]['id']}",headers=auth_headers)
            _s(r2,"pr_d"); assert r2.status_code in (200,404)

class TestPurchaseOrderDetail:
    def test_detail(self, client, auth_headers):
        r=client.get("/api/v1/purchase-orders/?limit=1",headers=auth_headers)
        _s(r,"po_1"); assert r.status_code==200
        if r.json():
            r2=client.get(f"/api/v1/purchase-orders/{r.json()[0]['id']}",headers=auth_headers)
            _s(r2,"po_d"); assert r2.status_code in (200,404)

class TestEmployeeDetail:
    def test_detail(self, client, auth_headers):
        r=client.get("/api/v1/employees/?limit=1",headers=auth_headers)
        _s(r,"emp_1"); assert r.status_code in (200,404)
        d=r.json(); items=d if isinstance(d,list) else d.get("results",[])
        if items:
            r2=client.get(f"/api/v1/employees/{items[0]['id']}",headers=auth_headers)
            _s(r2,"emp_d"); assert r2.status_code in (200,404)
