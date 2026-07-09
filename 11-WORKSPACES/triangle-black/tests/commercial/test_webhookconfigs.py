"""Webhook live API tests."""
import pytest

def test_list_webhooks(client, auth):
    res = client.get("/api/v1/webhooks/", headers=auth)
    assert res.status_code in (200, 404)

def test_placeholder():
    assert True
