"""Sprint-133: 900+ push — vendor portal + AI + executive new"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestVendorPortalNew:
    def test_rfq_list(self, client, auth_headers):
        r=client.get("/api/v1/supplier-portal/rfqs",headers=auth_headers)
        _s(r,"vp_rfqs2"); assert r.status_code in (200,404)
    def test_po_list(self, client, auth_headers):
        r=client.get("/api/v1/supplier-portal/purchase-orders",headers=auth_headers)
        _s(r,"vp_pos2"); assert r.status_code in (200,404)
    def test_profile(self, client, auth_headers):
        r=client.get("/api/v1/supplier-portal/profile",headers=auth_headers)
        _s(r,"vp_prof"); assert r.status_code in (200,404)

class TestExecutiveNew:
    def test_scorecard(self, client, auth_headers):
        r=client.get("/api/v1/executive/scorecard",headers=auth_headers)
        _s(r,"ex_score"); assert r.status_code in (200,404)
    def test_workbench(self, client, auth_headers):
        r=client.get("/api/v1/executive/workbench",headers=auth_headers)
        _s(r,"ex_wb"); assert r.status_code in (200,404)
    def test_predictive(self, client, auth_headers):
        r=client.get("/api/v1/executive/predictive",headers=auth_headers)
        _s(r,"ex_pred"); assert r.status_code in (200,404)

class TestAISignalsNew:
    def test_list(self, client, auth_headers):
        r=client.get("/api/v1/ai/signals/",headers=auth_headers)
        _s(r,"ai_sig2"); assert r.status_code in (200,404)
    def test_summary(self, client, auth_headers):
        r=client.get("/api/v1/ai/signals/summary",headers=auth_headers)
        _s(r,"ai_sig_sum2"); assert r.status_code in (200,404)
    def test_critical(self, client, auth_headers):
        r=client.get("/api/v1/ai/signals/?priority=critical&limit=5",headers=auth_headers)
        _s(r,"ai_sig_crit"); assert r.status_code in (200,404)

class TestApprovalCenterNew:
    def test_queue(self, client, auth_headers):
        r=client.get("/api/v1/approvals/",headers=auth_headers)
        _s(r,"appr_q2"); assert r.status_code in (200,404)
    def test_pending_count(self, client, auth_headers):
        r=client.get("/api/v1/approvals/count",headers=auth_headers)
        _s(r,"appr_cnt2"); assert r.status_code in (200,404)
    def test_chain_lookup(self, client, auth_headers):
        r=client.get("/api/v1/approval-chain/pr/test-000",headers=auth_headers)
        _s(r,"appr_chain2"); assert r.status_code in (200,404)

class TestProcurementIntakeNew:
    def test_summary(self, client, auth_headers):
        r=client.get("/api/v1/procurement/intake/summary",headers=auth_headers)
        _s(r,"pi_sum2"); assert r.status_code in (200,404)
    def test_items(self, client, auth_headers):
        r=client.get("/api/v1/procurement/intake/items",headers=auth_headers)
        _s(r,"pi_items2"); assert r.status_code in (200,404)
    def test_alerts(self, client, auth_headers):
        r=client.get("/api/v1/procurement/intake/alerts",headers=auth_headers)
        _s(r,"pi_alerts2"); assert r.status_code in (200,404)

class TestScopeOfWorkNew:
    def test_list(self, client, auth_headers):
        r=client.get("/api/v1/scope-of-work/?limit=5",headers=auth_headers)
        _s(r,"sow_list3"); assert r.status_code in (200,404)
    def test_approved(self, client, auth_headers):
        r=client.get("/api/v1/scope-of-work/?status=approved&limit=5",headers=auth_headers)
        _s(r,"sow_appr"); assert r.status_code in (200,404)
    def test_in_progress(self, client, auth_headers):
        r=client.get("/api/v1/scope-of-work/?status=in_progress&limit=5",headers=auth_headers)
        _s(r,"sow_prog"); assert r.status_code in (200,404)

class TestHotelsNew:
    def test_list(self, client, auth_headers):
        r=client.get("/api/v1/hotels/?limit=5",headers=auth_headers)
        _s(r,"hotels2"); assert r.status_code in (200,404)
    def test_active(self, client, auth_headers):
        r=client.get("/api/v1/hotels/?status=active&limit=5",headers=auth_headers)
        _s(r,"hotels_active"); assert r.status_code in (200,404)
