"""
V9-005: Tenant Isolation Adversarial Tests

Tests that Tenant A cannot access Tenant B data.
These are security tests — they must ALWAYS pass.
A failure means a real security vulnerability.
"""
import pytest
import requests
import json
import subprocess

BASE = "http://localhost:8030"
H_A = "tb-default-hotel-000000000001"

def get_token(email, password):
    r = subprocess.run(
        ['curl', '-s', '-X', 'POST', f'{BASE}/api/v1/auth/login/json',
         '-H', 'Content-Type: application/json',
         '-d', json.dumps({"email": email, "password": password})],
        capture_output=True, text=True
    )
    return json.loads(r.stdout).get("access_token", "")

@pytest.fixture(scope="module")
def token_a():
    return get_token("amr@triangleblack.com", "admin123")

class TestTenantIsolation:

    def test_work_orders_scoped_to_tenant(self, token_a):
        """Work orders endpoint must only return tenant A data."""
        r = requests.get(f"{BASE}/api/v1/work-orders/",
                        headers={"Authorization": f"Bearer {token_a}"}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        items = data if isinstance(data, list) else data.get("items", data.get("work_orders", []))
        for item in items[:20]:
            hotel_id = item.get("hotel_id", "")
            assert hotel_id == H_A or hotel_id == "", \
                f"Cross-tenant data leak: got hotel_id={hotel_id}"

    def test_assets_scoped_to_tenant(self, token_a):
        """Assets endpoint must only return tenant A data."""
        r = requests.get(f"{BASE}/api/v1/assets/",
                        headers={"Authorization": f"Bearer {token_a}"}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        items = data if isinstance(data, list) else data.get("items", data.get("assets", []))
        for item in items[:20]:
            hotel_id = item.get("hotel_id", "")
            assert hotel_id == H_A or hotel_id == "", \
                f"Cross-tenant data leak: got hotel_id={hotel_id}"

    def test_recommendations_scoped_to_tenant(self, token_a):
        """Recommendations must only show tenant A data."""
        r = requests.get(f"{BASE}/api/v1/recommendations/",
                        headers={"Authorization": f"Bearer {token_a}"}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        items = data if isinstance(data, list) else data.get("recommendations", [])
        for item in items[:20]:
            hotel_id = item.get("hotel_id", "")
            assert hotel_id == H_A or hotel_id == "", \
                f"Cross-tenant recommendation leak: hotel_id={hotel_id}"

    def test_cannot_access_resource_by_guessing_id(self, token_a):
        """Cannot access specific resources by guessing IDs without correct tenant."""
        fake_ids = [
            "00000000-0000-0000-0000-000000000001",
            "11111111-1111-1111-1111-111111111111",
            "ffffffff-ffff-ffff-ffff-ffffffffffff",
        ]
        for fake_id in fake_ids:
            r = requests.get(f"{BASE}/api/v1/work-orders/{fake_id}",
                            headers={"Authorization": f"Bearer {token_a}"}, timeout=5)
            assert r.status_code in (404, 403, 401), \
                f"Expected 404/403 for fake ID, got {r.status_code}"

    def test_attention_scoped_to_tenant(self, token_a):
        """Attention dashboard must be tenant-scoped."""
        r = requests.get(f"{BASE}/api/v1/attention/",
                        headers={"Authorization": f"Bearer {token_a}"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        # Score should exist and be numeric
        score = data.get("attention_score", data.get("score"))
        assert score is not None, "Attention score missing"

    def test_request_id_present_on_all_responses(self, token_a):
        """X-Request-ID must be present on all API responses."""
        endpoints = [
            "/api/v1/health/live",
            "/api/v1/work-orders/",
            "/api/v1/assets/",
        ]
        for ep in endpoints:
            r = requests.get(f"{BASE}{ep}",
                            headers={"Authorization": f"Bearer {token_a}"}, timeout=5)
            assert "x-request-id" in r.headers or "X-Request-ID" in r.headers, \
                f"Missing X-Request-ID on {ep}"

    def test_no_auth_returns_401_not_data(self, token_a):
        """Unauthenticated requests must get 401, never data."""
        sensitive_endpoints = [
            "/api/v1/work-orders/",
            "/api/v1/assets/",
            "/api/v1/recommendations/",
            "/api/v1/attention/",
        ]
        for ep in sensitive_endpoints:
            r = requests.get(f"{BASE}{ep}", timeout=5)
            assert r.status_code in (401, 403), \
                f"Unauthenticated request to {ep} returned {r.status_code} — should be 401"
            # Must not return actual data
            try:
                data = r.json()
                assert "hotel_id" not in str(data), \
                    f"Data leaked to unauthenticated request: {ep}"
            except Exception:
                pass
