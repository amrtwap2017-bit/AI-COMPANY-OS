"""Fallback tests for: Mobile API for Field Technicians"""


def test_mobile_api_for_field_technicians_health(client):
    res = client.get("/api/v1/mobile_api_for_field_technicians/health")
    assert res.status_code == 200
