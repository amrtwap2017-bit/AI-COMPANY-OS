"""Fallback tests for: Analytics API"""


def test_analytics_api_health(client):
    res = client.get("/api/v1/analytics_api/health")
    assert res.status_code == 200
