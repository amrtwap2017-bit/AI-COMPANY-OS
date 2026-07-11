"""Fallback tests for: Maintenance Schedule Module"""


def test_maintenance_schedule_module_health(client):
    res = client.get("/api/v1/maintenance_schedule_module/health")
    assert res.status_code == 200
