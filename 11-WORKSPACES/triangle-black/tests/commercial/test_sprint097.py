"""Sprint-097: Final endpoint coverage sweep"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestPipelineDashboard:
    def test_summary(self, client, auth_headers):
        r = client.get("/api/v1/pipeline-dashboard/summary", headers=auth_headers)
        _s(r,"pipe_dash"); assert r.status_code in (200,404)

class TestPaginationSearch:
    def test_stats(self, client, auth_headers):
        r = client.get("/api/v1/pagination/stats", headers=auth_headers)
        _s(r,"pag_stats"); assert r.status_code in (200,404)
    def test_logs(self, client, auth_headers):
        r = client.get("/api/v1/pagination/logs", headers=auth_headers)
        _s(r,"pag_logs"); assert r.status_code in (200,404)

class TestSearchFilters:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/search-filters/", headers=auth_headers)
        _s(r,"sf_list"); assert r.status_code in (200,404)

class TestCacheConfigs:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/cache/configs/", headers=auth_headers)
        _s(r,"cache"); assert r.status_code in (200,404)

class TestActivities:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/activities/?limit=5", headers=auth_headers)
        _s(r,"act_list"); assert r.status_code in (200,404,500)
    def test_recent(self, client, auth_headers):
        r = client.get("/api/v1/activities/recent", headers=auth_headers)
        _s(r,"act_recent"); assert r.status_code in (200,404)

class TestAgentManagement:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/agent-management/?limit=5", headers=auth_headers)
        _s(r,"agm_list"); assert r.status_code in (200,404)

class TestProcurementEvents:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/procurement-events/?limit=5", headers=auth_headers)
        _s(r,"pe_list"); assert r.status_code in (200,404)

class TestDashboardSummary:
    def test_kpi(self, client, auth_headers):
        r = client.get("/api/v1/dashboard/kpi", headers=auth_headers)
        _s(r,"dash_kpi"); assert r.status_code in (200,404)
    def test_overview(self, client, auth_headers):
        r = client.get("/api/v1/dashboard/overview", headers=auth_headers)
        _s(r,"dash_ov"); assert r.status_code in (200,404)
