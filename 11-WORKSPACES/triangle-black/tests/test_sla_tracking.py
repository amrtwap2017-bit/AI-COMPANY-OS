"""Fallback tests for: SLA Tracking"""


def test_sla_tracking_health(client):
    res = client.get("/api/v1/sla_tracking/health")
    assert res.status_code == 200
