"""Sprint-105: Performance + response time tests"""
import pytest
import time

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestResponseTimes:
    def test_leads_fast(self, client, auth_headers):
        t=time.time(); r=client.get("/api/v1/leads/?limit=10",headers=auth_headers)
        _s(r,"leads_time"); elapsed=time.time()-t
        assert r.status_code==200; assert elapsed<5.0
    def test_contracts_fast(self, client, auth_headers):
        t=time.time(); r=client.get("/api/v1/contracts/?limit=10",headers=auth_headers)
        _s(r,"contracts_time"); elapsed=time.time()-t
        assert r.status_code==200; assert elapsed<5.0
    def test_search_fast(self, client, auth_headers):
        t=time.time(); r=client.get("/api/v1/search/?q=hotel",headers=auth_headers)
        _s(r,"search_time"); elapsed=time.time()-t
        assert r.status_code==200; assert elapsed<5.0
    def test_suppliers_fast(self, client, auth_headers):
        t=time.time(); r=client.get("/api/v1/suppliers/?limit=10",headers=auth_headers)
        _s(r,"suppliers_time"); elapsed=time.time()-t
        assert r.status_code==200; assert elapsed<5.0

class TestResponseFormats:
    def test_leads_is_list(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=5",headers=auth_headers)
        _s(r,"leads_fmt"); assert r.status_code==200
        assert isinstance(r.json(),list)
    def test_contracts_is_list(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=5",headers=auth_headers)
        _s(r,"contracts_fmt"); assert r.status_code==200
        assert isinstance(r.json(),list)
    def test_search_is_dict(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=maintenance",headers=auth_headers)
        _s(r,"search_fmt"); assert r.status_code==200
        d=r.json(); assert isinstance(d,dict)
        assert "query" in d; assert "results" in d; assert "total" in d
    def test_suppliers_has_count(self, client, auth_headers):
        r=client.get("/api/v1/suppliers/?limit=5",headers=auth_headers)
        _s(r,"suppliers_fmt"); assert r.status_code==200
        d=r.json(); assert isinstance(d,dict)
        assert "count" in d; assert "results" in d

class TestHealthChecks:
    def test_api_health(self, client, auth_headers):
        r=client.get("/health",headers=auth_headers)
        _s(r,"health_chk"); assert r.status_code==200
        d=r.json(); assert d.get("database")=="connected"
    def test_api_version(self, client, auth_headers):
        r=client.get("/",headers=auth_headers)
        _s(r,"version"); assert r.status_code==200
        d=r.json(); assert "version" in d
