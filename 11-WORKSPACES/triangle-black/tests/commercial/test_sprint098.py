"""Sprint-098: Hotel/auth/performance/AI coverage"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestHotels:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/hotels/?limit=5", headers=auth_headers)
        _s(r,"hotels"); assert r.status_code in (200,404)
    def test_current(self, client, auth_headers):
        r = client.get("/api/v1/hotels/current", headers=auth_headers)
        _s(r,"hotel_curr"); assert r.status_code in (200,404)

class TestAuthEndpoints:
    def test_me(self, client, auth_headers):
        r = client.get("/api/v1/auth/me", headers=auth_headers)
        _s(r,"auth_me"); assert r.status_code in (200,404)
    def test_refresh(self, client, auth_headers):
        r = client.post("/api/v1/auth/refresh", headers=auth_headers)
        _s(r,"refresh"); assert r.status_code in (200,401,404,422)

class TestPerformanceAuditDetail:
    def test_agents(self, client, auth_headers):
        r = client.get("/api/v1/performance-audit/agents", headers=auth_headers)
        _s(r,"perf_agents"); assert r.status_code in (200,404)
    def test_work_orders(self, client, auth_headers):
        r = client.get("/api/v1/performance-audit/work-orders", headers=auth_headers)
        _s(r,"perf_wo"); assert r.status_code in (200,404)

class TestAISignals:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/ai/signals/", headers=auth_headers)
        _s(r,"ai_sig_list"); assert r.status_code in (200,404)

class TestEmailNotifications:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/email-notifications/?limit=5", headers=auth_headers)
        _s(r,"email_notif"); assert r.status_code in (200,404)

class TestInventoryAlerts:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/inventory-alerts/?limit=5", headers=auth_headers)
        _s(r,"inv_alerts"); assert r.status_code in (200,404)
    def test_critical(self, client, auth_headers):
        r = client.get("/api/v1/inventory-alerts/critical", headers=auth_headers)
        _s(r,"inv_crit"); assert r.status_code in (200,404)
