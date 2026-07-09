import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from src.main import app
from src.core.auth import create_access_token
from src.core.database import get_db, Base, engine
from src.commercial.pagination.models import PaginatedResponse


def test_create_paginated_response(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/paginated_responses",
        json={"data": [{"name": f"{unique}"}], "skip": 0, "limit": 20},
        headers=auth,
    )
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    client.delete(f"/api/v1/paginated_responses/{data['id']}", headers=auth)


def test_get_paginated_response(client, auth):
    res = client.get(
        "/api/v1/paginated_responses",
        headers=auth,
    )
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)


def test_get_paginated_response_not_found(client, auth):
    res = client.get(
        "/api/v1/paginated_responses/nonexistent-0000",
        headers=auth,
    )
    assert res.status_code == 404


def test_update_paginated_response(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/paginated_responses",
        json={"data": [{"name": f"{unique}"}], "skip": 0, "limit": 20},
        headers=auth,
    )
    assert res.status_code == 201
    data = res.json()
    update_res = client.put(
        f"/api/v1/paginated_responses/{data['id']}",
        json={"data": [{"name": "updated_name"}], "skip": 0, "limit": 20},
        headers=auth,
    )
    assert update_res.status_code == 200
    client.delete(f"/api/v1/paginated_responses/{data['id']}", headers=auth)


def test_requires_auth(client):
    res = client.get("/api/v1/paginated_responses")
    assert res.status_code == 401