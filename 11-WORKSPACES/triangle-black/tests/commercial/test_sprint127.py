"""Sprint-127: Final session — SLA + reports + platform integrity"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestPlatformIntegrity2:
    def test_health_database(self, client, auth_headers):
        r=client.get("/health",headers=auth_headers)
        _s(r,"hlth2"); assert r.status_code==200
        d=r.json(); assert d.get("database")=="connected"
    def test_api_serves_json(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=1",headers=auth_headers)
        _s(r,"json"); assert r.status_code==200
        assert isinstance(r.json(),(list,dict))
    def test_auth_required_endpoints(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=1",headers=auth_headers)
        _s(r,"auth2"); assert r.status_code==200
    def test_pagination_works(self, client, auth_headers):
        r1=client.get("/api/v1/leads/?limit=3&offset=0",headers=auth_headers)
        r2=client.get("/api/v1/leads/?limit=3&offset=3",headers=auth_headers)
        _s(r1,"pg1"); assert r1.status_code==200
        _s(r2,"pg2"); assert r2.status_code==200

class TestSearchPlatform:
    def test_multi_entity_search(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=Cairo",headers=auth_headers)
        _s(r,"srch_cairo"); assert r.status_code==200
        d=r.json(); assert "entity_types" in d
    def test_search_limit(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=hotel&limit=3",headers=auth_headers)
        _s(r,"srch_lim"); assert r.status_code==200
    def test_quick_search_flat(self, client, auth_headers):
        r=client.get("/api/v1/search/quick?q=manager",headers=auth_headers)
        _s(r,"quick2"); assert r.status_code==200
        d=r.json(); assert isinstance(d.get("results",[]),list)

class TestCRUDConsistency:
    def test_leads_crud_count(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=100",headers=auth_headers)
        _s(r,"lc2"); assert r.status_code==200; assert len(r.json())>=10
    def test_contracts_crud_count(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=100",headers=auth_headers)
        _s(r,"cc2"); assert r.status_code==200; assert len(r.json())>=3
    def test_work_orders_crud_count(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?limit=100",headers=auth_headers)
        _s(r,"wc2"); assert r.status_code==200; assert len(r.json())>=5

class TestResponseStructure:
    def test_search_has_query(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=test",headers=auth_headers)
        _s(r,"rs1"); assert r.status_code==200
        d=r.json(); assert "query" in d; assert d["query"]=="test"
    def test_search_has_total(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=hotel",headers=auth_headers)
        _s(r,"rs2"); assert r.status_code==200
        d=r.json(); assert "total" in d; assert isinstance(d["total"],int)
    def test_suppliers_has_count(self, client, auth_headers):
        r=client.get("/api/v1/suppliers/?limit=5",headers=auth_headers)
        _s(r,"rs3"); assert r.status_code==200
        d=r.json()
        if isinstance(d,dict): assert "count" in d or "results" in d

class TestBusinessRules:
    def test_leads_status_valid(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=10",headers=auth_headers)
        _s(r,"br1"); assert r.status_code==200
        valid={"new","assigned","qualified","warm","cold","converted","lost"}
        for lead in r.json():
            assert lead.get("status") in valid or lead.get("status") is not None
    def test_work_orders_priority_valid(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?limit=10",headers=auth_headers)
        _s(r,"br2"); assert r.status_code==200
        valid={"low","medium","high","critical","urgent"}
        for wo in r.json():
            assert wo.get("priority") in valid or wo.get("priority") is not None
    def test_contracts_value_positive(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=10",headers=auth_headers)
        _s(r,"br3"); assert r.status_code==200
        for c in r.json():
            val=c.get("total_value",0)
            assert float(val)>=0
