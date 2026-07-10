import uuid
import pytest
from fastapi.testclient import TestClient
from application.main import app
from core.schemas.sprint_plan import SprintPlanCreate

TEST_PREFIX = "TEST-PYTEST"

@pytest.fixture(scope="module")
def test_sprint_plan_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/orchestrator/plan-sprint/test-workspace",
        json={
            "epic": f"{TEST_PREFIX} Epic {unique}",
            "context": f"{TEST_PREFIX} Context {unique}"
        },
        headers=auth,
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    sprint_plan_id = res.json()["id"]
    yield sprint_plan_id
    client.delete(f"/orchestrator/plan-sprint/test-workspace/{sprint_plan_id}", headers=auth)

def test_plan_sprint_returns_results(client, auth):
    res = client.post(
        "/orchestrator/plan-sprint/test-workspace",
        json={
            "epic": "Test Epic",
            "context": "Test Context"
        },
        headers=auth,
    )
    assert res.status_code == 201
    data = res.json()
    assert 'id' in data
    assert 'workspace_id' in data
    assert 'epic' in data
    assert 'context' in data