"""Notification Delivery Lifecycle Tests — V15.0."""
import requests
import pytest

BASE = "http://localhost:8030"


class TestNotificationLifecycleAuth:
    def test_summary_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/notifications/lifecycle/summary", timeout=5)
        assert r.status_code in (401, 403)

    def test_failed_list_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/notifications/lifecycle/failed", timeout=5)
        assert r.status_code in (401, 403)


class TestNotificationDeliverySummary:
    def test_summary_returns(self, auth_headers):
        r = requests.get(
            f"{BASE}/api/v1/notifications/lifecycle/summary?days=7",
            headers=auth_headers, timeout=10
        )
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200
        d = r.json()
        assert "total" in d
        assert "delivery_rate_pct" in d
        assert "by_status" in d
        assert 0 <= d["delivery_rate_pct"] <= 100

    def test_failed_list_returns(self, auth_headers):
        r = requests.get(
            f"{BASE}/api/v1/notifications/lifecycle/failed?limit=5",
            headers=auth_headers, timeout=10
        )
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200
        d = r.json()
        assert "failed_notifications" in d
        assert "count" in d

    def test_delivery_columns_exist_in_db(self, auth_headers):
        """Verify DB columns were added — indirect via API working."""
        r = requests.get(
            f"{BASE}/api/v1/notifications/lifecycle/summary",
            headers=auth_headers, timeout=10
        )
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200
