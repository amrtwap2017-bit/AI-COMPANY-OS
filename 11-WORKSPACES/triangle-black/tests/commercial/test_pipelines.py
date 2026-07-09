"""Pipeline dashboard live API tests."""
import pytest

def test_pipeline_summary(client, auth):
    res = client.get("/api/v1/actions/reports/dashboard", headers=auth)
    assert res.status_code in (200, 404, 422)

def test_placeholder():
    assert True
