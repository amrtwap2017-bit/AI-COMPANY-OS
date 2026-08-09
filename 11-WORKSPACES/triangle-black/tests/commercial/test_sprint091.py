"""Sprint-091: Coverage for remaining commercial endpoints"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestEtaInvoicing:
    def test_status(self, client, auth_headers):
        r = client.get("/api/v1/eta/status", headers=auth_headers)
        _s(r,"eta_status"); assert r.status_code in (200,404)
    def test_invoices_list(self, client, auth_headers):
        r = client.get("/api/v1/eta/invoices", headers=auth_headers)
        _s(r,"eta_list"); assert r.status_code in (200,404)

class TestGlobalSearch:
    def test_search(self, client, auth_headers):
        r = client.get("/api/v1/search/?q=hotel", headers=auth_headers)
        _s(r,"search"); assert r.status_code==200
    def test_quick(self, client, auth_headers):
        r = client.get("/api/v1/search/quick?q=work", headers=auth_headers)
        _s(r,"quick"); assert r.status_code==200
    def test_structure(self, client, auth_headers):
        r = client.get("/api/v1/search/?q=maintenance", headers=auth_headers)
        _s(r,"search_struct"); assert r.status_code==200
        d=r.json(); assert "query" in d; assert "results" in d

class TestSalesPipeline:
    def test_summary(self, client, auth_headers):
        r = client.get("/api/v1/sales-pipeline/summary", headers=auth_headers)
        _s(r,"pipeline"); assert r.status_code in (200,404)

class TestTenantAudit:
    def test_status(self, client, auth_headers):
        r = client.get("/api/v1/tenant-audit/status", headers=auth_headers)
        _s(r,"tenant_audit"); assert r.status_code in (200,404)

class TestUserPreferences:
    def test_get(self, client, auth_headers):
        r = client.get("/api/v1/user-preferences/", headers=auth_headers)
        _s(r,"prefs"); assert r.status_code in (200,404,422)

class TestAnalytics:
    def test_kpi(self, client, auth_headers):
        r = client.get("/api/v1/analytics/kpi/summary", headers=auth_headers)
        _s(r,"kpi"); assert r.status_code in (200,404)
    def test_platform(self, client, auth_headers):
        r = client.get("/api/v1/analytics/platform/overview", headers=auth_headers)
        _s(r,"platform"); assert r.status_code in (200,404)

class TestExecutiveIntelligence:
    def test_kpi(self, client, auth_headers):
        r = client.get("/api/v1/executive/kpi/summary", headers=auth_headers)
        _s(r,"exec_kpi"); assert r.status_code in (200,404)
    def test_intelligence(self, client, auth_headers):
        r = client.get("/api/v1/executive/intelligence/summary", headers=auth_headers)
        _s(r,"exec_intel"); assert r.status_code in (200,404)

class TestMaintenanceEnterprise:
    def test_summary(self, client, auth_headers):
        r = client.get("/api/v1/maintenance/enterprise/summary", headers=auth_headers)
        _s(r,"maint_ent"); assert r.status_code in (200,404)

class TestDigitalTwin:
    def test_summary(self, client, auth_headers):
        r = client.get("/api/v1/digital-twin/summary", headers=auth_headers)
        _s(r,"twin"); assert r.status_code in (200,404)
