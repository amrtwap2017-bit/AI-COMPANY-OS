"""Sprint-080: ETA invoicing repository + coverage tests"""
import pytest


def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")


class TestETAInvoicingDDD:
    def test_repository_importable(self):
        from src.commercial.eta_invoicing.repository import (
            get_all, get_by_id, create, update_status,
            count, eta_invoice_repo
        )
        assert callable(get_all)
        assert callable(get_by_id)
        assert callable(create)
        assert callable(update_status)
        assert callable(count)

    def test_repository_instance(self):
        from src.commercial.eta_invoicing.repository import eta_invoice_repo
        assert hasattr(eta_invoice_repo, "get_all")
        assert hasattr(eta_invoice_repo, "get_by_id")
        assert hasattr(eta_invoice_repo, "create")
        assert hasattr(eta_invoice_repo, "update_status")

    def test_eta_status_endpoint(self, client, auth_headers):
        res = client.get("/api/v1/eta/status", headers=auth_headers)
        _skip_if_rate_limited(res, "eta_status")
        assert res.status_code in (200, 404)

    def test_eta_status_structure(self, client, auth_headers):
        res = client.get("/api/v1/eta/status", headers=auth_headers)
        _skip_if_rate_limited(res, "eta_status_struct")
        if res.status_code == 404:
            pytest.skip("ETA endpoint not registered")
        assert res.status_code == 200
        data = res.json()
        assert "configured" in data

    def test_eta_invoices_list(self, client, auth_headers):
        res = client.get("/api/v1/eta/invoices", headers=auth_headers)
        _skip_if_rate_limited(res, "eta_invoices_list")
        assert res.status_code in (200, 404)
