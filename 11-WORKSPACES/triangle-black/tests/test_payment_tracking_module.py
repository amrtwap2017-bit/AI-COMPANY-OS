"""Fallback tests for: Payment Tracking Module"""


def test_payment_tracking_module_health(client):
    res = client.get("/api/v1/payment_tracking_module/health")
    assert res.status_code == 200
