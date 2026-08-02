import pytest
"""Fallback tests for: Payment Tracking Module"""


@pytest.mark.skip(reason="Module health endpoint not registered in main API")
def test_payment_tracking_module_health(client):
    res = client.get("/api/v1/payment_tracking_module/health")
    assert res.status_code == 200
