"""Sprint-148: Business rules + data quality + cross-entity validation"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestBusinessRulesValidation:
    def test_all_leads_have_source(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=20",headers=auth_headers)
        _s(r,"br1"); assert r.status_code==200
        for l in r.json(): assert "source" in l
    def test_all_wo_have_type(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?limit=20",headers=auth_headers)
        _s(r,"br2"); assert r.status_code==200
        for wo in r.json(): assert "type" in wo
    def test_all_assets_have_name(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=20",headers=auth_headers)
        _s(r,"br3"); assert r.status_code==200
        for a in r.json(): assert "name" in a
    def test_all_contracts_positive_value(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=10",headers=auth_headers)
        _s(r,"br4"); assert r.status_code==200
        for c in r.json(): assert float(c.get("total_value",0))>=0
    def test_activities_have_actor(self, client, auth_headers):
        r=client.get("/api/v1/activities/?limit=10",headers=auth_headers)
        _s(r,"br5"); assert r.status_code==200
        for a in r.json(): assert "actor" in a

class TestCrossEntityValidation:
    def test_lead_has_hotel(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=10",headers=auth_headers)
        _s(r,"ce1"); assert r.status_code==200
        for l in r.json(): assert l.get("hotel_id") is not None
    def test_contract_has_hotel(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=10",headers=auth_headers)
        _s(r,"ce2"); assert r.status_code==200
        for c in r.json(): assert c.get("hotel_id") is not None
    def test_asset_has_hotel(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=10",headers=auth_headers)
        _s(r,"ce3"); assert r.status_code==200
        for a in r.json(): assert a.get("hotel_id") is not None
    def test_activity_has_hotel(self, client, auth_headers):
        r=client.get("/api/v1/activities/?limit=10",headers=auth_headers)
        _s(r,"ce4"); assert r.status_code==200
        for act in r.json(): assert act.get("hotel_id") is not None

class TestIDUniqueness:
    def test_lead_ids_unique(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=50",headers=auth_headers)
        _s(r,"idu1"); assert r.status_code==200
        ids=[l["id"] for l in r.json()]
        assert len(ids)==len(set(ids))
    def test_asset_ids_unique(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=50",headers=auth_headers)
        _s(r,"idu2"); assert r.status_code==200
        ids=[a["id"] for a in r.json()]
        assert len(ids)==len(set(ids))
    def test_contract_ids_unique(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=50",headers=auth_headers)
        _s(r,"idu3"); assert r.status_code==200
        ids=[c["id"] for c in r.json()]
        assert len(ids)==len(set(ids))
    def test_invoice_numbers_unique(self, client, auth_headers):
        r=client.get("/api/v1/invoices/?limit=50",headers=auth_headers)
        _s(r,"idu4"); assert r.status_code==200
        nums=[i["invoice_number"] for i in r.json()]
        assert len(nums)==len(set(nums))

class TestAPIResponseStructure:
    def test_search_has_all_keys(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=hotel",headers=auth_headers)
        _s(r,"ars1"); assert r.status_code==200
        d=r.json()
        assert "query" in d
        assert "results" in d
        assert "total" in d
        assert "entity_types" in d
        assert "generated_at" in d
    def test_health_has_all_keys(self, client, auth_headers):
        r=client.get("/health",headers=auth_headers)
        _s(r,"ars2"); assert r.status_code==200
        d=r.json()
        assert "ok" in d
        assert "database" in d
        assert "service" in d
        assert "version" in d
    def test_quick_search_has_results(self, client, auth_headers):
        r=client.get("/api/v1/search/quick?q=Cairo",headers=auth_headers)
        _s(r,"ars3"); assert r.status_code==200
        d=r.json()
        assert "query" in d
        assert "results" in d
        assert "total" in d
