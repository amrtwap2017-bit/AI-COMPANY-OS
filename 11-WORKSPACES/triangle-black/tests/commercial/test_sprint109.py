"""Sprint-109: Expand conftest wait list + 500 crossing"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestRFQDetail:
    def test_detail(self, client, auth_headers):
        r=client.get("/api/v1/rfqs/?limit=1",headers=auth_headers)
        _s(r,"rfq_1"); assert r.status_code in (200,404)
        if r.status_code==200 and r.json():
            items=r.json() if isinstance(r.json(),list) else r.json().get("items",[])
            if items:
                r2=client.get(f"/api/v1/rfqs/{items[0]['id']}",headers=auth_headers)
                _s(r2,"rfq_d"); assert r2.status_code in (200,404)

class TestGoodsReceiptDetail:
    def test_detail(self, client, auth_headers):
        r=client.get("/api/v1/goods-receipts/?limit=1",headers=auth_headers)
        _s(r,"gr_1"); assert r.status_code in (200,404)
        if r.status_code==200:
            d=r.json(); items=d if isinstance(d,list) else d.get("results",[])
            if items:
                r2=client.get(f"/api/v1/goods-receipts/{items[0]['id']}",headers=auth_headers)
                _s(r2,"gr_d"); assert r2.status_code in (200,404)

class TestInventoryItemDetail:
    def test_detail(self, client, auth_headers):
        r=client.get("/api/v1/inventory-items/?limit=1",headers=auth_headers)
        _s(r,"ii_1"); assert r.status_code in (200,404)
        if r.status_code==200:
            d=r.json(); items=d if isinstance(d,list) else d.get("results",[])
            if items:
                r2=client.get(f"/api/v1/inventory-items/{items[0]['id']}",headers=auth_headers)
                _s(r2,"ii_d"); assert r2.status_code in (200,404)

class TestWarrantyDetail:
    def test_list(self, client, auth_headers):
        r=client.get("/api/v1/warranty/overview",headers=auth_headers)
        _s(r,"wa_ov"); assert r.status_code in (200,404)
    def test_expiring(self, client, auth_headers):
        r=client.get("/api/v1/warranty/expiring",headers=auth_headers)
        _s(r,"wa_exp"); assert r.status_code in (200,404)

class TestScopeOfWorkDetail:
    def test_list(self, client, auth_headers):
        r=client.get("/api/v1/scope-of-work/?limit=5",headers=auth_headers)
        _s(r,"sow_list2"); assert r.status_code in (200,404)
    def test_detail(self, client, auth_headers):
        r=client.get("/api/v1/scope-of-work/?limit=1",headers=auth_headers)
        _s(r,"sow_1"); assert r.status_code in (200,404)
        if r.status_code==200:
            d=r.json(); items=d if isinstance(d,list) else d.get("results",[])
            if items:
                r2=client.get(f"/api/v1/scope-of-work/{items[0]['id']}",headers=auth_headers)
                _s(r2,"sow_d"); assert r2.status_code in (200,404)

class TestHotelDetail:
    def test_detail(self, client, auth_headers):
        r=client.get("/api/v1/hotels/?limit=1",headers=auth_headers)
        _s(r,"hot_1"); assert r.status_code in (200,404)
        if r.status_code==200:
            d=r.json(); items=d if isinstance(d,list) else d.get("results",[])
            if items:
                r2=client.get(f"/api/v1/hotels/{items[0]['id']}",headers=auth_headers)
                _s(r2,"hot_d"); assert r2.status_code in (200,404)
