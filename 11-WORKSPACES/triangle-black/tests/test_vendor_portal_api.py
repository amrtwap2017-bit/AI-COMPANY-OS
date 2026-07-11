"""Fallback tests for: Vendor Portal API"""


def test_vendor_portal_api_health(client):
    res = client.get("/api/v1/vendor_portal_api/health")
    assert res.status_code == 200
