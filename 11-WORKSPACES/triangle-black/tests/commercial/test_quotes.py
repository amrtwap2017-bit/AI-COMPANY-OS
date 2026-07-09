"""
Quote endpoint tests — Triangle Black live API tests.
Requires: TB API running at 127.0.0.1:8030 and authenticated client fixture.
"""
import uuid
import pytest

TEST_PREFIX = "TEST-PYTEST"


@pytest.fixture(scope="module")
def test_quote_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/quotes/",
        json={"name": f"{TEST_PREFIX} {unique}", "status": "active"},
        headers=auth,
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    obj_id = res.json()["id"]
    yield obj_id
    client.delete(f"/api/v1/quotes/{obj_id}", headers=auth)


def test_list_quotes(client, auth):
    res = client.get("/api/v1/quotes/", headers=auth)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_create_quote(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/quotes/",
        json={"name": f"{TEST_PREFIX} Create {unique}"},
        headers=auth,
    )
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    assert data["status"] == "active"
    client.delete(f"/api/v1/quotes/{data['id']}", headers=auth)


def test_get_quote(client, auth, test_quote_id):
    res = client.get(f"/api/v1/quotes/{test_quote_id}", headers=auth)
    assert res.status_code == 200
    assert res.json()["id"] == test_quote_id


def test_get_quote_not_found(client, auth):
    res = client.get("/api/v1/quotes/nonexistent-0000", headers=auth)
    assert res.status_code == 404


def test_update_quote(client, auth, test_quote_id):
    res = client.patch(
        f"/api/v1/quotes/{test_quote_id}",
        json={"status": "inactive"},
        headers=auth,
    )
    assert res.status_code == 200
    assert res.json()["status"] == "inactive"


def test_quotes_requires_auth(client):
    res = client.get("/api/v1/quotes/")
    assert res.status_code == 401
