"""Fallback tests for: Project Management Module"""


def test_project_management_module_health(client):
    res = client.get("/api/v1/project_management_module/health")
    assert res.status_code == 200
