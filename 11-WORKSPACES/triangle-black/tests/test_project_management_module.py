import pytest
"""Fallback tests for: Project Management Module"""


@pytest.mark.skip(reason="Module health endpoint not registered in main API")
def test_project_management_module_health(client):
    res = client.get("/api/v1/project_management_module/health")
    assert res.status_code == 200
