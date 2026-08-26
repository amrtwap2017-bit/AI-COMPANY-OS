"""Sprint A-025 — Health Score + Startup Warning Fixes"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_health_score_has_four_components(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=20)
    _skip(r, "health-components")
    assert r.status_code == 200
    comps = r.json().get("components", {})
    assert len(comps) == 4
    for c in ["sla_compliance", "wo_completion", "pm_compliance", "supplier_score"]:
        assert c in comps

def test_health_score_weights_sum_to_one(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=20)
    _skip(r, "health-weights")
    assert r.status_code == 200
    weights = sum(v["weight"] for v in r.json()["components"].values())
    assert abs(weights - 1.0) < 0.01

def test_executive_assets_not_zero(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing",
                     headers=auth_headers, timeout=20)
    _skip(r, "exec-assets")
    assert r.status_code == 200
    assert r.json()["kpis"]["total_assets"] > 0

def test_executive_wos_not_zero(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing",
                     headers=auth_headers, timeout=20)
    _skip(r, "exec-wos")
    assert r.status_code == 200
    assert r.json()["kpis"]["open_work_orders"] > 0

def test_executive_suppliers_not_zero(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing",
                     headers=auth_headers, timeout=20)
    _skip(r, "exec-suppliers")
    assert r.status_code == 200
    assert r.json()["kpis"]["active_suppliers"] > 0

def test_asset_lifecycle_report_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-lifecycle/report",
                     headers=auth_headers, timeout=15)
    _skip(r, "asset-lifecycle")
    assert r.status_code == 200

def test_workflow_instances_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/workflow/instances",
                     headers=auth_headers, timeout=15)
    _skip(r, "wf-instances")
    assert r.status_code == 200
    assert r.json()["count"] >= 0

def test_all_9_engines_return_200(auth_headers):
    endpoints = [
        "/api/v1/pm-engine/summary",
        "/api/v1/sla-engine/summary",
        "/api/v1/asset-engine/summary",
        "/api/v1/supplier-engine/summary",
        "/api/v1/procurement-engine/summary",
        "/api/v1/executive-engine/health-score",
        "/api/v1/cost-engine/summary",
        "/api/v1/risk-engine/summary",
        "/api/v1/workflow/instances",
    ]
    failed = []
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429:
            pytest.skip("Rate limited")
        if r.status_code != 200:
            failed.append(f"{ep} → {r.status_code}")
    assert not failed, f"Failing engines: {failed}"
