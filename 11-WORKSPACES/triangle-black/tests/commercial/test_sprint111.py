"""Sprint-111: Write-operation tests + action endpoints"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestLeadActions:
    def test_qualify_nonexistent(self, client, auth_headers):
        r=client.post("/api/v1/actions/leads/nonexistent-000/qualify",headers=auth_headers)
        _s(r,"lq"); assert r.status_code in (200,404,422)
    def test_assign_nonexistent(self, client, auth_headers):
        r=client.post("/api/v1/actions/leads/nonexistent-000/assign",json={},headers=auth_headers)
        _s(r,"la"); assert r.status_code in (200,404,422)
    def test_quote_nonexistent(self, client, auth_headers):
        r=client.post("/api/v1/actions/leads/nonexistent-000/quote",json={"contract_months":12},headers=auth_headers)
        _s(r,"lq2"); assert r.status_code in (200,404,422)

class TestQuoteActionFlow:
    def test_submit_nonexistent(self, client, auth_headers):
        r=client.post("/api/v1/actions/quotes/nonexistent-000/submit",json={},headers=auth_headers)
        _s(r,"qs"); assert r.status_code in (200,404,422)
    def test_send_nonexistent(self, client, auth_headers):
        r=client.post("/api/v1/actions/quotes/nonexistent-000/send",json={},headers=auth_headers)
        _s(r,"qsend"); assert r.status_code in (200,404,422)

class TestAgentActions:
    def test_leads_endpoint(self, client, auth_headers):
        r=client.get("/api/v1/agents/?limit=1",headers=auth_headers)
        _s(r,"ag_list"); assert r.status_code==200
        if r.json():
            r2=client.get(f"/api/v1/actions/agents/{r.json()[0]['id']}/leads",headers=auth_headers)
            _s(r2,"ag_leads"); assert r2.status_code in (200,404)
    def test_performance_endpoint(self, client, auth_headers):
        r=client.get("/api/v1/agents/?limit=1",headers=auth_headers)
        _s(r,"ag_list2"); assert r.status_code==200
        if r.json():
            r2=client.get(f"/api/v1/actions/agents/{r.json()[0]['id']}/performance",headers=auth_headers)
            _s(r2,"ag_perf"); assert r2.status_code in (200,404)

class TestWorkOrderActions:
    def test_assign_nonexistent(self, client, auth_headers):
        r=client.post("/api/v1/work-orders/nonexistent-000/assign",json={"technician_id":"test"},headers=auth_headers)
        _s(r,"woa"); assert r.status_code in (200,400,401,404,405,422)
    def test_update_status(self, client, auth_headers):
        r=client.post("/api/v1/work-orders/nonexistent-000/update-status",json={"status":"in_progress"},headers=auth_headers)
        _s(r,"wous"); assert r.status_code in (200,400,401,404,405,422)

class TestContractRenewal:
    def test_renew_nonexistent(self, client, auth_headers):
        r=client.post("/api/v1/contracts/nonexistent-000/renew",headers=auth_headers)
        _s(r,"cr"); assert r.status_code in (200,400,401,404,405,422)
