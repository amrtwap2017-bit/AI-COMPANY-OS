"""Sprint A-013 — SLA Engine 2.0 Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_sla_engine_summary_requires_auth():
    r = requests.get(f"{BASE}/api/v1/sla-engine/summary", timeout=10)
    assert r.status_code in (401, 403)

def test_sla_engine_summary_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "sla-summary")
    assert r.status_code == 200
    d = r.json()
    assert "overall_compliance_pct" in d
    assert "compliance_grade" in d
    assert "total_assessed" in d
    assert "open_at_risk" in d
    assert "insights" in d
    assert "sla_targets" in d
    assert d["compliance_grade"] in ("A+","A","B+","B","C","D")

def test_sla_engine_by_priority_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/by-priority",
                     headers=auth_headers, timeout=20)
    _skip(r, "sla-by-priority")
    assert r.status_code == 200
    d = r.json()
    assert "by_priority" in d
    for item in d["by_priority"]:
        assert "priority" in item
        assert "compliance_pct" in item
        assert "sla_target_hours" in item
        assert "performance" in item
        assert 0 <= item["compliance_pct"] <= 100

def test_sla_engine_trend_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/trend",
                     headers=auth_headers, timeout=20)
    _skip(r, "sla-trend")
    assert r.status_code == 200
    d = r.json()
    assert "trend" in d
    assert "weeks" in d

def test_sla_engine_at_risk_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/at-risk",
                     headers=auth_headers, timeout=20)
    _skip(r, "sla-at-risk")
    assert r.status_code == 200
    d = r.json()
    assert "total_at_risk" in d
    assert "breached_count" in d
    assert "critical_count" in d
    assert "work_orders" in d

def test_sla_engine_at_risk_structure(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/at-risk",
                     headers=auth_headers, timeout=20)
    _skip(r, "sla-at-risk-struct")
    assert r.status_code == 200
    for wo in r.json().get("work_orders", [])[:5]:
        assert "risk_level" in wo
        assert "age_hours" in wo
        assert "sla_target_hours" in wo
        assert "pct_consumed" in wo
        assert wo["risk_level"] in ("BREACHED","CRITICAL","AT_RISK","ON_TRACK")

def test_sla_targets_coverage(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "sla-targets")
    assert r.status_code == 200
    targets = r.json().get("sla_targets", {})
    assert "emergency" in targets
    assert "critical" in targets
    assert targets["emergency"] <= targets["critical"]

def test_sla_trend_custom_weeks(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/trend?weeks=4",
                     headers=auth_headers, timeout=20)
    _skip(r, "sla-trend-4w")
    assert r.status_code == 200
    assert r.json()["weeks"] == 4
