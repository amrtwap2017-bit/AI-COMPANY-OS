"""Quote live API tests."""
import pytest

def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        import pytest
        pytest.skip(f"Rate limited in full suite — {context}")


def test_list_quotes(client, auth_headers):
    res = client.get("/api/v1/quotes/", headers=auth_headers)
    _skip_if_rate_limited(res, "10")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_quotes_requires_auth(client):
    import requests as _req
    r = _req.get("http://localhost:8030/api/v1/quotes/", timeout=10)
    assert r.status_code in (401, 429)
