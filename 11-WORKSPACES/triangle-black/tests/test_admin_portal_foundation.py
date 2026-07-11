"""Fallback tests for: Admin Portal Foundation"""


def test_admin_portal_foundation_health(client):
    res = client.get("/api/v1/admin_portal_foundation/health")
    assert res.status_code == 200
