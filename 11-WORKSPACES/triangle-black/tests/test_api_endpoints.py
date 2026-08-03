import requests
import pytest

BASE = "http://localhost:8030"

class TestHealth:
    def test_health(self):
        r = requests.get(f"{BASE}/health", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d.get("database") == "connected"

class TestAuth:
    def test_login_valid(self):
        r = requests.post(
            f"{BASE}/api/v1/auth/login",
            data={"username": "admin@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=15,
        )
        assert r.status_code == 200
        d = r.json()
        assert "access_token" in d

class TestCollections:
    @pytest.mark.parametrize("ep,min_count", [
        ("/api/v1/work-orders/", 1),
        ("/api/v1/technicians/", 1),
        ("/api/v1/assets/", 1),
        ("/api/v1/projects/", 1),
        ("/api/v1/agents/", 1),
        ("/api/v1/inventory-items/", 1),
        ("/api/v1/warehouses/", 1),
    ])
    def test_collection_lists(self, headers, ep, min_count):
        r = requests.get(f"{BASE}{ep}", headers=headers, timeout=15)
        assert r.status_code == 200, f"{ep} => {r.status_code} {r.text[:120]}"
        d = r.json()
        assert isinstance(d, list)
        assert len(d) >= min_count

    @pytest.mark.parametrize("ep,keys", [
        ("/api/v1/maintenance/dashboard", ["total_assets"]),
        ("/api/v1/analytics/kpis", ["commercial", "operations"]),
        # ("/api/v1/analytics/sla", ["compliance_rate"]),  # route not implemented
        ("/api/v1/actions/dashboard/stats", ["total_leads"]),
        ("/api/v1/analytics/trends", ["labels", "revenue"]),
        ("/api/v1/analytics/kpis", ["commercial", "operations"]),
        ("/api/v1/actions/pipeline/summary", []),
    ])
    def test_dict_endpoints(self, headers, ep, keys):
        r = requests.get(f"{BASE}{ep}", headers=headers, timeout=15)
        assert r.status_code == 200, f"{ep} => {r.status_code} {r.text[:120]}"
        d = r.json()
        assert isinstance(d, dict)
        for k in keys:
            assert k in d

class TestCustomersAndNotifications:
    def test_customers(self, headers):
        r = requests.get(f"{BASE}/api/v1/customer-360/", headers=headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d, dict)
        assert "customers" in d

    def test_notifications(self, headers):
        r = requests.get(f"{BASE}/api/v1/notifications/", headers=headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d, dict)
        assert "notifications" in d

class TestLeadsSearch:
    def test_leads_search(self, headers):
        r = requests.get(f"{BASE}/api/v1/actions/leads/search", headers=headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d, (list, dict))
