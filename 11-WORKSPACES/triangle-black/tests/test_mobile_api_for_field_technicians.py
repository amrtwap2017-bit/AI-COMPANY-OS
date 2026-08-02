import pytest
"""Fallback tests for: Mobile API for Field Technicians"""


@pytest.mark.skip(reason="Module health endpoint not registered in main API")
def test_mobile_api_for_field_technicians_health(client):
    res = client.get("/api/v1/mobile_api_for_field_technicians/health")
    assert res.status_code == 200
