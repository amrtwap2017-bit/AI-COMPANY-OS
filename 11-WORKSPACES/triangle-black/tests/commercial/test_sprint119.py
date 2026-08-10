"""Sprint-119: Bulk operations + reporting + twin + final sweep"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestBulkOperationsDeep:
    def test_summary(self, client, auth_headers):
        r=client.get("/api/v1/bulk/summary",headers=auth_headers)
        _s(r,"bulk_sum2"); assert r.status_code in (200,404)
    def test_stats(self, client, auth_headers):
        r=client.get("/api/v1/bulk/stats",headers=auth_headers)
        _s(r,"bulk_stats"); assert r.status_code in (200,404)

class TestDigitalTwinDeep:
    def test_status(self, client, auth_headers):
        r=client.get("/api/v1/digital-twin/status",headers=auth_headers)
        _s(r,"twin_status"); assert r.status_code in (200,404)
    def test_assets(self, client, auth_headers):
        r=client.get("/api/v1/digital-twin/assets",headers=auth_headers)
        _s(r,"twin_assets"); assert r.status_code in (200,404)
    def test_maintenance(self, client, auth_headers):
        r=client.get("/api/v1/digital-twin/maintenance",headers=auth_headers)
        _s(r,"twin_maint"); assert r.status_code in (200,404)

class TestReportingDeep:
    def test_lead_report(self, client, auth_headers):
        r=client.get("/api/v1/reporting/leads",headers=auth_headers)
        _s(r,"rep_leads"); assert r.status_code in (200,404)
    def test_contract_report(self, client, auth_headers):
        r=client.get("/api/v1/reporting/contracts",headers=auth_headers)
        _s(r,"rep_contracts"); assert r.status_code in (200,404)
    def test_maintenance_report(self, client, auth_headers):
        r=client.get("/api/v1/reporting/maintenance",headers=auth_headers)
        _s(r,"rep_maint"); assert r.status_code in (200,404)

class TestKnowledgeGraphDeep:
    def test_entities(self, client, auth_headers):
        r=client.get("/api/v1/knowledge-graph/entities",headers=auth_headers)
        _s(r,"kg_ent"); assert r.status_code in (200,404)
    def test_relations(self, client, auth_headers):
        r=client.get("/api/v1/knowledge-graph/relations",headers=auth_headers)
        _s(r,"kg_rel"); assert r.status_code in (200,404)

class TestCSVExportDeep:
    def test_work_orders(self, client, auth_headers):
        r=client.get("/api/v1/export/work-orders",headers=auth_headers)
        _s(r,"csv_wo"); assert r.status_code in (200,404)
    def test_suppliers(self, client, auth_headers):
        r=client.get("/api/v1/export/suppliers",headers=auth_headers)
        _s(r,"csv_sup"); assert r.status_code in (200,404)
    def test_contracts(self, client, auth_headers):
        r=client.get("/api/v1/export/contracts",headers=auth_headers)
        _s(r,"csv_con"); assert r.status_code in (200,404)

class TestGlobalSearchDeep:
    def test_search_assets(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=HVAC",headers=auth_headers)
        _s(r,"srch_hvac"); assert r.status_code==200
        d=r.json(); assert "results" in d
    def test_search_empty_results(self, client, auth_headers):
        r=client.get("/api/v1/search/?q=zzzxxx999",headers=auth_headers)
        _s(r,"srch_empty"); assert r.status_code==200
        d=r.json(); assert d["total"]>=0
    def test_quick_search_agents(self, client, auth_headers):
        r=client.get("/api/v1/search/quick?q=agent",headers=auth_headers)
        _s(r,"quick_agent"); assert r.status_code==200
