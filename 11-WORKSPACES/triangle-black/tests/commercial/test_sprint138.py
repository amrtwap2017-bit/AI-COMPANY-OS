"""Sprint-138: 1000 MILESTONE — final comprehensive tests"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestEntitiesCount:
    def test_leads_count_known(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=100",headers=auth_headers)
        _s(r,"lc_k"); assert r.status_code==200; assert len(r.json())>=20
    def test_assets_count_known(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=100",headers=auth_headers)
        _s(r,"ac_k"); assert r.status_code==200; assert len(r.json())>=10
    def test_agents_count_known(self, client, auth_headers):
        r=client.get("/api/v1/agents/?limit=50",headers=auth_headers)
        _s(r,"agc_k"); assert r.status_code==200; assert len(r.json())>=3
    def test_suppliers_count_known(self, client, auth_headers):
        r=client.get("/api/v1/suppliers/?limit=100",headers=auth_headers)
        _s(r,"sc_k"); assert r.status_code==200
        d=r.json(); items=d.get("results",d) if isinstance(d,dict) else d
        assert len(items)>=10
    def test_activities_count_known(self, client, auth_headers):
        r=client.get("/api/v1/activities/?limit=100",headers=auth_headers)
        _s(r,"actc_k"); assert r.status_code==200; assert len(r.json())>=1

class TestDataIntegrity:
    def test_leads_all_have_id(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=20",headers=auth_headers)
        _s(r,"di_l"); assert r.status_code==200
        for l in r.json(): assert l.get("id") is not None
    def test_assets_all_have_name(self, client, auth_headers):
        r=client.get("/api/v1/assets/?limit=20",headers=auth_headers)
        _s(r,"di_a"); assert r.status_code==200
        for a in r.json(): assert a.get("name") is not None
    def test_contracts_all_have_title(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=10",headers=auth_headers)
        _s(r,"di_c"); assert r.status_code==200
        for c in r.json(): assert c.get("title") is not None
    def test_invoices_all_have_number(self, client, auth_headers):
        r=client.get("/api/v1/invoices/?limit=10",headers=auth_headers)
        _s(r,"di_i"); assert r.status_code==200
        for inv in r.json(): assert inv.get("invoice_number") is not None
    def test_work_orders_all_have_type(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?limit=10",headers=auth_headers)
        _s(r,"di_wo"); assert r.status_code==200
        for wo in r.json(): assert wo.get("type") is not None

class TestAPIResponseTimes:
    def test_leads_fast(self, client, auth_headers):
        import time; t=time.time()
        r=client.get("/api/v1/leads/?limit=10",headers=auth_headers)
        _s(r,"rt_l"); assert r.status_code==200; assert time.time()-t<10
    def test_search_fast(self, client, auth_headers):
        import time; t=time.time()
        r=client.get("/api/v1/search/?q=hotel",headers=auth_headers)
        _s(r,"rt_s"); assert r.status_code==200; assert time.time()-t<10
    def test_health_fast(self, client, auth_headers):
        import time; t=time.time()
        r=client.get("/health",headers=auth_headers)
        _s(r,"rt_h"); assert r.status_code==200; assert time.time()-t<5

class TestPlatformFinal:
    def test_api_version_present(self, client, auth_headers):
        r=client.get("/",headers=auth_headers)
        _s(r,"pf_v"); assert r.status_code==200
        d=r.json(); assert "version" in d
    def test_search_returns_entity_types(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=hotel",headers=auth_headers)
        _s(r,"pf_et"); assert r.status_code==200
        d=r.json(); assert "entity_types" in d
    def test_quick_search_has_results_key(self, client, auth_headers):
        r=client.get("/api/v1/search/quick?q=work",headers=auth_headers)
        _s(r,"pf_qs"); assert r.status_code==200
        d=r.json(); assert "results" in d
    def test_pipeline_summary_has_data(self, client, auth_headers):
        r=client.get("/api/v1/actions/pipeline/summary",headers=auth_headers)
        _s(r,"pf_ps"); assert r.status_code==200
        assert isinstance(r.json(),dict)
