"""Sprint A-006 — Supplier Engine Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_supplier_engine_summary_requires_auth():
    r = requests.get(f"{BASE}/api/v1/supplier-engine/summary", timeout=10)
    assert r.status_code in (401, 403)

def test_supplier_engine_summary_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/summary", headers=auth_headers, timeout=20)
    _skip(r, "se-summary")
    assert r.status_code == 200
    d = r.json()
    assert "total_suppliers" in d
    assert "avg_performance_score" in d
    assert "concentration_risk" in d
    assert "insights" in d
    assert 0 <= d["avg_performance_score"] <= 100

def test_supplier_engine_scores_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/scores?limit=10", headers=auth_headers, timeout=20)
    _skip(r, "se-scores")
    assert r.status_code == 200
    d = r.json()
    assert "suppliers" in d
    if d["suppliers"]:
        s = d["suppliers"][0]
        assert "performance_score" in s
        assert "grade" in s
        assert "recommendation" in s
        assert 0 <= s["performance_score"] <= 100
        assert s["grade"] in ("A","B","C","D")
        assert s["recommendation"] in ("PREFERRED","RELIABLE","ACCEPTABLE","MONITOR","AVOID","BLACKLISTED")

def test_supplier_engine_concentration_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/concentration", headers=auth_headers, timeout=20)
    _skip(r, "se-concentration")
    assert r.status_code == 200
    d = r.json()
    assert "concentration_pct" in d
    assert "risk_level" in d
    assert "insight" in d
    assert d["risk_level"] in ("LOW","MODERATE","HIGH","CRITICAL")
    assert 0 <= d["concentration_pct"] <= 100

def test_supplier_engine_recommendations_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/recommendations", headers=auth_headers, timeout=20)
    _skip(r, "se-recs")
    assert r.status_code == 200
    d = r.json()
    assert "preferred_suppliers" in d
    assert "avoid_suppliers" in d
    assert "insights" in d
    assert "summary" in d

def test_supplier_engine_diversity_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/diversity", headers=auth_headers, timeout=20)
    _skip(r, "se-diversity")
    assert r.status_code == 200
    d = r.json()
    assert "by_category" in d
    assert "total_categories" in d
    assert d["total_categories"] >= 0

def test_supplier_engine_scores_sorted_descending(auth_headers):
    r = requests.get(f"{BASE}/api/v1/supplier-engine/scores?limit=20", headers=auth_headers, timeout=20)
    _skip(r, "se-sorted")
    assert r.status_code == 200
    suppliers = r.json().get("suppliers", [])
    if len(suppliers) >= 2:
        scores = [s["performance_score"] for s in suppliers]
        assert scores == sorted(scores, reverse=True)

def test_suppliers_v2_performance_restored(auth_headers):
    r = requests.get(f"{BASE}/api/v1/suppliers-v2/performance", headers=auth_headers, timeout=10)
    _skip(r, "sv2-performance")
    assert r.status_code == 200

def test_suppliers_v2_top_spend_restored(auth_headers):
    r = requests.get(f"{BASE}/api/v1/suppliers-v2/top-spend", headers=auth_headers, timeout=10)
    _skip(r, "sv2-top-spend")
    assert r.status_code == 200
