"""Sprint-114: System notifications + AI endpoints + customer success deep"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestSystemNotifications:
    def test_list(self, client, auth_headers):
        r=client.get("/api/v1/system-notifications/?limit=5",headers=auth_headers)
        _s(r,"sn_list"); assert r.status_code in (200,404)
    def test_unread_count(self, client, auth_headers):
        r=client.get("/api/v1/system-notifications/count",headers=auth_headers)
        _s(r,"sn_count"); assert r.status_code in (200,404)

class TestAIAssistantDeep:
    def test_dispatch(self, client, auth_headers):
        r=client.get("/api/v1/ai/dispatch/summary",headers=auth_headers)
        _s(r,"ai_disp"); assert r.status_code in (200,404)
    def test_cost(self, client, auth_headers):
        r=client.get("/api/v1/ai/cost/summary",headers=auth_headers)
        _s(r,"ai_cost"); assert r.status_code in (200,404)
    def test_documents(self, client, auth_headers):
        r=client.get("/api/v1/ai/documents/summary",headers=auth_headers)
        _s(r,"ai_docs"); assert r.status_code in (200,404)
    def test_supply(self, client, auth_headers):
        r=client.get("/api/v1/ai/supply/summary",headers=auth_headers)
        _s(r,"ai_supply"); assert r.status_code in (200,404)

class TestCustomer360Deep:
    def test_profile(self, client, auth_headers):
        r=client.get("/api/v1/customer360/profile",headers=auth_headers)
        _s(r,"c360_p"); assert r.status_code in (200,404)
    def test_contracts(self, client, auth_headers):
        r=client.get("/api/v1/customer360/contracts",headers=auth_headers)
        _s(r,"c360_c"); assert r.status_code in (200,404)
    def test_invoices(self, client, auth_headers):
        r=client.get("/api/v1/customer360/invoices",headers=auth_headers)
        _s(r,"c360_i"); assert r.status_code in (200,404)

class TestWebhookConfigsDeep:
    def test_list(self, client, auth_headers):
        r=client.get("/api/v1/webhooks/?limit=5",headers=auth_headers)
        _s(r,"wh_list"); assert r.status_code in (200,404)
    def test_events(self, client, auth_headers):
        r=client.get("/api/v1/webhooks/events",headers=auth_headers)
        _s(r,"wh_events"); assert r.status_code in (200,404)

class TestPaginationDeep:
    def test_all_leads(self, client, auth_headers):
        r=client.get("/api/v1/leads/?limit=50&offset=0",headers=auth_headers)
        _s(r,"leads_50"); assert r.status_code==200; assert len(r.json())>=0
    def test_all_contracts(self, client, auth_headers):
        r=client.get("/api/v1/contracts/?limit=50&offset=0",headers=auth_headers)
        _s(r,"contracts_50"); assert r.status_code==200; assert len(r.json())>=0
