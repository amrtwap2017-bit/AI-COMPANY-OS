"""Sprint A-010 — Cost Intelligence Engine Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_cost_intelligence_requires_auth():
    r = requests.get(f"{BASE}/api/v1/cost-intelligence/summary", timeout=10)
    assert r.status_code in (401, 403)

def test_cost_summary_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-intelligence/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "cost-summary")
    assert r.status_code == 200
    d = r.json()
    assert "total_invoice_spend" in d
    assert "cost_efficiency_score" in d
    assert "invoice_aging_risk" in d
    assert "insights" in d
    assert d["cost_efficiency_grade"] in ("A","B","C","D")

def test_cost_monthly_trend_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-intelligence/monthly-trend",
                     headers=auth_headers, timeout=20)
    _skip(r, "cost-trend")
    assert r.status_code == 200
    d = r.json()
    assert "months" in d
    assert "total_6m_spend" in d
    assert d["period"] == "6_months"
    assert d["trend_direction"] in ("INCREASING","DECREASING","STABLE")

def test_cost_invoice_aging_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-intelligence/invoice-aging",
                     headers=auth_headers, timeout=20)
    _skip(r, "cost-aging")
    assert r.status_code == 200
    d = r.json()
    assert "overdue_pct" in d
    assert "payment_rate" in d
    assert "aging_buckets" in d
    assert d["risk_level"] in ("LOW","MODERATE","HIGH","CRITICAL")
    assert 0 <= d["overdue_pct"] <= 100
    assert 0 <= d["payment_rate"] <= 100

def test_cost_top_drivers_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-intelligence/top-drivers?limit=5",
                     headers=auth_headers, timeout=20)
    _skip(r, "cost-drivers")
    assert r.status_code == 200
    d = r.json()
    assert "top_invoices" in d
    assert "top_po_suppliers" in d
    assert 0 <= d["top_invoices_concentration_pct"] <= 100

def test_cost_efficiency_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-intelligence/efficiency",
                     headers=auth_headers, timeout=20)
    _skip(r, "cost-efficiency")
    assert r.status_code == 200
    d = r.json()
    assert "cost_efficiency_score" in d
    assert "grade" in d
    assert "components" in d
    assert 0 <= d["cost_efficiency_score"] <= 100
    assert d["grade"] in ("A","B","C","D")

def test_cost_efficiency_components_sum(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-intelligence/efficiency",
                     headers=auth_headers, timeout=20)
    _skip(r, "cost-components")
    assert r.status_code == 200
    d = r.json()
    comps = d.get("components", {})
    total = sum(comps.values())
    assert abs(total - d["cost_efficiency_score"]) < 1.0

def test_cost_monthly_trend_has_mom_change(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-intelligence/monthly-trend",
                     headers=auth_headers, timeout=20)
    _skip(r, "cost-mom")
    assert r.status_code == 200
    months = r.json().get("months", [])
    if len(months) >= 2:
        assert "mom_change_pct" in months[1]

def test_cost_summary_spend_positive(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-intelligence/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "cost-positive")
    assert r.status_code == 200
    d = r.json()
    assert d.get("total_invoice_spend", 0) >= 0
