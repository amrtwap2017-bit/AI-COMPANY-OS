"""
Hotel endpoint tests — Triangle Black live API tests.
Requires: TB API running at 127.0.0.1:8030 and authenticated client fixture.
"""
import uuid
import pytest

TEST_PREFIX = "TEST-PYTEST"


@pytest.fixture(scope="module")
def test_hotel_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/hotels/",
        json={"name": f"{TEST_PREFIX} {unique}", "status": "active"},
        headers=auth,
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    obj_id = res.json()["id"]
    yield obj_id
    client.delete(f"/api/v1/hotels/{obj_id}", headers=auth)


def test_list_hotels(client, auth):
    res = client.get("/api/v1/hotels/", headers=auth)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_create_hotel(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/hotels/",
        json={"name": f"{TEST_PREFIX} Create {unique}"},
        headers=auth,
    )
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    assert data["status"] == "active"
    client.delete(f"/api/v1/hotels/{data['id']}", headers=auth)


def test_get_hotel(client, auth, test_hotel_id):
    res = client.get(f"/api/v1/hotels/{test_hotel_id}", headers=auth)
    assert res.status_code == 200
    assert res.json()["id"] == test_hotel_id


def test_get_hotel_not_found(client, auth):
    res = client.get("/api/v1/hotels/nonexistent-0000", headers=auth)
    assert res.status_code == 404


def test_update_hotel(client, auth, test_hotel_id):
    res = client.patch(
        f"/api/v1/hotels/{test_hotel_id}",
        json={"status": "inactive"},
        headers=auth,
    )
    assert res.status_code == 200
    assert res.json()["status"] == "inactive"


def test_hotels_requires_auth(client):
    res = client.get("/api/v1/hotels/")
    assert res.status_code == 401
