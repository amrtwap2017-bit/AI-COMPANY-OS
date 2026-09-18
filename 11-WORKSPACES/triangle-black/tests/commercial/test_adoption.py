"""Customer Adoption Intelligence Tests — V15 P2."""
import requests
import pytest

BASE = "http://localhost:8030"


class TestAdoptionAuth:
    def test_health_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/adoption/health", timeout=5)
        assert r.status_code in (401, 403)

    def test_event_requires_auth(self):
        r = requests.post(f"{BASE}/api/v1/adoption/event",
                         json={"event_type": "LOGIN"}, timeout=5)
        assert r.status_code in (401, 403)


class TestAdoptionHealth:
    def test_health_score_returns(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/adoption/health?days=7",
                        headers=auth_headers, timeout=10)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200
        d = r.json()
        assert "health_score" in d
        assert "active_users" in d
        assert "health_label" in d
        assert 0 <= d["health_score"] <= 100

    def test_record_adoption_event(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/adoption/event",
                         headers={"Authorization": auth_headers["Authorization"],
                                  "Content-Type": "application/json"},
                         json={"event_type": "WO_CREATED",
                               "entity_type": "work_order",
                               "entity_id": "test-wo-001"},
                         timeout=10)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200
        d = r.json()
        assert "recorded" in d

    def test_health_score_after_event(self, auth_headers):
        """After recording events, health score should be queryable."""
        # Record some events first
        for event in ["LOGIN", "REC_VIEWED", "WO_CREATED"]:
            requests.post(f"{BASE}/api/v1/adoption/event",
                         headers={"Authorization": auth_headers["Authorization"],
                                  "Content-Type": "application/json"},
                         json={"event_type": event}, timeout=5)

        r = requests.get(f"{BASE}/api/v1/adoption/health?days=1",
                        headers=auth_headers, timeout=10)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200
        d = r.json()
        assert d["health_score"] >= 0
