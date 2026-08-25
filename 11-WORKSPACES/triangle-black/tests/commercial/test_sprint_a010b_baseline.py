"""
Sprint A-010-B — Operational Baseline Report Tests
"""
import pytest
import requests

BASE = "http://localhost:8030"


def _skip(r, ctx=""):
    if r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


def test_baseline_report_requires_auth():
    r = requests.get(f"{BASE}/api/v1/baseline/report", timeout=10)
    assert r.status_code in (401, 403), f"Expected auth required, got {r.status_code}"


def test_baseline_risk_requires_auth():
    r = requests.get(f"{BASE}/api/v1/baseline/risk", timeout=10)
    assert r.status_code in (401, 403)


def test_baseline_insights_requires_auth():
    r = requests.get(f"{BASE}/api/v1/baseline/insights", timeout=10)
    assert r.status_code in (401, 403)


def test_baseline_report_returns_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/baseline/report",
                     headers=auth_headers, timeout=30)
    _skip(r, "baseline-report")
    assert r.status_code == 200, f"Got {r.status_code}: {r.text[:200]}"


def test_baseline_report_structure(auth_headers):
    r = requests.get(f"{BASE}/api/v1/baseline/report",
                     headers=auth_headers, timeout=30)
    _skip(r, "baseline-structure")
    assert r.status_code == 200
    data = r.json()
    assert "risk" in data
    assert "insights" in data
    assert "sections" in data
    assert "generated_at" in data
    assert data["report_type"] == "OPERATIONAL_BASELINE"


def test_baseline_report_sections(auth_headers):
    r = requests.get(f"{BASE}/api/v1/baseline/report",
                     headers=auth_headers, timeout=30)
    _skip(r, "baseline-sections")
    assert r.status_code == 200
    sections = r.json().get("sections", {})
    required = [
        "asset_health", "work_order_backlog", "maintenance_cost",
        "procurement", "service_requests", "contract_compliance",
        "sites", "workforce"
    ]
    for s in required:
        assert s in sections, f"Missing section: {s}"


def test_baseline_risk_score(auth_headers):
    r = requests.get(f"{BASE}/api/v1/baseline/risk",
                     headers=auth_headers, timeout=15)
    _skip(r, "baseline-risk")
    assert r.status_code == 200
    data = r.json()
    assert "score" in data
    assert "grade" in data
    assert "label" in data
    assert 0 <= data["score"] <= 100, f"Score out of range: {data['score']}"
    assert data["grade"] in ("A", "B", "C", "D")


def test_baseline_insights(auth_headers):
    r = requests.get(f"{BASE}/api/v1/baseline/insights",
                     headers=auth_headers, timeout=15)
    _skip(r, "baseline-insights")
    assert r.status_code == 200
    data = r.json()
    assert "insights" in data
    assert isinstance(data["insights"], list)
    assert len(data["insights"]) > 0
    for insight in data["insights"]:
        assert "type" in insight
        assert "severity" in insight
        assert "message" in insight


def test_baseline_hotel_id_scoped(auth_headers):
    r = requests.get(f"{BASE}/api/v1/baseline/report",
                     headers=auth_headers, timeout=30)
    _skip(r, "baseline-scope")
    assert r.status_code == 200
    data = r.json()
    assert "hotel_id" in data
    assert len(data["hotel_id"]) > 0


def test_baseline_asset_health_metrics(auth_headers):
    r = requests.get(f"{BASE}/api/v1/baseline/report",
                     headers=auth_headers, timeout=30)
    _skip(r, "baseline-assets")
    assert r.status_code == 200
    assets = r.json()["sections"]["asset_health"]
    assert "total" in assets
    assert "critical" in assets
    assert "health_pct" in assets
    assert 0 <= assets["health_pct"] <= 100


def test_baseline_work_order_metrics(auth_headers):
    r = requests.get(f"{BASE}/api/v1/baseline/report",
                     headers=auth_headers, timeout=30)
    _skip(r, "baseline-wo")
    assert r.status_code == 200
    wo = r.json()["sections"]["work_order_backlog"]
    assert "total" in wo
    assert "open" in wo
    assert "completion_rate_pct" in wo
    assert "sla_compliance_pct" in wo
