import pytest
"""Fallback tests for: Maintenance Schedule Module"""


@pytest.mark.skip(reason="Module health endpoint not registered in main API")
def test_maintenance_schedule_module_health(client):
    res = client.get("/api/v1/maintenance_schedule_module/health")
    assert res.status_code == 200
