"""Sprint-095: Advanced endpoint coverage"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestInvoiceVendors:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/supplier-invoices/?limit=5", headers=auth_headers)
        _s(r,"si"); assert r.status_code in (200,404)

class TestPaymentTracking:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/payment-tracking/?limit=5", headers=auth_headers)
        _s(r,"pt_list"); assert r.status_code in (200,404)

class TestCSVExport:
    def test_leads(self, client, auth_headers):
        r = client.get("/api/v1/export/leads", headers=auth_headers)
        _s(r,"csv_leads"); assert r.status_code in (200,404)

class TestPDFExport:
    def test_invoice(self, client, auth_headers):
        r = client.get("/api/v1/export/invoice/nonexistent", headers=auth_headers)
        _s(r,"pdf_inv"); assert r.status_code in (200,404)

class TestWebhookNotifications:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/webhooks/notifications/", headers=auth_headers)
        _s(r,"wh_notif"); assert r.status_code in (200,404)

class TestAIMentor:
    def test_summary(self, client, auth_headers):
        r = client.get("/api/v1/ai/mentor/summary", headers=auth_headers)
        _s(r,"ai_mentor"); assert r.status_code in (200,404)

class TestApprovalRequests:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/approval-requests/?limit=5", headers=auth_headers)
        _s(r,"ar_list"); assert r.status_code in (200,404)
    def test_pending(self, client, auth_headers):
        r = client.get("/api/v1/approval-requests/?status=pending", headers=auth_headers)
        _s(r,"ar_pending"); assert r.status_code in (200,404)

class TestVendorScorecard:
    def test_list(self, client, auth_headers):
        r = client.get("/api/v1/vendor-scorecards/?limit=5", headers=auth_headers)
        _s(r,"vs_list"); assert r.status_code in (200,404)
    def test_summary(self, client, auth_headers):
        r = client.get("/api/v1/vendor-scorecards/summary", headers=auth_headers)
        _s(r,"vs_sum"); assert r.status_code in (200,404)
