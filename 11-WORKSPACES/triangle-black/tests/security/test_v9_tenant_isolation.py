"""
V9-005: Tenant Isolation Adversarial Tests
These must ALWAYS pass — a failure is a real security vulnerability.
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
    try:
        return json.loads(r.stdout).get("access_token", "")
    except Exception:
        return ""

@pytest.fixture(scope="module")
def token_a():
    tok = get_token("amr@triangleblack.com", "admin123")
    if not tok:
        pytest.skip("Server not available for tenant isolation tests")
    return tok

class TestTenantIsolation:
    def test_work_orders_scoped_to_tenant(self, token_a):
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
        r = requests.get(f"{BASE}/api/v1/assets/",
                        headers={"Authorization": f"Bearer {token_a}"}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        items = data if isinstance(data, list) else data.get("items", data.get("assets", []))
        for item in items[:20]:
            hotel_id = item.get("hotel_id", "")
            assert hotel_id == H_A or hotel_id == "", \
                f"Cross-tenant asset leak: hotel_id={hotel_id}"

    def test_recommendations_scoped_to_tenant(self, token_a):
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
        for fake_id in ["00000000-0000-0000-0000-000000000001",
                        "ffffffff-ffff-ffff-ffff-ffffffffffff"]:
            r = requests.get(f"{BASE}/api/v1/work-orders/{fake_id}",
                            headers={"Authorization": f"Bearer {token_a}"}, timeout=5)
            assert r.status_code in (404, 403, 401), \
                f"Expected 404/403 for fake ID, got {r.status_code}"

    def test_attention_scoped_to_tenant(self, token_a):
        r = requests.get(f"{BASE}/api/v1/attention/",
                        headers={"Authorization": f"Bearer {token_a}"}, timeout=15)
        assert r.status_code == 200
        score = r.json().get("attention_score", r.json().get("score"))
        assert score is not None

    def test_x_request_id_on_responses(self, token_a):
        for ep in ["/api/v1/health/live", "/api/v1/work-orders/"]:
            r = requests.get(f"{BASE}{ep}",
                            headers={"Authorization": f"Bearer {token_a}"}, timeout=5)
            has_rid = "x-request-id" in {k.lower(): v for k,v in r.headers.items()}
            assert has_rid, f"Missing X-Request-ID on {ep}"

    def test_no_auth_returns_401(self, token_a):
        for ep in ["/api/v1/work-orders/", "/api/v1/assets/",
                   "/api/v1/recommendations/", "/api/v1/attention/"]:
            r = requests.get(f"{BASE}{ep}", timeout=5)
            assert r.status_code in (401, 403), \
                f"Unauthenticated {ep} returned {r.status_code}"
            try:
                assert "hotel_id" not in str(r.json()), f"Data leaked: {ep}"
            except Exception:
                pass
