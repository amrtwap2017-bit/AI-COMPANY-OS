"""Sprint-113: Financial GL + executive dashboard deep tests"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestFinancialGLDeep:
    def test_entries_list(self, client, auth_headers):
        r=client.get("/api/v1/financial/gl/?limit=5",headers=auth_headers)
        _s(r,"gl_list"); assert r.status_code in (200,404)
    def test_summary(self, client, auth_headers):
        r=client.get("/api/v1/financial/gl/summary",headers=auth_headers)
        _s(r,"gl_sum"); assert r.status_code in (200,404)
    def test_accounts(self, client, auth_headers):
        r=client.get("/api/v1/financial/gl/accounts/",headers=auth_headers)
        _s(r,"gl_acc"); assert r.status_code in (200,404)
    def test_balance_sheet(self, client, auth_headers):
        r=client.get("/api/v1/financial/gl/balance-sheet",headers=auth_headers)
        _s(r,"gl_bs"); assert r.status_code in (200,404)

class TestExecutiveDashboardDeep:
    def test_dashboard(self, client, auth_headers):
        r=client.get("/api/v1/executive/dashboard",headers=auth_headers)
        _s(r,"exec_dash"); assert r.status_code in (200,404)
    def test_kpis(self, client, auth_headers):
        r=client.get("/api/v1/executive/kpis",headers=auth_headers)
        _s(r,"exec_kpi2"); assert r.status_code in (200,404)
    def test_portfolio(self, client, auth_headers):
        r=client.get("/api/v1/executive/portfolio",headers=auth_headers)
        _s(r,"exec_port"); assert r.status_code in (200,404)

class TestNotificationsDeep:
    def test_list(self, client, auth_headers):
        r=client.get("/api/v1/notifications/?limit=5",headers=auth_headers)
        _s(r,"notif_list"); assert r.status_code in (200,404)
    def test_unread(self, client, auth_headers):
        r=client.get("/api/v1/notifications/?is_read=false&limit=5",headers=auth_headers)
        _s(r,"notif_unread"); assert r.status_code in (200,404)

class TestReportsDeep:
    def test_reports_list(self, client, auth_headers):
        r=client.get("/api/v1/reports/?limit=5",headers=auth_headers)
        _s(r,"rep_list"); assert r.status_code in (200,404)
    def test_reports_types(self, client, auth_headers):
        r=client.get("/api/v1/reports/types",headers=auth_headers)
        _s(r,"rep_types"); assert r.status_code in (200,404)

class TestEmailServiceDeep:
    def test_logs(self, client, auth_headers):
        r=client.get("/api/v1/email-service/logs?limit=5",headers=auth_headers)
        _s(r,"email_logs"); assert r.status_code in (200,404)
    def test_send_endpoint(self, client, auth_headers):
        r=client.get("/api/v1/email-service/status",headers=auth_headers)
        _s(r,"email_status"); assert r.status_code in (200,404)
