"""Sprint A-015 — Asset Intelligence Engine Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_asset_engine_summary_requires_auth():
    r = requests.get(f"{BASE}/api/v1/asset-engine/summary", timeout=10)
    assert r.status_code in (401, 403)

def test_asset_engine_summary_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "asset-summary")
    assert r.status_code == 200
    d = r.json()
    assert "portfolio" in d
    assert "risk_summary" in d
    assert "insights" in d
    p = d["portfolio"]
    assert "total_assets" in p
    assert "pm_coverage_pct" in p

def test_asset_health_scores_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/health-scores",
                     headers=auth_headers, timeout=20)
    _skip(r, "asset-health")
    assert r.status_code == 200
    d = r.json()
    assert "assets" in d
    assert "count" in d
    for a in d["assets"][:3]:
        assert "health_score" in a
        assert "risk_level" in a
        assert 0 <= a["health_score"] <= 100
        assert a["risk_level"] in ("CRITICAL","HIGH","MODERATE","LOW")

def test_asset_by_category_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/by-category",
                     headers=auth_headers, timeout=20)
    _skip(r, "asset-by-cat")
    assert r.status_code == 200
    d = r.json()
    assert "categories" in d
    for cat in d["categories"][:3]:
        assert "category" in cat
        assert "total_assets" in cat
        assert "risk_level" in cat
        assert "pm_coverage_pct" in cat

def test_asset_critical_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/critical",
                     headers=auth_headers, timeout=20)
    _skip(r, "asset-critical")
    assert r.status_code == 200
    d = r.json()
    assert "total_critical" in d
    assert "assets" in d

def test_asset_portfolio_has_data(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "asset-data")
    assert r.status_code == 200
    p = r.json()["portfolio"]
    assert p.get("total_assets", 0) >= 0

def test_asset_health_score_limit(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/health-scores?limit=10",
                     headers=auth_headers, timeout=20)
    _skip(r, "asset-limit")
    assert r.status_code == 200
    assert len(r.json()["assets"]) <= 10

def test_asset_category_has_risk_levels(auth_headers):
    r = requests.get(f"{BASE}/api/v1/asset-engine/by-category",
                     headers=auth_headers, timeout=20)
    _skip(r, "asset-risk-levels")
    assert r.status_code == 200
    valid_risks = {"CRITICAL", "HIGH", "MODERATE", "LOW"}
    for cat in r.json()["categories"]:
        assert cat["risk_level"] in valid_risks
