"""Sprint A-007 — KPI Engine Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_kpi_engine_dashboard_requires_auth():
    r = requests.get(f"{BASE}/api/v1/kpi-engine/dashboard", timeout=10)
    assert r.status_code in (401, 403)

def test_kpi_engine_dashboard_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/kpi-engine/dashboard", headers=auth_headers, timeout=20)
    _skip(r, "kpi-dashboard")
    assert r.status_code == 200
    d = r.json()
    assert "operational_health_index" in d
    assert "kpis" in d
    assert "kpi_summary" in d
    assert "morning_brief" in d
    assert "urgent_alerts" in d
    assert d["report_type"] == "KPI_ENGINE_DASHBOARD"

def test_kpi_engine_has_10_kpis(auth_headers):
    r = requests.get(f"{BASE}/api/v1/kpi-engine/dashboard", headers=auth_headers, timeout=20)
    _skip(r, "kpi-10")
    assert r.status_code == 200
    kpis = r.json().get("kpis", [])
    assert len(kpis) == 10

def test_kpi_engine_ohi_valid(auth_headers):
    r = requests.get(f"{BASE}/api/v1/kpi-engine/dashboard", headers=auth_headers, timeout=20)
    _skip(r, "kpi-ohi")
    assert r.status_code == 200
    ohi = r.json().get("operational_health_index", {})
    assert 0 <= ohi.get("score", -1) <= 100
    assert ohi.get("grade") in ("A","B","C","D")
    assert ohi.get("label") in ("HEALTHY","MODERATE","AT RISK","CRITICAL")

def test_kpi_engine_kpi_structure(auth_headers):
    r = requests.get(f"{BASE}/api/v1/kpi-engine/dashboard", headers=auth_headers, timeout=20)
    _skip(r, "kpi-structure")
    assert r.status_code == 200
    for kpi in r.json().get("kpis", []):
        assert "id" in kpi
        assert "name" in kpi
        assert "value" in kpi
        assert "status" in kpi
        assert "category" in kpi
        assert "insight" in kpi
        assert kpi["status"] in ("RED","AMBER","GREEN")

def test_kpi_engine_ohi_endpoint(auth_headers):
    r = requests.get(f"{BASE}/api/v1/kpi-engine/ohi", headers=auth_headers, timeout=15)
    _skip(r, "kpi-ohi-ep")
    assert r.status_code == 200
    assert "ohi" in r.json()

def test_kpi_engine_alerts_endpoint(auth_headers):
    r = requests.get(f"{BASE}/api/v1/kpi-engine/alerts", headers=auth_headers, timeout=15)
    _skip(r, "kpi-alerts")
    assert r.status_code == 200
    d = r.json()
    assert "alert_count" in d
    assert "alerts" in d
    assert d["alert_count"] >= 0

def test_kpi_engine_trends_endpoint(auth_headers):
    r = requests.get(f"{BASE}/api/v1/kpi-engine/trends", headers=auth_headers, timeout=15)
    _skip(r, "kpi-trends")
    assert r.status_code == 200
    d = r.json()
    assert "work_order_trend" in d
    assert "asset_status_distribution" in d

def test_kpi_engine_morning_brief_is_string(auth_headers):
    r = requests.get(f"{BASE}/api/v1/kpi-engine/dashboard", headers=auth_headers, timeout=20)
    _skip(r, "kpi-brief")
    assert r.status_code == 200
    brief = r.json().get("morning_brief", "")
    assert isinstance(brief, str)
    assert len(brief) > 20
    assert "OHI:" in brief
