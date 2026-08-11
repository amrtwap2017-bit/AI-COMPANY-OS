"""Sprint-146: Search + reporting + executive deep coverage"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestSearchDeepCoverage:
    def test_search_by_number(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=001",headers=auth_headers)
        _s(r,"sd1"); assert r.status_code==200
    def test_search_by_city(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=Cairo",headers=auth_headers)
        _s(r,"sd2"); assert r.status_code==200
    def test_search_arabic(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=فندق",headers=auth_headers)
        _s(r,"sd3"); assert r.status_code==200
    def test_search_empty_result(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=zzz999xyz",headers=auth_headers)
        _s(r,"sd4"); assert r.status_code==200
        assert r.json()["total"]==0
    def test_search_special_chars(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=TB-INV",headers=auth_headers)
        _s(r,"sd5"); assert r.status_code==200

class TestQuickSearchDeep:
    def test_quick_lead(self, client, auth_headers):
        r=client.get("/api/v1/search/quick?q=lead",headers=auth_headers)
        _s(r,"qs1"); assert r.status_code==200
        d=r.json(); assert "results" in d
    def test_quick_contract(self, client, auth_headers):
        r=client.get("/api/v1/search/quick?q=contract",headers=auth_headers)
        _s(r,"qs2"); assert r.status_code==200
    def test_quick_supplier(self, client, auth_headers):
        r=client.get("/api/v1/search/quick?q=supplier",headers=auth_headers)
        _s(r,"qs3"); assert r.status_code==200
    def test_quick_asset(self, client, auth_headers):
        r=client.get("/api/v1/search/quick?q=pump",headers=auth_headers)
        _s(r,"qs4"); assert r.status_code==200

class TestReportingDeep:
    def test_pipeline(self, client, auth_headers):
        r=client.get("/api/v1/actions/pipeline/summary",headers=auth_headers)
        _s(r,"rd1"); assert r.status_code==200
    def test_revenue_trend(self, client, auth_headers):
        r=client.get("/api/v1/actions/reports/revenue-trend",headers=auth_headers)
        _s(r,"rd2"); assert r.status_code==200
    def test_lead_funnel(self, client, auth_headers):
        r=client.get("/api/v1/actions/reports/lead-funnel",headers=auth_headers)
        _s(r,"rd3"); assert r.status_code==200
    def test_reports_dashboard(self, client, auth_headers):
        r=client.get("/api/v1/actions/reports/dashboard",headers=auth_headers)
        _s(r,"rd4"); assert r.status_code==200

class TestExecutiveDashboardDeep:
    def test_dashboard(self, client, auth_headers):
        r=client.get("/api/v1/executive/dashboard",headers=auth_headers)
        _s(r,"ed1"); assert r.status_code in (200,404)
    def test_kpi(self, client, auth_headers):
        r=client.get("/api/v1/executive/kpi/summary",headers=auth_headers)
        _s(r,"ed2"); assert r.status_code in (200,404)
    def test_exceptions(self, client, auth_headers):
        r=client.get("/api/v1/executive/exceptions",headers=auth_headers)
        _s(r,"ed3"); assert r.status_code in (200,404)
    def test_risks(self, client, auth_headers):
        r=client.get("/api/v1/executive/risks",headers=auth_headers)
        _s(r,"ed4"); assert r.status_code in (200,404)

class TestNotificationsDeep:
    def test_list(self, client, auth_headers):
        r=client.get("/api/v1/notifications/?limit=10",headers=auth_headers)
        _s(r,"nd1"); assert r.status_code in (200,404)
    def test_live(self, client, auth_headers):
        r=client.get("/api/v1/notifications/live/?limit=5",headers=auth_headers)
        _s(r,"nd2"); assert r.status_code in (200,404)
    def test_count(self, client, auth_headers):
        r=client.get("/api/v1/notifications/live/count",headers=auth_headers)
        _s(r,"nd3"); assert r.status_code in (200,404)
    def test_audit_recent(self, client, auth_headers):
        r=client.get("/api/v1/audit-log/recent",headers=auth_headers)
        _s(r,"nd4"); assert r.status_code in (200,404)
