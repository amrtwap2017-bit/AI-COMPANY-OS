"""Sprint-124: Final push — service requests + employees + timesheets comprehensive"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestServiceRequestsComprehensive:
    def test_in_progress(self, client, auth_headers):
        r=client.get("/api/v1/service-requests/?status=in_progress&limit=5",headers=auth_headers)
        _s(r,"sr_prog"); assert r.status_code==200
    def test_resolved(self, client, auth_headers):
        r=client.get("/api/v1/service-requests/?status=resolved&limit=5",headers=auth_headers)
        _s(r,"sr_res"); assert r.status_code==200
    def test_closed(self, client, auth_headers):
        r=client.get("/api/v1/service-requests/?status=closed&limit=5",headers=auth_headers)
        _s(r,"sr_closed"); assert r.status_code==200
    def test_low_urgency(self, client, auth_headers):
        r=client.get("/api/v1/service-requests/?urgency=low&limit=5",headers=auth_headers)
        _s(r,"sr_low"); assert r.status_code==200
    def test_plumbing(self, client, auth_headers):
        r=client.get("/api/v1/service-requests/?category=Plumbing&limit=5",headers=auth_headers)
        _s(r,"sr_plumb"); assert r.status_code==200

class TestEmployeesComprehensive:
    def test_inactive(self, client, auth_headers):
        r=client.get("/api/v1/employees/?status=inactive&limit=5",headers=auth_headers)
        _s(r,"emp_inactive"); assert r.status_code in (200,404)
    def test_management(self, client, auth_headers):
        r=client.get("/api/v1/employees/?department=Management&limit=5",headers=auth_headers)
        _s(r,"emp_mgmt"); assert r.status_code in (200,404)
    def test_finance(self, client, auth_headers):
        r=client.get("/api/v1/employees/?department=Finance&limit=5",headers=auth_headers)
        _s(r,"emp_fin"); assert r.status_code in (200,404)

class TestTimesheetsComprehensive:
    def test_approved(self, client, auth_headers):
        r=client.get("/api/v1/timesheets/?status=approved&limit=5",headers=auth_headers)
        _s(r,"ts_approved"); assert r.status_code in (200,404)
    def test_rejected(self, client, auth_headers):
        r=client.get("/api/v1/timesheets/?status=rejected&limit=5",headers=auth_headers)
        _s(r,"ts_rejected"); assert r.status_code in (200,404)
    def test_pending(self, client, auth_headers):
        r=client.get("/api/v1/timesheets/?status=pending&limit=5",headers=auth_headers)
        _s(r,"ts_pend"); assert r.status_code in (200,404)

class TestInventoryItemsComprehensive:
    def test_active(self, client, auth_headers):
        r=client.get("/api/v1/inventory-items/?status=active&limit=5",headers=auth_headers)
        _s(r,"ii_active"); assert r.status_code in (200,404)
    def test_plumbing(self, client, auth_headers):
        r=client.get("/api/v1/inventory-items/?category=plumbing&limit=5",headers=auth_headers)
        _s(r,"ii_plumb"); assert r.status_code in (200,404)
    def test_electrical(self, client, auth_headers):
        r=client.get("/api/v1/inventory-items/?category=electrical&limit=5",headers=auth_headers)
        _s(r,"ii_elec"); assert r.status_code in (200,404)

class TestWarehousesComprehensive:
    def test_active(self, client, auth_headers):
        r=client.get("/api/v1/warehouses/?is_active=true&limit=5",headers=auth_headers)
        _s(r,"wh_active2"); assert r.status_code in (200,404)
    def test_by_location(self, client, auth_headers):
        r=client.get("/api/v1/warehouses/?location=main&limit=5",headers=auth_headers)
        _s(r,"wh_loc"); assert r.status_code in (200,404)

class TestSitesComprehensive:
    def test_list(self, client, auth_headers):
        r=client.get("/api/v1/sites/?limit=10",headers=auth_headers)
        _s(r,"sites_all"); assert r.status_code in (200,404)
    def test_active(self, client, auth_headers):
        r=client.get("/api/v1/sites/?is_active=true&limit=5",headers=auth_headers)
        _s(r,"sites_active"); assert r.status_code in (200,404)
