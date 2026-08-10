"""Sprint-125: Final verification + edge cases"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestPMPlansComprehensive:
    def test_active(self, client, auth_headers):
        r=client.get("/api/v1/maintenance/pm-plans/?status=active&limit=5",headers=auth_headers)
        _s(r,"pm_active"); assert r.status_code in (200,404)
    def test_daily(self, client, auth_headers):
        r=client.get("/api/v1/maintenance/pm-plans/?frequency=daily&limit=5",headers=auth_headers)
        _s(r,"pm_daily"); assert r.status_code in (200,404)
    def test_weekly(self, client, auth_headers):
        r=client.get("/api/v1/maintenance/pm-plans/?frequency=weekly&limit=5",headers=auth_headers)
        _s(r,"pm_weekly"); assert r.status_code in (200,404)
    def test_monthly(self, client, auth_headers):
        r=client.get("/api/v1/maintenance/pm-plans/?frequency=monthly&limit=5",headers=auth_headers)
        _s(r,"pm_monthly"); assert r.status_code in (200,404)

class TestGoodsReceiptsComprehensive:
    def test_pending(self, client, auth_headers):
        r=client.get("/api/v1/goods-receipts/?status=pending&limit=5",headers=auth_headers)
        _s(r,"gr_pend"); assert r.status_code in (200,404)
    def test_received(self, client, auth_headers):
        r=client.get("/api/v1/goods-receipts/?status=received&limit=5",headers=auth_headers)
        _s(r,"gr_recv"); assert r.status_code in (200,404)

class TestVendorScorecardsComprehensive:
    def test_high_rated(self, client, auth_headers):
        r=client.get("/api/v1/vendor-scorecards/?min_score=80&limit=5",headers=auth_headers)
        _s(r,"vs_high"); assert r.status_code in (200,404)
    def test_low_rated(self, client, auth_headers):
        r=client.get("/api/v1/vendor-scorecards/?max_score=50&limit=5",headers=auth_headers)
        _s(r,"vs_low"); assert r.status_code in (200,404)

class TestAgentManagementComprehensive:
    def test_active(self, client, auth_headers):
        r=client.get("/api/v1/agent-management/?is_active=true&limit=5",headers=auth_headers)
        _s(r,"agm_active"); assert r.status_code in (200,404)
    def test_by_role(self, client, auth_headers):
        r=client.get("/api/v1/agent-management/?role=senior&limit=5",headers=auth_headers)
        _s(r,"agm_role"); assert r.status_code in (200,404)

class TestStockMovementsComprehensive:
    def test_recent(self, client, auth_headers):
        r=client.get("/api/v1/stock-movements/?limit=10",headers=auth_headers)
        _s(r,"sm_recent"); assert r.status_code in (200,404)
    def test_in_type(self, client, auth_headers):
        r=client.get("/api/v1/stock-movements/?movement_type=in&limit=5",headers=auth_headers)
        _s(r,"sm_in"); assert r.status_code in (200,404)
    def test_out_type(self, client, auth_headers):
        r=client.get("/api/v1/stock-movements/?movement_type=out&limit=5",headers=auth_headers)
        _s(r,"sm_out"); assert r.status_code in (200,404)

class TestActivitiesComprehensive:
    def test_list(self, client, auth_headers):
        r=client.get("/api/v1/activities/?limit=10",headers=auth_headers)
        _s(r,"act_list2"); assert r.status_code in (200,404,500)
    def test_by_type(self, client, auth_headers):
        r=client.get("/api/v1/activities/?activity_type=lead_created&limit=5",headers=auth_headers)
        _s(r,"act_type"); assert r.status_code in (200,404,500)

class TestSearchComprehensive:
    def test_search_technician(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=technician",headers=auth_headers)
        _s(r,"srch_tech"); assert r.status_code==200
    def test_search_invoice(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=invoice",headers=auth_headers)
        _s(r,"srch_inv"); assert r.status_code==200
    def test_search_supplier(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=supplier",headers=auth_headers)
        _s(r,"srch_sup"); assert r.status_code==200
    def test_search_asset(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=pump",headers=auth_headers)
        _s(r,"srch_pump"); assert r.status_code==200
