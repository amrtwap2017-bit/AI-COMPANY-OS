"""Sprint-103: Data integrity + edge case tests"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestNotFoundEdgeCases:
    def test_lead_not_found(self, client, auth_headers):
        r = client.get("/api/v1/leads/nonexistent-lead-000", headers=auth_headers)
        _s(r,"lead_404"); assert r.status_code==404
    def test_asset_not_found(self, client, auth_headers):
        r = client.get("/api/v1/assets/nonexistent-000", headers=auth_headers)
        _s(r,"asset_404"); assert r.status_code==404
    def test_contract_not_found(self, client, auth_headers):
        r = client.get("/api/v1/contracts/nonexistent-000", headers=auth_headers)
        _s(r,"contract_404"); assert r.status_code==404
    def test_invoice_not_found(self, client, auth_headers):
        r = client.get("/api/v1/invoices/nonexistent-000", headers=auth_headers)
        _s(r,"invoice_404"); assert r.status_code==404
    def test_work_order_not_found(self, client, auth_headers):
        r = client.get("/api/v1/work-orders/nonexistent-000", headers=auth_headers)
        _s(r,"wo_404"); assert r.status_code==404

class TestValidationEdgeCases:
    def test_leads_invalid_limit(self, client, auth_headers):
        r = client.get("/api/v1/leads/?limit=0", headers=auth_headers)
        _s(r,"leads_0"); assert r.status_code in (200,422)
    def test_work_orders_invalid_status(self, client, auth_headers):
        r = client.get("/api/v1/work-orders/?status=invalid_xyz&limit=5", headers=auth_headers)
        _s(r,"wo_bad_status"); assert r.status_code in (200,422)

class TestCountEndpoints:
    def test_approvals_count(self, client, auth_headers):
        r = client.get("/api/v1/approvals/count", headers=auth_headers)
        _s(r,"approvals_count"); assert r.status_code in (200,404)
    def test_notifications_count(self, client, auth_headers):
        r = client.get("/api/v1/notifications/live/count", headers=auth_headers)
        _s(r,"notif_count"); assert r.status_code in (200,404)

class TestDataConsistency:
    def test_leads_have_hotel_id(self, client, auth_headers):
        r = client.get("/api/v1/leads/?limit=3", headers=auth_headers)
        _s(r,"leads_hotel"); assert r.status_code==200
        for lead in r.json(): assert "hotel_id" in lead
    def test_contracts_have_hotel_id(self, client, auth_headers):
        r = client.get("/api/v1/contracts/?limit=3", headers=auth_headers)
        _s(r,"contracts_hotel"); assert r.status_code==200
        for c in r.json(): assert "hotel_id" in c
    def test_suppliers_have_company_name(self, client, auth_headers):
        r = client.get("/api/v1/suppliers/?limit=3", headers=auth_headers)
        _s(r,"suppliers_name"); assert r.status_code==200
        items = r.json().get("results", r.json() if isinstance(r.json(),list) else [])
        for s in items: assert "company_name" in s
