import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from src.main import app, get_db
from src.core.auth import create_access_token
from src.commercial.pipeline_dashboard.models import Pipeline
from src.commercial.pipeline_dashboard.repository import PipelineRepository


@pytest.fixture(scope="module")
def test_pipeline_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/pipeline",
        json={"stage": "lead", "quote_total": 1000.0},
        headers=auth,
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    pipeline_id = res.json()["id"]
    yield pipeline_id
    client.delete(f"/api/v1/pipeline/{pipeline_id}", headers=auth)


def test_list_pipelines(client, auth):
    res = client.get("/api/v1/pipeline", headers=auth)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_create_pipeline(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/pipeline",
        json={"stage": "lead", "quote_total": 1000.0},
        headers=auth,
    )
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    client.delete(f"/api/v1/pipeline/{data["id"]}", headers=auth)


def test_get_pipeline(client, auth, test_pipeline_id):
    res = client.get(f"/api/v1/pipeline/{test_pipeline_id}", headers=auth)
    assert res.status_code == 200
    assert res.json()["id"] == test_pipeline_id


def test_get_pipeline_not_found(client, auth):
    res = client.get("/api/v1/pipeline/nonexistent-0000", headers=auth)
    assert res.status_code == 404


def test_update_pipeline(client, auth, test_pipeline_id):
    res = client.put(
        f"/api/v1/pipeline/{test_pipeline_id}",
        json={"stage": "quote"},
        headers=auth,
    )
    assert res.status_code == 200
    assert res.json()["stage"] == "quote"


def test_requires_auth(client):
    res = client.get("/api/v1/pipeline")
    assert res.status_code == 401