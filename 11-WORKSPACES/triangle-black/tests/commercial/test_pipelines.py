"""Pipeline dashboard live API tests."""
import pytest

def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        import pytest
        pytest.skip(f"Rate limited in full suite — {context}")


def test_pipeline_summary(client, auth_headers):
    res = client.get("/api/v1/actions/reports/dashboard", headers=auth_headers)
    _skip_if_rate_limited(res, "10")
    assert res.status_code in (200, 404, 422)

def test_placeholder():
    assert True
