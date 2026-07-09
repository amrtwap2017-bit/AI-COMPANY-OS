import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from src.core.database import get_db, Base, engine
from src.commercial.cache.models import CacheConfig
from src.commercial.cache.repository import CacheConfigRepository

@pytest.fixture(scope="module")
def test_cache_config_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/cache_configs",
        json={"endpoint": f"/api/v1/leads/{unique}", "ttl": 30},
        headers=auth,
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    cache_config_id = res.json()["id"]
    yield cache_config_id
    client.delete(f"/api/v1/cache_configs/{cache_config_id}", headers=auth)

def test_list_cache_configs(client, auth):
    res = client.get("/api/v1/cache_configs", headers=auth)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_create_cache_config(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/cache_configs",
        json={"endpoint": f"/api/v1/leads/{unique}", "ttl": 30},
        headers=auth,
    )
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    client.delete(f"/api/v1/cache_configs/{data["id"]}", headers=auth)


def test_get_cache_config(client, auth, test_cache_config_id):
    res = client.get(f"/api/v1/cache_configs/{test_cache_config_id}", headers=auth)
    assert res.status_code == 200
    assert res.json()["id"] == test_cache_config_id


def test_get_cache_config_not_found(client, auth):
    res = client.get("/api/v1/cache_configs/nonexistent-0000", headers=auth)
    assert res.status_code == 404


def test_update_cache_config(client, auth, test_cache_config_id):
    res = client.patch(
        f"/api/v1/cache_configs/{test_cache_config_id}",
        json={"ttl": 60},
        headers=auth,
    )
    assert res.status_code == 200
    assert res.json()["ttl"] == 60


def test_requires_auth(client):
    res = client.get("/api/v1/cache_configs")
    assert res.status_code == 401