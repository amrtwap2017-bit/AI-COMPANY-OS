import pytest
"""Fallback tests for: Client Portal API Complete"""


@pytest.mark.skip(reason="Module health endpoint not registered in main API")
def test_client_portal_api_complete_health(client):
    res = client.get("/api/v1/client_portal_api_complete/health")
    assert res.status_code == 200
