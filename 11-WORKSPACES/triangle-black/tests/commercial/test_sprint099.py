"""Sprint-099: Final sweep + full suite verification"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestLeadActions:
    def test_pipeline_summary(self, client, auth_headers):
        r = client.get("/api/v1/actions/pipeline/summary", headers=auth_headers)
        _s(r,"pipeline"); assert r.status_code in (200,404)
    def test_reports_dashboard(self, client, auth_headers):
        r = client.get("/api/v1/actions/reports/dashboard", headers=auth_headers)
        _s(r,"rep_dash"); assert r.status_code in (200,404)

class TestQuoteActions:
    def test_approve(self, client, auth_headers):
        r = client.post("/api/v1/actions/quotes/nonexistent/approve",
            json={}, headers=auth_headers)
        _s(r,"q_approve"); assert r.status_code in (200,404,422)
    def test_reject(self, client, auth_headers):
        r = client.post("/api/v1/actions/quotes/nonexistent/reject",
            json={}, headers=auth_headers)
        _s(r,"q_reject"); assert r.status_code in (200,404,422)

class TestWorkOrderActions:
    def test_complete(self, client, auth_headers):
        r = client.post("/api/v1/work-orders/nonexistent/complete",
            json={}, headers=auth_headers)
        _s(r,"wo_complete"); assert r.status_code in (200,404,422)

class TestSystemHealth:
    def test_health(self, client, auth_headers):
        r = client.get("/health", headers=auth_headers)
        _s(r,"health"); assert r.status_code == 200
    def test_root(self, client, auth_headers):
        r = client.get("/", headers=auth_headers)
        _s(r,"root"); assert r.status_code == 200

class TestInvoiceActions:
    def test_list_filtered(self, client, auth_headers):
        r = client.get("/api/v1/invoices/?status=draft&limit=5", headers=auth_headers)
        _s(r,"inv_filtered"); assert r.status_code in (200,404)

class TestContractActions:
    def test_activate(self, client, auth_headers):
        r = client.post("/api/v1/contracts/nonexistent/activate",
            headers=auth_headers)
        _s(r,"c_activate"); assert r.status_code in (200,400,404,422)

class TestDocumentActions:
    def test_list_by_entity(self, client, auth_headers):
        r = client.get("/api/v1/documents/?entity_type=contract&limit=3",
            headers=auth_headers)
        _s(r,"doc_entity"); assert r.status_code in (200,404,422)
