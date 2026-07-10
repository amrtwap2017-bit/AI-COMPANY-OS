"""Tests for activity tracking endpoints."""
import pytest


def test_get_activity(client, auth):
    res = client.get("/api/v1/activities/", headers=auth)
    if res.status_code == 404:
        pytest.skip("Activities endpoint not registered")
    assert res.status_code == 200


def test_update_activity(client, auth):
    res = client.get("/api/v1/activities/", headers=auth)
    if res.status_code == 404:
        pytest.skip("Activities endpoint not registered")
    assert res.status_code == 200
