"""
Sprint C-007: Paid Integration Architecture & Webhooks Verification Test
"""
import pytest
import requests

BASE = "http://localhost:8030"

_C = {}
def _auth():
    if "h" not in _C:
        r = requests.post(
            f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        assert r.status_code == 200
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_webhook_subscription_lifecycle():
    h = _auth()

    # 1. Create Subscription
    payload = {
        "target_url": "https://erp.hotelgroup.com/api/v1/webhooks/tb-events",
        "event_types": ["work_order.created", "invoice.paid", "sla.breached"]
    }
    r_sub = requests.post(f"{BASE}/api/v1/integrations/webhooks/subscribe", json=payload, headers=h, timeout=10)
    assert r_sub.status_code == 200, f"Webhook creation failed: {r_sub.text}"
    data_sub = r_sub.json()
    assert data_sub["success"] is True
    assert "secret_key" in data_sub
    assert data_sub["secret_key"].startswith("tb_sec_")

    # 2. List Subscriptions
    r_list = requests.get(f"{BASE}/api/v1/integrations/webhooks/subscriptions", headers=h, timeout=10)
    assert r_list.status_code == 200
    assert len(r_list.json()["subscriptions"]) >= 1

    # 3. Test Ping & Signature
    r_ping = requests.post(f"{BASE}/api/v1/integrations/webhooks/test-ping", json={"secret_key": data_sub["secret_key"]}, headers=h, timeout=10)
    assert r_ping.status_code == 200
    assert len(r_ping.json()["signature"]) == 64  # SHA-256 hex string

def test_iot_telemetry_ingestion():
    h = _auth()
    payload = {
        "asset_id": "ast-chiller-01",
        "vibration_rms": 5.8,  # Triggers anomaly threshold (> 4.5)
        "temperature_c": 72.0,
        "runtime_hours": 3200.0
    }
    r_iot = requests.post(f"{BASE}/api/v1/integrations/ingest/iot", json=payload, headers=h, timeout=10)
    assert r_iot.status_code == 200
    data = r_iot.json()
    assert data["success"] is True
    assert data["anomaly_detected"] is True
    assert data["action_queued"] == "DISPATCH_AI_DIRECTOR"
