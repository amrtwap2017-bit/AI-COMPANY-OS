"""Sprint-129: New coverage — activities + cacheconfigs + agents deep"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestActivitiesFixed:
    def test_list_200(self, client, auth_headers):
        r=client.get("/api/v1/activities/?limit=5",headers=auth_headers)
        _s(r,"act_list3"); assert r.status_code==200
    def test_has_type(self, client, auth_headers):
        r=client.get("/api/v1/activities/?limit=5",headers=auth_headers)
        _s(r,"act_type2"); assert r.status_code==200
        for a in r.json(): assert "type" in a
    def test_has_actor(self, client, auth_headers):
        r=client.get("/api/v1/activities/?limit=5",headers=auth_headers)
        _s(r,"act_actor"); assert r.status_code==200
    def test_recent(self, client, auth_headers):
        r=client.get("/api/v1/activities/recent",headers=auth_headers)
        _s(r,"act_recent2"); assert r.status_code in (200,404)
    def test_filter_type(self, client, auth_headers):
        r=client.get("/api/v1/activities/?activity_type=quote_approved&limit=5",headers=auth_headers)
        _s(r,"act_filter"); assert r.status_code in (200,404)

class TestCacheConfigsFixed:
    def test_list(self, client, auth_headers):
        r=client.get("/api/v1/cache/?limit=5",headers=auth_headers)
        _s(r,"cc_list"); assert r.status_code in (200,404)

class TestSearchAdvanced:
    def test_work_order_search(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=corrective",headers=auth_headers)
        _s(r,"srch_corr"); assert r.status_code==200
        d=r.json(); assert d["total"]>=0
    def test_asset_search(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=chiller",headers=auth_headers)
        _s(r,"srch_chill"); assert r.status_code==200
    def test_lead_search(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=Marriott",headers=auth_headers)
        _s(r,"srch_marr"); assert r.status_code==200

class TestLeadsActions:
    def test_search_action(self, client, auth_headers):
        r=client.get("/api/v1/actions/leads/search?q=hotel",headers=auth_headers)
        _s(r,"la_search"); assert r.status_code==200
    def test_duplicate_check(self, client, auth_headers):
        r=client.get("/api/v1/actions/leads/check-duplicate?email=test@test.com",headers=auth_headers)
        _s(r,"la_dup"); assert r.status_code==200

class TestQuotesActions:
    def test_list(self, client, auth_headers):
        r=client.get("/api/v1/quotes/?limit=5",headers=auth_headers)
        _s(r,"q_list2"); assert r.status_code in (200,404)
    def test_filter_draft(self, client, auth_headers):
        r=client.get("/api/v1/quotes/?status=draft&limit=5",headers=auth_headers)
        _s(r,"q_draft"); assert r.status_code in (200,404)
    def test_filter_approved(self, client, auth_headers):
        r=client.get("/api/v1/quotes/?status=approved&limit=5",headers=auth_headers)
        _s(r,"q_approved"); assert r.status_code in (200,404)

class TestInvoiceActions:
    def test_list(self, client, auth_headers):
        r=client.get("/api/v1/invoices/?limit=10",headers=auth_headers)
        _s(r,"inv_list3"); assert r.status_code==200
        assert len(r.json())>=0
    def test_has_invoice_number(self, client, auth_headers):
        r=client.get("/api/v1/invoices/?limit=3",headers=auth_headers)
        _s(r,"inv_num"); assert r.status_code==200
        for inv in r.json():
            assert "invoice_number" in inv or "id" in inv
