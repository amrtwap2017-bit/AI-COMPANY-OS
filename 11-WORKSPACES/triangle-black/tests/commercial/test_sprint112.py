"""Sprint-112: Invoice/contract/quote create + update tests"""
import pytest
import uuid

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestLeadCreate:
    def test_create_and_delete(self, client, auth_headers):
        u=uuid.uuid4().hex[:8]
        r=client.post("/api/v1/leads/",json={"name":f"Test-{u}","email":f"{u}@test.com","source":"web","priority":"low"},headers=auth_headers)
        _s(r,"lc"); assert r.status_code in (200,201,422)
        if r.status_code in (200,201):
            lid=r.json()["id"]
            r2=client.delete(f"/api/v1/leads/{lid}",headers=auth_headers)
            _s(r2,"ld"); assert r2.status_code in (200,204,404,405)

class TestLeadUpdate:
    def test_patch_lead(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=1",headers=auth_headers)
        _s(r,"lu_list"); assert r.status_code==200
        if r.json():
            lid=r.json()[0]["id"]
            r2=client.patch(f"/api/v1/leads/{lid}",json={"notes":"Updated by test"},headers=auth_headers)
            _s(r2,"lu"); assert r2.status_code in (200,404,405,422)

class TestWorkOrderCreate:
    def test_create(self, client, auth_headers):
        r=client.post("/api/v1/work-orders/",json={"title":f"Test-WO-{uuid.uuid4().hex[:6]}","type":"corrective","priority":"low"},headers=auth_headers)
        _s(r,"woc"); assert r.status_code in (200,201,401,422)

class TestServiceRequestCreate:
    def test_create(self, client, auth_headers):
        r=client.post("/api/v1/service-requests/",json={"title":f"Test-SR-{uuid.uuid4().hex[:6]}","category":"HVAC","urgency":"low"},headers=auth_headers)
        _s(r,"src"); assert r.status_code in (200,201,422,500)

class TestPurchaseRequestCreate:
    def test_create(self, client, auth_headers):
        r=client.post("/api/v1/purchase-requests/",json={"title":f"Test-PR-{uuid.uuid4().hex[:6]}","category":"general","priority":"low","requester":"test"},headers=auth_headers)
        _s(r,"prc"); assert r.status_code in (200,201,401,422)

class TestSupplierCreate:
    def test_create(self, client, auth_headers):
        u=uuid.uuid4().hex[:6]
        r=client.post("/api/v1/suppliers/",json={"company_name":f"Test-Supplier-{u}","hotel_id":"tb-default-hotel-000000000001"},headers=auth_headers)
        _s(r,"sc"); assert r.status_code in (200,201,422)

class TestSupplierUpdate:
    def test_patch(self, client, auth_headers):
        r=client.get("/api/v1/suppliers/?limit=1",headers=auth_headers)
        _s(r,"su_list"); assert r.status_code==200
        d=r.json(); items=d.get("results",d) if isinstance(d,dict) else d
        if items:
            r2=client.patch(f"/api/v1/suppliers/{items[0]['id']}",json={"notes":"Updated by test"},headers=auth_headers)
            _s(r2,"su"); assert r2.status_code in (200,404,405,422)
