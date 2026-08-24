"""Sprint D-024: SaaS Subscription Portal + Webhook Management Portal"""
import requests

BASE = "http://localhost:8030"
_C = {}

def _auth():
    if "h" not in _C:
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        assert r.status_code == 200
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_plans_matrix_public():
    r = requests.get(f"{BASE}/api/v1/plans/matrix", timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert "plans" in d
    assert len(d["plans"]) == 3
    plan_ids = [p["id"] for p in d["plans"]]
    assert "foundation" in plan_ids
    assert "intelligence" in plan_ids
    assert "enterprise" in plan_ids

def test_tenant_entitlements():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/plans/my-entitlements", headers=h, timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert "active_plan" in d
    assert "usage" in d
    assert "enabled_features" in d
    assert d["usage"]["assets_limit"] > 0

def test_checkout_session_creation():
    h = _auth()
    r = requests.post(f"{BASE}/api/v1/billing/checkout-session",
        json={"plan_id": "intelligence"}, headers=h, timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert d["success"] is True
    assert "checkout_url" in d
    assert d["plan_id"] == "intelligence"
    assert "session_id" in d

def test_webhook_subscription_and_list():
    h = _auth()
    r_sub = requests.post(f"{BASE}/api/v1/integrations/webhooks/subscribe",
        json={"target_url": "https://test.erp.com/webhooks", "event_types": ["work_order.created"]},
        headers=h, timeout=10)
    assert r_sub.status_code == 200
    assert r_sub.json()["success"] is True

    r_list = requests.get(f"{BASE}/api/v1/integrations/webhooks/subscriptions", headers=h, timeout=10)
    assert r_list.status_code == 200
    assert len(r_list.json()["subscriptions"]) >= 1

def test_webhook_test_ping():
    h = _auth()
    r = requests.post(f"{BASE}/api/v1/integrations/webhooks/test-ping", json={}, headers=h, timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert d["success"] is True
    assert len(d["signature"]) == 64
