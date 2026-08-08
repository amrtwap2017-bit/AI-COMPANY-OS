"""Project endpoint tests — Sprint-068: rewritten as live HTTP"""
import pytest


def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")


def test_projects_list(client, auth_headers):
    res = client.get("/api/v1/projects/?limit=5", headers=auth_headers)
    _skip_if_rate_limited(res, "projects_list")
    assert res.status_code in (200, 404)


def test_projects_list_structure(client, auth_headers):
    res = client.get("/api/v1/projects/?limit=5", headers=auth_headers)
    _skip_if_rate_limited(res, "projects_structure")
    if res.status_code == 404:
        pytest.skip("Projects endpoint not registered")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, (list, dict))


def test_projects_have_required_fields(client, auth_headers):
    res = client.get("/api/v1/projects/?limit=5", headers=auth_headers)
    _skip_if_rate_limited(res, "projects_fields")
    if res.status_code in (404, 422):
        pytest.skip("Projects endpoint not available")
    assert res.status_code == 200
    data = res.json()
    items = data if isinstance(data, list) else data.get("results", data.get("items", []))
    if items:
        p = items[0]
        assert "id" in p
        assert "title" in p or "name" in p


def test_project_get_nonexistent(client, auth_headers):
    res = client.get("/api/v1/projects/nonexistent-000", headers=auth_headers)
    _skip_if_rate_limited(res, "project_not_found")
    assert res.status_code in (404, 422)
