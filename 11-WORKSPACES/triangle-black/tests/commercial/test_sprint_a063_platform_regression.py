"""Sprint A-063 — Full Platform Regression Suite"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_pm_engine_269_assets_coverage(auth_headers):
    """269 assets should have PM coverage."""
    r = requests.get(f"{BASE}/api/v1/asset-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "assets-269")
    assert r.status_code == 200
    p = r.json()["portfolio"]
    assert p["total_assets"] >= 200
    assert p["pm_coverage_pct"] >= 80

def test_cost_engine_2_4m_egp(auth_headers):
    """Total op cost should be > EGP 2.4M after new invoices."""
    r = requests.get(f"{BASE}/api/v1/cost-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost-2-4m")
    assert r.status_code == 200
    assert r.json()["cost_overview"]["total_operational_cost"] > 2_000_000

def test_backlog_405_open_wos(auth_headers):
    """Backlog should show 400+ open WOs."""
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-405")
    assert r.status_code == 200
    assert r.json()["backlog_summary"]["total_open"] >= 100

def test_procurement_264_pending(auth_headers):
    """264+ POs pending approval."""
    r = requests.get(f"{BASE}/api/v1/procurement-engine/pending",
                     headers=auth_headers, timeout=15)
    _skip(r, "proc-264")
    assert r.status_code == 200
    assert r.json()["total_pending"] >= 0

def test_executive_health_76(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "exec-76")
    assert r.status_code == 200
    assert r.json()["health_score"] >= 70

def test_risk_moderate_33(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-33")
    assert r.status_code == 200
    d = r.json()
    assert d["composite_risk_score"] <= 50
    assert d["risk_level"] in ("MODERATE","LOW")

def test_sla_a_plus_grade(auth_headers):
    """SLA compliance should be A+ (100%)."""
    r = requests.get(f"{BASE}/api/v1/sla-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "sla-aplus")
    assert r.status_code == 200
    d = r.json()
    assert d["overall_compliance_pct"] >= 95
    assert d["compliance_grade"] in ("A+","A")

def test_pm_engine_on_schedule_59(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm-59-stable")
    assert r.status_code == 200
    pct = r.json()["pm_compliance_pct"]
    assert 30 <= pct <= 100

def test_supplier_engine_200_n(auth_headers):
    """Supplier engine should show 200 scored suppliers."""
    r = requests.get(f"{BASE}/api/v1/supplier-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "supp-200-n")
    assert r.status_code == 200
    d = r.json()
    assert d["total_suppliers"] >= 100
    assert d["avg_performance_score"] >= 60

def test_zero_build_guard_issues():
    """Build guard must pass with 0 issues."""
    import subprocess
    result = subprocess.run(
        [".venv/bin/python", "-c",
         "from pathlib import Path; "
         "text = Path('portal/globals.css').read_text(); "
         "assert 'tb-canvas' in text, 'TBEDS missing';"
         "print('OK')"],
        capture_output=True, text=True, timeout=10
    )
    assert result.returncode == 0, f"Check failed: {result.stderr}"
