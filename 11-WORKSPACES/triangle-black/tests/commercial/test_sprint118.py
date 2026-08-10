"""Sprint-118: Agent performance + executive + maintenance deep"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestAgentsDeep:
    def test_all_agents(self, client, auth_headers):
        r=client.get("/api/v1/agents/?limit=20",headers=auth_headers)
        _s(r,"ag_all"); assert r.status_code==200
        assert len(r.json())>=1
    def test_active_agents(self, client, auth_headers):
        r=client.get("/api/v1/agents/?is_active=true&limit=10",headers=auth_headers)
        _s(r,"ag_active"); assert r.status_code==200
    def test_agent_count(self, client, auth_headers):
        r=client.get("/api/v1/agents/?limit=5",headers=auth_headers)
        _s(r,"ag_cnt"); assert r.status_code==200

class TestExecutiveDeep:
    def test_daily_review(self, client, auth_headers):
        r=client.get("/api/v1/executive/daily-review",headers=auth_headers)
        _s(r,"ex_daily"); assert r.status_code in (200,404)
    def test_exceptions(self, client, auth_headers):
        r=client.get("/api/v1/executive/exceptions",headers=auth_headers)
        _s(r,"ex_exc"); assert r.status_code in (200,404)
    def test_risks(self, client, auth_headers):
        r=client.get("/api/v1/executive/risks",headers=auth_headers)
        _s(r,"ex_risks"); assert r.status_code in (200,404)

class TestMaintenanceDeep:
    def test_inspection_dashboard(self, client, auth_headers):
        r=client.get("/api/v1/maintenance/inspections?limit=5",headers=auth_headers)
        _s(r,"insp_list"); assert r.status_code in (200,404)
    def test_downtime(self, client, auth_headers):
        r=client.get("/api/v1/maintenance/downtime?limit=5",headers=auth_headers)
        _s(r,"downtime"); assert r.status_code in (200,404)
    def test_costs(self, client, auth_headers):
        r=client.get("/api/v1/maintenance/costs?limit=5",headers=auth_headers)
        _s(r,"maint_costs"); assert r.status_code in (200,404)

class TestSuppliersSearch:
    def test_search(self, client, auth_headers):
        r=client.get("/api/v1/suppliers/?limit=10",headers=auth_headers)
        _s(r,"sup_10"); assert r.status_code==200
        d=r.json(); items=d.get("results",d) if isinstance(d,dict) else d
        assert isinstance(items,list)
    def test_count(self, client, auth_headers):
        r=client.get("/api/v1/suppliers/?limit=1",headers=auth_headers)
        _s(r,"sup_1"); assert r.status_code==200
        d=r.json()
        if isinstance(d,dict): assert "count" in d

class TestServiceRequestsFilters:
    def test_open(self, client, auth_headers):
        r=client.get("/api/v1/service-requests/?status=open&limit=5",headers=auth_headers)
        _s(r,"sr_open"); assert r.status_code==200
    def test_high_urgency(self, client, auth_headers):
        r=client.get("/api/v1/service-requests/?urgency=high&limit=5",headers=auth_headers)
        _s(r,"sr_urgent"); assert r.status_code==200
    def test_category(self, client, auth_headers):
        r=client.get("/api/v1/service-requests/?category=HVAC&limit=5",headers=auth_headers)
        _s(r,"sr_hvac"); assert r.status_code==200
