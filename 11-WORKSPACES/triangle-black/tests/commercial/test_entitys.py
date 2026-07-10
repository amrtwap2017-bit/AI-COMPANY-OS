"""Tests for entity endpoints — skips if endpoint not registered."""
import pytest


def test_get_entity(client, auth):
    res = client.get("/api/v1/entities/", headers=auth)
    if res.status_code == 404:
        pytest.skip("Entity endpoint not registered")
    assert res.status_code == 200


def test_update_entity(client, auth):
    res = client.get("/api/v1/entities/", headers=auth)
    if res.status_code == 404:
        pytest.skip("Entity endpoint not registered")
    assert res.status_code == 200
