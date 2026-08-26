"""Sprint A-019 — Cost Intelligence Engine Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_cost_summary_requires_auth():
    r = requests.get(f"{BASE}/api/v1/cost-engine/summary", timeout=10)
    assert r.status_code in (401, 403)

def test_cost_summary_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "cost-summary")
    assert r.status_code == 200
    d = r.json()
    assert "cost_overview" in d
    assert "risk_summary" in d
    assert "insights" in d
    c = d["cost_overview"]
    assert "total_invoice_cost" in c
    assert "total_procurement_spend" in c
    assert "total_operational_cost" in c

def test_cost_by_asset_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/by-asset",
                     headers=auth_headers, timeout=20)
    _skip(r, "cost-by-asset")
    assert r.status_code == 200
    d = r.json()
    assert "assets" in d
    assert "total_cost" in d
    for a in d["assets"][:3]:
        assert "asset_name" in a
        assert "total_invoice_cost" in a
        assert "cost_risk" in a
        assert a["cost_risk"] in ("HIGH", "MODERATE", "LOW")

def test_cost_by_category_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/by-category",
                     headers=auth_headers, timeout=20)
    _skip(r, "cost-by-cat")
    assert r.status_code == 200
    d = r.json()
    assert "categories" in d
    for cat in d["categories"][:3]:
        assert "category" in cat
        assert "total_cost" in cat
        assert "maintenance_burden" in cat
        assert cat["maintenance_burden"] in ("VERY_HIGH", "HIGH", "MODERATE", "LOW")

def test_cost_recurring_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/recurring",
                     headers=auth_headers, timeout=20)
    _skip(r, "cost-recurring")
    assert r.status_code == 200
    d = r.json()
    assert "total_recurring" in d
    assert "chronic_count" in d
    assert "assets" in d

def test_cost_recurring_asset_structure(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/recurring",
                     headers=auth_headers, timeout=20)
    _skip(r, "cost-recurring-struct")
    assert r.status_code == 200
    for a in r.json()["assets"][:3]:
        assert "failure_count" in a
        assert "pattern" in a
        assert "recommendation" in a
        assert a["pattern"] in ("CHRONIC", "FREQUENT", "RECURRING")
        assert a["failure_count"] >= 3

def test_cost_summary_totals_positive(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "cost-totals")
    assert r.status_code == 200
    c = r.json()["cost_overview"]
    assert c["total_invoice_cost"] >= 0
    assert c["total_procurement_spend"] >= 0
    assert c["total_operational_cost"] >= c["total_invoice_cost"]

def test_cost_by_asset_limit(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/by-asset?limit=5",
                     headers=auth_headers, timeout=20)
    _skip(r, "cost-limit")
    assert r.status_code == 200
    assert len(r.json()["assets"]) <= 5
