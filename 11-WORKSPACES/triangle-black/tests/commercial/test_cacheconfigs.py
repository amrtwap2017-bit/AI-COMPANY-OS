"""
CacheConfig live API tests — Triangle Black
Requires TB API running at 127.0.0.1:8030.
"""
import uuid
import pytest

TEST_PREFIX = "TEST-PYTEST"


@pytest.fixture(scope="module")
def test_config_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/cache-configs/",
        json={
            "cache_key": f"test_key_{unique}",
            "ttl_seconds": 300,
            "enabled": True,
            "description": "pytest test config",
        },
        headers=auth,
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    obj_id = res.json()["id"]
    yield obj_id
    client.delete(f"/api/v1/cache-configs/{obj_id}", headers=auth)


def test_list_cache_configs(client, auth):
    res = client.get("/api/v1/cache-configs/", headers=auth)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_create_cache_config(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/cache-configs/",
        json={"cache_key": f"create_test_{unique}", "ttl_seconds": 60},
        headers=auth,
    )
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    assert data["ttl_seconds"] == 60
    assert data["enabled"] is True
    client.delete(f"/api/v1/cache-configs/{data['id']}", headers=auth)


def test_get_cache_config(client, auth, test_config_id):
    res = client.get(f"/api/v1/cache-configs/{test_config_id}", headers=auth)
    assert res.status_code == 200
    assert res.json()["id"] == test_config_id


def test_get_cache_config_not_found(client, auth):
    res = client.get("/api/v1/cache-configs/nonexistent-0000", headers=auth)
    assert res.status_code == 404


def test_update_cache_config(client, auth, test_config_id):
    res = client.patch(
        f"/api/v1/cache-configs/{test_config_id}",
        json={"ttl_seconds": 600, "enabled": False},
        headers=auth,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["ttl_seconds"] == 600
    assert data["enabled"] is False


def test_cache_configs_requires_auth(client):
    res = client.get("/api/v1/cache-configs/")
    assert res.status_code == 401
