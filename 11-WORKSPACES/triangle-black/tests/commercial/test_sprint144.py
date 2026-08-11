"""Sprint-144: Priority + type + category comprehensive filters"""
import pytest

def _s(res, ctx=""):
    if hasattr(res,"status_code") and res.status_code==429:
        pytest.skip(f"Rate limited — {ctx}")

class TestLeadsAllPriorities:
    def test_low(self, client, auth_headers):
        r=client.get("/api/v1/leads/?priority=low&limit=5",headers=auth_headers)
        _s(r,"lp_low"); assert r.status_code==200
    def test_medium(self, client, auth_headers):
        r=client.get("/api/v1/leads/?priority=medium&limit=5",headers=auth_headers)
        _s(r,"lp_med"); assert r.status_code==200
    def test_high(self, client, auth_headers):
        r=client.get("/api/v1/leads/?priority=high&limit=5",headers=auth_headers)
        _s(r,"lp_high"); assert r.status_code==200

class TestLeadsAllSources:
    def test_web(self, client, auth_headers):
        r=client.get("/api/v1/leads/?source=web&limit=5",headers=auth_headers)
        _s(r,"lsrc_web"); assert r.status_code==200
    def test_referral(self, client, auth_headers):
        r=client.get("/api/v1/leads/?source=referral&limit=5",headers=auth_headers)
        _s(r,"lsrc_ref"); assert r.status_code==200
    def test_direct(self, client, auth_headers):
        r=client.get("/api/v1/leads/?source=direct&limit=5",headers=auth_headers)
        _s(r,"lsrc_dir"); assert r.status_code==200

class TestWorkOrdersAllTypes:
    def test_corrective(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?type=corrective&limit=5",headers=auth_headers)
        _s(r,"wot_corr"); assert r.status_code==200
    def test_preventive(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?type=preventive&limit=5",headers=auth_headers)
        _s(r,"wot_prev"); assert r.status_code==200
    def test_inspection(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?type=inspection&limit=5",headers=auth_headers)
        _s(r,"wot_insp"); assert r.status_code==200
    def test_emergency(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?type=emergency&limit=5",headers=auth_headers)
        _s(r,"wot_emerg"); assert r.status_code==200

class TestWorkOrdersAllPriorities:
    def test_low(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?priority=low&limit=5",headers=auth_headers)
        _s(r,"wop_low"); assert r.status_code==200
    def test_medium(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?priority=medium&limit=5",headers=auth_headers)
        _s(r,"wop_med"); assert r.status_code==200
    def test_high(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?priority=high&limit=5",headers=auth_headers)
        _s(r,"wop_high"); assert r.status_code==200
    def test_critical(self, client, auth_headers):
        r=client.get("/api/v1/work-orders/?priority=critical&limit=5",headers=auth_headers)
        _s(r,"wop_crit"); assert r.status_code==200

class TestAssetsAllCategories:
    def test_hvac(self, client, auth_headers):
        r=client.get("/api/v1/assets/?category=HVAC&limit=5",headers=auth_headers)
        _s(r,"ac_hvac"); assert r.status_code==200
    def test_electrical(self, client, auth_headers):
        r=client.get("/api/v1/assets/?category=Electrical&limit=5",headers=auth_headers)
        _s(r,"ac_elec"); assert r.status_code==200
    def test_plumbing(self, client, auth_headers):
        r=client.get("/api/v1/assets/?category=Plumbing&limit=5",headers=auth_headers)
        _s(r,"ac_plumb"); assert r.status_code==200
    def test_pool(self, client, auth_headers):
        r=client.get("/api/v1/assets/?category=Pool&limit=5",headers=auth_headers)
        _s(r,"ac_pool"); assert r.status_code==200

class TestAssetsAllCriticalities:
    def test_low(self, client, auth_headers):
        r=client.get("/api/v1/assets/?criticality=low&limit=5",headers=auth_headers)
        _s(r,"acr_low"); assert r.status_code==200
    def test_medium(self, client, auth_headers):
        r=client.get("/api/v1/assets/?criticality=medium&limit=5",headers=auth_headers)
        _s(r,"acr_med"); assert r.status_code==200
    def test_high(self, client, auth_headers):
        r=client.get("/api/v1/assets/?criticality=high&limit=5",headers=auth_headers)
        _s(r,"acr_high"); assert r.status_code==200
    def test_critical(self, client, auth_headers):
        r=client.get("/api/v1/assets/?criticality=critical&limit=5",headers=auth_headers)
        _s(r,"acr_crit"); assert r.status_code==200

class TestSuppliersAllCategories:
    def test_mep(self, client, auth_headers):
        r=client.get("/api/v1/suppliers/?category=mep&limit=5",headers=auth_headers)
        _s(r,"sc_mep"); assert r.status_code==200
    def test_hvac(self, client, auth_headers):
        r=client.get("/api/v1/suppliers/?category=HVAC&limit=5",headers=auth_headers)
        _s(r,"sc_hvac"); assert r.status_code==200
    def test_electrical(self, client, auth_headers):
        r=client.get("/api/v1/suppliers/?category=electrical&limit=5",headers=auth_headers)
        _s(r,"sc_elec"); assert r.status_code==200
