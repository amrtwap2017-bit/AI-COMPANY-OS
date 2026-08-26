"""Sprint A-014 — Executive Engine Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_exec_briefing_requires_auth():
    r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing", timeout=10)
    assert r.status_code in (401, 403)

def test_exec_daily_briefing_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing",
                     headers=auth_headers, timeout=20)
    _skip(r, "exec-briefing")
    assert r.status_code == 200
    d = r.json()
    assert "health" in d
    assert "kpis" in d
    assert "alerts" in d
    assert "summary" in d
    assert "requires_attention" in d

def test_exec_health_score_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=20)
    _skip(r, "exec-health")
    assert r.status_code == 200
    d = r.json()
    assert "health_score" in d
    assert "grade" in d
    assert "components" in d
    assert 0 <= d["health_score"] <= 100
    assert d["grade"] in ("EXCELLENT", "GOOD", "FAIR", "POOR")

def test_exec_health_components(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=20)
    _skip(r, "exec-health-comp")
    assert r.status_code == 200
    comps = r.json().get("components", {})
    assert "sla_compliance" in comps
    assert "wo_completion" in comps
    assert "pm_compliance" in comps
    assert "supplier_score" in comps

def test_exec_alerts_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/alerts",
                     headers=auth_headers, timeout=20)
    _skip(r, "exec-alerts")
    assert r.status_code == 200
    d = r.json()
    assert "total_alerts" in d
    assert "critical_count" in d
    assert "alerts" in d

def test_exec_alert_structure(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/alerts",
                     headers=auth_headers, timeout=20)
    _skip(r, "exec-alert-struct")
    assert r.status_code == 200
    for alert in r.json().get("alerts", [])[:3]:
        assert "type" in alert
        assert "severity" in alert
        assert "title" in alert
        assert "message" in alert
        assert "count" in alert

def test_exec_kpis_present(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing",
                     headers=auth_headers, timeout=20)
    _skip(r, "exec-kpis")
    assert r.status_code == 200
    kpis = r.json().get("kpis", {})
    assert "open_work_orders" in kpis
    assert "active_suppliers" in kpis
    assert "total_assets" in kpis
    assert "active_alerts" in kpis

def test_exec_briefing_has_date(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing",
                     headers=auth_headers, timeout=20)
    _skip(r, "exec-date")
    assert r.status_code == 200
    d = r.json()
    assert "date" in d
    assert "generated_at" in d
    assert "2026" in d["date"]
