"""Fallback tests for: Client Portal API Layer"""


def test_client_portal_api_layer_health(client):
    res = client.get("/api/v1/client_portal_api_layer/health")
    assert res.status_code == 200
