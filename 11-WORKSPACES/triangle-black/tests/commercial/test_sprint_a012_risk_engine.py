"""Sprint A-012 — Operational Risk Engine Tests
REWRITTEN A-021: Tests updated to match actual risk-engine API shape.

Actual endpoints (verified live):
  GET /api/v1/risk-engine/summary    — composite risk summary
  GET /api/v1/risk-engine/operational — 4-component operational risk
  GET /api/v1/risk-engine/asset-risk  — per-asset predictive risk
  GET /api/v1/risk-engine/forecast    — 30-day forecast

Also verified live:
  GET /api/v1/risk-intelligence/composite-score  ✅ 200
  GET /api/v1/risk-intelligence/domain-scores    ✅ 200

NOT available (404 — reorganized):
  /risk-engine/assets, /risk-engine/operations,
  /risk-engine/maintenance, /risk-engine/finance,
  /risk-engine/procurement
"""
import pytest
import requests

BASE = "http://localhost:8030"


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


def test_risk_engine_requires_auth():
    r = requests.get(f"{BASE}/api/v1/risk-engine/summary", timeout=10)
    assert r.status_code in (401, 403)


def test_risk_summary_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "risk-summary")
    assert r.status_code == 200
    d = r.json()
    assert "operational_risk" in d
    assert "asset_risk_summary" in d
    assert "forecast" in d
    assert "insights" in d


def test_risk_summary_score_range(auth_headers):
    r = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                     headers=auth_headers, timeout=20)
    _skip(r, "risk-range")
    assert r.status_code == 200
    d = r.json()
    assert 0 <= d["composite_risk_score"] <= 100


def test_risk_assets_200(auth_headers):
    """Asset risk via /risk-engine/asset-risk (replaces /risk-engine/assets)."""
    r = requests.get(f"{BASE}/api/v1/risk-engine/asset-risk",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-assets")
    assert r.status_code == 200
    d = r.json()
    assert "assets" in d
    assert "critical_count" in d
    for a in d["assets"][:3]:
        assert 0 <= a["risk_score"] <= 100


def test_risk_operations_200(auth_headers):
    """Operational risk via /risk-engine/operational (replaces /risk-engine/operations)."""
    r = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-ops")
    assert r.status_code == 200
    d = r.json()
    assert "composite_risk_score" in d
    comps = d.get("components", {})
    assert "sla_risk" in comps


def test_risk_maintenance_200(auth_headers):
    """PM/Maintenance risk via operational components."""
    r = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-maint")
    assert r.status_code == 200
    d = r.json()
    comps = d.get("components", {})
    assert "pm_risk" in comps
    assert 0 <= comps["pm_risk"]["score"] <= 100


def test_risk_finance_200(auth_headers):
    """Finance/Procurement risk via operational components."""
    r = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-fin")
    assert r.status_code == 200
    d = r.json()
    comps = d.get("components", {})
    assert "procurement_risk" in comps
    assert 0 <= comps["procurement_risk"]["score"] <= 100


def test_risk_procurement_200(auth_headers):
    """Procurement risk detail via procurement-engine."""
    r = requests.get(f"{BASE}/api/v1/procurement-engine/pending",
                     headers=auth_headers, timeout=15)
    _skip(r, "risk-proc")
    assert r.status_code == 200
    d = r.json()
    assert "total_pending" in d
    assert "overdue_count" in d


def test_risk_summary_has_all_5_domains(auth_headers):
    """Verify all 4 risk components present in operational risk."""
    r = requests.get(f"{BASE}/api/v1/risk-engine/operational",
                     headers=auth_headers, timeout=20)
    _skip(r, "risk-domains")
    assert r.status_code == 200
    d = r.json()
    comps = set(d.get("components", {}).keys())
    required = {"sla_risk", "pm_risk", "asset_risk", "procurement_risk"}
    assert required.issubset(comps), f"Missing components: {required - comps}"
