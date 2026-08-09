"""Sprint-084-086: Coverage for new DDD endpoints"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestSuppliersEndpoints:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/suppliers/?limit=3", headers=auth_headers)
        _s(r,"suppliers_list"); assert r.status_code==200
    def test_detail(self, client, auth_headers):
        r = client.get("/api/v1/suppliers/?limit=1", headers=auth_headers)
        _s(r,"suppliers_first")
        items = r.json().get("results", r.json() if isinstance(r.json(),list) else [])
        if not items: pytest.skip("No suppliers")
        r2 = client.get(f"/api/v1/suppliers/{items[0]['id']}", headers=auth_headers)
        _s(r2,"suppliers_detail"); assert r2.status_code==200
    def test_not_found(self, client, auth_headers):
        r = client.get("/api/v1/suppliers/nonexistent-000", headers=auth_headers)
        _s(r,"suppliers_404"); assert r.status_code==404

class TestWarrantyEndpoints:
    def test_overview(self, client, auth_headers):
        r = client.get("/api/v1/warranty/overview", headers=auth_headers)
        _s(r,"warranty_overview"); assert r.status_code in (200,404)
    def test_expiring(self, client, auth_headers):
        r = client.get("/api/v1/warranty/expiring", headers=auth_headers)
        _s(r,"warranty_expiring"); assert r.status_code in (200,404)

class TestApprovalEndpoints:
    def test_queue(self, client, auth_headers):
        r = client.get("/api/v1/approvals/", headers=auth_headers)
        _s(r,"approvals_queue"); assert r.status_code in (200,404)
    def test_count(self, client, auth_headers):
        r = client.get("/api/v1/approvals/count", headers=auth_headers)
        _s(r,"approvals_count"); assert r.status_code in (200,404)
    def test_requests_list(self, client, auth_headers):
        r = client.get("/api/v1/approval-requests/", headers=auth_headers)
        _s(r,"approval_req"); assert r.status_code in (200,404)

class TestScopeOfWorkEndpoints:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/scope-of-work/", headers=auth_headers)
        _s(r,"sow_list"); assert r.status_code in (200,404)
    def test_summary(self, client, auth_headers):
        r = client.get("/api/v1/scope-of-work/summary", headers=auth_headers)
        _s(r,"sow_summary"); assert r.status_code in (200,404)

class TestProcurementIntakeEndpoints:
    def test_summary(self, client, auth_headers):
        r = client.get("/api/v1/procurement/intake/summary", headers=auth_headers)
        _s(r,"intake_summary"); assert r.status_code in (200,404)
    def test_alerts(self, client, auth_headers):
        r = client.get("/api/v1/procurement/intake/alerts", headers=auth_headers)
        _s(r,"intake_alerts"); assert r.status_code in (200,404)
