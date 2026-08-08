"""Webhook live API tests."""
import pytest

def _skip_if_rate_limited(res, context=""):
    import pytest
    if hasattr(res, 'status_code') and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")


def test_list_webhooks(client, auth_headers):
    res = client.get("/api/v1/webhooks/", headers=auth_headers)
    assert res.status_code in (200, 404)

def test_placeholder():
    assert True
