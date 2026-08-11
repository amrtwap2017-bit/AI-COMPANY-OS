"""Sprint-142: Production readiness — error handling + security + consistency"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestErrorHandling:
    def test_invalid_lead_id(self, client, auth_headers):
        r=client.get("/api/v1/leads/not-a-valid-id",headers=auth_headers)
        _s(r,"eh1"); assert r.status_code in (404,422)
    def test_invalid_contract_id(self, client, auth_headers):
        r=client.get("/api/v1/contracts/bad-id-000",headers=auth_headers)
        _s(r,"eh2"); assert r.status_code in (404,422)
    def test_invalid_asset_id(self, client, auth_headers):
        r=client.get("/api/v1/assets/bad-id-000",headers=auth_headers)
        _s(r,"eh3"); assert r.status_code in (404,422)
    def test_missing_fields_lead(self, client, auth_headers):
        r=client.post("/api/v1/leads/",json={},headers=auth_headers)
        _s(r,"eh4"); assert r.status_code in (400,401,422)

class TestAPIConsistency:
    def test_leads_list(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=5",headers=auth_headers)
        _s(r,"ac1"); assert r.status_code==200
        assert isinstance(r.json(),list)
    def test_contracts_list(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=5",headers=auth_headers)
        _s(r,"ac2"); assert r.status_code==200
        assert isinstance(r.json(),list)
    def test_assets_list(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=5",headers=auth_headers)
        _s(r,"ac3"); assert r.status_code==200
        assert isinstance(r.json(),list)
    def test_work_orders_list(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?limit=5",headers=auth_headers)
        _s(r,"ac4"); assert r.status_code==200
        assert isinstance(r.json(),list)
    def test_activities_list(self, client, auth_headers):
        r=client.get("/api/v1/activities/?limit=5",headers=auth_headers)
        _s(r,"ac5"); assert r.status_code==200
        assert isinstance(r.json(),list)

class TestDataIntegrityFinal:
    def test_lead_hotel_isolation(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=50",headers=auth_headers)
        _s(r,"di1"); assert r.status_code==200
        hotel_ids=set(l.get("hotel_id") for l in r.json() if l.get("hotel_id"))
        assert len(hotel_ids)==1
    def test_activities_have_type_field(self, client, auth_headers):
        r=client.get("/api/v1/activities/?limit=10",headers=auth_headers)
        _s(r,"di2"); assert r.status_code==200
        for a in r.json(): assert "type" in a
    def test_contracts_have_hotel(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=10",headers=auth_headers)
        _s(r,"di3"); assert r.status_code==200
        for c in r.json(): assert "hotel_id" in c

class TestPlatformHealth:
    def test_health_ok(self, client, auth_headers):
        r=client.get("/health",headers=auth_headers)
        _s(r,"ph1"); assert r.status_code==200
        d=r.json(); assert d.get("ok")==True
    def test_database_connected(self, client, auth_headers):
        r=client.get("/health",headers=auth_headers)
        _s(r,"ph2"); assert r.status_code==200
        assert r.json().get("database")=="connected"
    def test_api_serving(self, client, auth_headers):
        r=client.get("/",headers=auth_headers)
        _s(r,"ph3"); assert r.status_code==200
        assert "version" in r.json()
    def test_search_works(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=hotel",headers=auth_headers)
        _s(r,"ph4"); assert r.status_code==200
        assert "results" in r.json()
    def test_agents_available(self, client, auth_headers):
        r=client.get("/api/v1/agents/?limit=5",headers=auth_headers)
        _s(r,"ph5"); assert r.status_code==200
        assert len(r.json())>=1
