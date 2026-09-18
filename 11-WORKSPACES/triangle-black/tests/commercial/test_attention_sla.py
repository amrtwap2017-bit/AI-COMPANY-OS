"""Attention SLA Event History Tests — V15 P1."""
import requests
import pytest

BASE = "http://localhost:8030"


class TestSLAAuth:
    def test_record_event_requires_auth(self):
        r = requests.post(f"{BASE}/api/v1/attention/sla/event",
                         json={"event_type": "DETECTED"}, timeout=5)
        assert r.status_code in (401, 403)

    def test_summary_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/attention/sla/summary", timeout=5)
        assert r.status_code in (401, 403)


class TestSLAEvents:
    def test_record_sla_event(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/attention/sla/event",
                         headers=auth_headers,
                         json={"event_type": "DETECTED", "priority": "P0",
                               "notes": "Critical AC failure detected"},
                         timeout=10)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200
        d = r.json()
        assert d.get("success") is True
        assert "event_id" in d
        assert d.get("sla_target_min") == 15  # P0 = 15 min

    def test_sla_summary_returns(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/attention/sla/summary?days=7",
                        headers=auth_headers, timeout=10)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200
        d = r.json()
        assert "hotel_id" in d
        assert "by_priority" in d
        assert "generated_at" in d

    def test_sla_history_returns(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/attention/sla/history?limit=5",
                        headers=auth_headers, timeout=10)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200
        d = r.json()
        assert "events" in d
        assert "count" in d
