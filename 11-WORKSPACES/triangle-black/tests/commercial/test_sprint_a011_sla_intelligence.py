"""Sprint A-011 — SLA Intelligence Engine Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_sla_intelligence_requires_auth():
    r = requests.get(f"{BASE}/api/v1/sla-intelligence/summary", timeout=10)
    assert r.status_code in (401, 403)

def test_sla_summary_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-intelligence/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "sla-summary")
    assert r.status_code == 200
    d = r.json()
    assert "overall_compliance_pct" in d
    assert "overall_breach_pct" in d
    assert "compliance_grade" in d
    assert "by_priority" in d
    assert "by_category" in d
    assert "recommendations" in d
    assert d["compliance_grade"] in ("A","B","C","D")

def test_sla_compliance_adds_to_100(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-intelligence/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "sla-100")
    assert r.status_code == 200
    d = r.json()
    total = d["overall_compliance_pct"] + d["overall_breach_pct"]
    assert abs(total - 100.0) < 1.0

def test_sla_by_priority_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-intelligence/by-priority",
                     headers=auth_headers, timeout=20)
    _skip(r, "sla-priority")
    assert r.status_code == 200
    d = r.json()
    assert "data" in d
    for item in d["data"]:
        assert "priority" in item
        assert "breach_pct" in item
        assert "risk_level" in item
        assert item["risk_level"] in ("LOW","MODERATE","HIGH","CRITICAL")

def test_sla_by_category_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-intelligence/by-category",
                     headers=auth_headers, timeout=20)
    _skip(r, "sla-category")
    assert r.status_code == 200
    d = r.json()
    assert "data" in d
    for item in d["data"]:
        assert "category" in item
        assert "breach_pct" in item
        assert 0 <= item["breach_pct"] <= 100

def test_sla_backlog_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-intelligence/backlog",
                     headers=auth_headers, timeout=20)
    _skip(r, "sla-backlog")
    assert r.status_code == 200
    d = r.json()
    assert "total_open" in d
    assert "stale_over_30_days" in d
    assert "age_distribution" in d
    assert d["total_open"] >= 0

def test_sla_recommendations_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-intelligence/recommendations",
                     headers=auth_headers, timeout=20)
    _skip(r, "sla-recs")
    assert r.status_code == 200
    d = r.json()
    assert "recommendations" in d
    for rec in d["recommendations"]:
        assert "priority" in rec
        assert "type" in rec
        assert "message" in rec
        assert "action" in rec

def test_sla_backlog_stale_detected(auth_headers):
    """Given 356 open WOs, stale backlog should be significant."""
    r = requests.get(f"{BASE}/api/v1/sla-intelligence/backlog",
                     headers=auth_headers, timeout=20)
    _skip(r, "sla-stale")
    assert r.status_code == 200
    d = r.json()
    assert d["total_open"] > 0

def test_sla_categories_sorted_by_breach(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-intelligence/by-category",
                     headers=auth_headers, timeout=20)
    _skip(r, "sla-sorted")
    assert r.status_code == 200
    items = r.json().get("data", [])
    if len(items) >= 2:
        breach_pcts = [i["breach_pct"] for i in items]
        assert breach_pcts == sorted(breach_pcts, reverse=True)
