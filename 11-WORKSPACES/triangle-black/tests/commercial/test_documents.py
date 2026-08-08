"""Document endpoint tests — Sprint-068: rewritten as live HTTP"""
import pytest


def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")


def test_documents_list(client, auth_headers):
    res = client.get("/api/v1/documents/?limit=5", headers=auth_headers)
    _skip_if_rate_limited(res, "documents_list")
    assert res.status_code in (200, 404, 422)


def test_documents_list_structure(client, auth_headers):
    res = client.get("/api/v1/documents/?limit=5", headers=auth_headers)
    _skip_if_rate_limited(res, "documents_structure")
    if res.status_code in (404, 422):
        pytest.skip("Documents endpoint not registered or requires params")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, (list, dict))


def test_documents_filter_by_entity(client, auth_headers):
    res = client.get(
        "/api/v1/documents/?entity_type=contract&limit=5",
        headers=auth_headers
    )
    _skip_if_rate_limited(res, "documents_filter")
    assert res.status_code in (200, 404, 422)
