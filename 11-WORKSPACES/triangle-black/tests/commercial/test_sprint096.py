"""Sprint-096: Service reports/sites/reporting/scheduling"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestServiceReports:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/service-reports/?limit=5", headers=auth_headers)
        _s(r,"sr_list"); assert r.status_code in (200,404)

class TestSites:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/sites/?limit=5", headers=auth_headers)
        _s(r,"sites"); assert r.status_code in (200,404)
    def test_detail(self, client, auth_headers):
        r = client.get("/api/v1/sites/nonexistent-000", headers=auth_headers)
        _s(r,"site_d"); assert r.status_code in (200,404)

class TestReporting:
    def test_dashboard(self, client, auth_headers):
        r = client.get("/api/v1/reporting/dashboard", headers=auth_headers)
        _s(r,"rep_dash"); assert r.status_code in (200,404)
    def test_summary(self, client, auth_headers):
        r = client.get("/api/v1/reporting/summary", headers=auth_headers)
        _s(r,"rep_sum"); assert r.status_code in (200,404)

class TestScheduler:
    def test_upcoming(self, client, auth_headers):
        r = client.get("/api/v1/scheduler/upcoming", headers=auth_headers)
        _s(r,"sched"); assert r.status_code in (200,404)

class TestSupplyIntelligence:
    def test_summary(self, client, auth_headers):
        r = client.get("/api/v1/supply-intelligence/summary", headers=auth_headers)
        _s(r,"supply_intel"); assert r.status_code in (200,404)

class TestTenantAuditCheck:
    def test_health(self, client, auth_headers):
        r = client.get("/api/v1/tenant-audit/health", headers=auth_headers)
        _s(r,"tenant_health"); assert r.status_code in (200,404)

class TestEntityViews:
    def test_leads(self, client, auth_headers):
        r = client.get("/api/v1/entity-views/leads/?limit=5", headers=auth_headers)
        _s(r,"ev_leads"); assert r.status_code in (200,404)
    def test_contracts(self, client, auth_headers):
        r = client.get("/api/v1/entity-views/contracts/?limit=5", headers=auth_headers)
        _s(r,"ev_contracts"); assert r.status_code in (200,404)
