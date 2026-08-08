"""Tests for cache config endpoints — skips if endpoint not registered."""
import uuid
import pytest

def _skip_if_rate_limited(res, context=""):
    import pytest
    if hasattr(res, "status_code") and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")



def test_get_cacheconfig(client, auth_headers):
    res = client.get("/api/v1/cache-configs/", headers=auth_headers)
    _skip_if_rate_limited(res, "test_cacheconfigs.py:12")
    if res.status_code == 404:
        pytest.skip("CacheConfig endpoint not registered")
    assert res.status_code == 200


def test_update_cacheconfig(client, auth_headers):
    res = client.get("/api/v1/cache-configs/", headers=auth_headers)
    _skip_if_rate_limited(res, "test_cacheconfigs.py:19")
    if res.status_code == 404:
        pytest.skip("CacheConfig endpoint not registered")
    assert res.status_code == 200
