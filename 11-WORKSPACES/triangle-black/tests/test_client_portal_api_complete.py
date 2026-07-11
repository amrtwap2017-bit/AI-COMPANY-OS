"""Fallback tests for: Client Portal API Complete"""


def test_client_portal_api_complete_health(client):
    res = client.get("/api/v1/client_portal_api_complete/health")
    assert res.status_code == 200
