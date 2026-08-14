"""
Sprint-156: Tests for endpoints added/fixed in Sprint-153, 154, 155
- /api/v1/health/ready
- /api/v1/health/live
- /api/v1/workspace/my-day
- leads?status=cold (was 500, now 200)
- leads?status=warm (was 500, now 200)
- work-orders?limit=500 (was 422, now 200)
"""
import requests
import pytest

BASE_URL = "http://localhost:8030"


def _s(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


class TestHealthEndpoints:
    def test_health_ready_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/health/ready")
        _s(r, "health_ready")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"

    def test_health_ready_has_status_field(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/health/ready")
        _s(r, "health_ready_fields")
        assert r.status_code in (200, 503)
        d = r.json()
        assert "status" in d
        assert "database" in d

    def test_health_ready_database_connected(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/health/ready")
        _s(r, "health_ready_db")
        if r.status_code == 200:
            assert r.json()["database"] == "connected"

    def test_health_live_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/health/live")
        _s(r, "health_live")
        assert r.status_code == 200

    def test_health_live_has_timestamp(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/health/live")
        _s(r, "health_live_ts")
        assert r.status_code == 200
        d = r.json()
        assert "status" in d
        assert d["status"] == "live"
        assert "timestamp" in d
        assert isinstance(d["timestamp"], int)

    def test_health_live_no_auth_required(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/health/live")
        _s(r, "health_live_noauth")
        assert r.status_code == 200


class TestMyDayEndpoint:
    def test_my_day_no_token_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/workspace/my-day")
        _s(r, "my_day_notoken")
        assert r.status_code == 200

    def test_my_day_no_token_tenant_null(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/workspace/my-day")
        _s(r, "my_day_notoken_tenant")
        assert r.status_code == 200
        d = r.json()
        assert d.get("tenant") is None

    def test_my_day_with_token_returns_200(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/v1/workspace/my-day",
            headers=auth_headers
        )
        _s(r, "my_day_token")
        assert r.status_code == 200

    def test_my_day_with_token_has_tenant(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/v1/workspace/my-day",
            headers=auth_headers
        )
        _s(r, "my_day_tenant_field")
        assert r.status_code == 200
        d = r.json()
        assert "tenant" in d
        assert d["tenant"] is not None
        assert d["tenant"] == "tb-default-hotel-000000000001"

    def test_my_day_response_shape(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/v1/workspace/my-day",
            headers=auth_headers
        )
        _s(r, "my_day_shape")
        assert r.status_code == 200
        d = r.json()
        assert "items" in d
        assert "count" in d
        assert isinstance(d["items"], list)
        assert isinstance(d["count"], int)

    def test_my_day_count_matches_items(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/v1/workspace/my-day",
            headers=auth_headers
        )
        _s(r, "my_day_count")
        assert r.status_code == 200
        d = r.json()
        assert d["count"] == len(d["items"])


class TestLeadsStatusFix:
    def test_leads_status_cold_returns_200(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/v1/leads/?status=cold",
            headers=auth_headers
        )
        _s(r, "leads_cold")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"

    def test_leads_status_warm_returns_200(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/v1/leads/?status=warm",
            headers=auth_headers
        )
        _s(r, "leads_warm")
        assert r.status_code == 200

    def test_leads_status_cold_returns_list(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/v1/leads/?status=cold",
            headers=auth_headers
        )
        _s(r, "leads_cold_list")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_leads_status_new_returns_200(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/v1/leads/?status=new",
            headers=auth_headers
        )
        _s(r, "leads_new")
        assert r.status_code == 200

    def test_leads_no_sa_instance_state(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/v1/leads/?limit=5",
            headers=auth_headers
        )
        _s(r, "leads_no_sa")
        assert r.status_code == 200
        leads = r.json()
        if leads:
            for key in leads[0].keys():
                assert not key.startswith("_"), f"Internal key leaked: {key}"


class TestWorkOrdersLimitFix:
    def test_work_orders_limit_500_returns_200(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/v1/work-orders/?limit=500",
            headers=auth_headers
        )
        _s(r, "wo_limit_500")
        assert r.status_code == 200, f"limit=500 should be valid, got {r.status_code}"

    def test_work_orders_limit_1000_returns_200(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/v1/work-orders/?limit=1000",
            headers=auth_headers
        )
        _s(r, "wo_limit_1000")
        assert r.status_code == 200

    def test_work_orders_limit_5000_returns_422(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/v1/work-orders/?limit=5000",
            headers=auth_headers
        )
        _s(r, "wo_limit_5000")
        assert r.status_code in (422, 429), f"limit=5000 should be rejected, got {r.status_code}"
