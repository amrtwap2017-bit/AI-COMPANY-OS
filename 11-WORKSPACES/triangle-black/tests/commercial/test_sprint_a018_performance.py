"""Sprint A-018 — Intelligence Engine Performance Tests"""
import pytest
import requests
import time

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

INTELLIGENCE_ENDPOINTS = [
    ("/api/v1/pm-engine/summary", 2000),
    ("/api/v1/pm-engine/compliance", 2000),
    ("/api/v1/sla-engine/summary", 2000),
    ("/api/v1/sla-engine/at-risk", 2000),
    ("/api/v1/asset-engine/summary", 3000),
    ("/api/v1/asset-engine/health-scores", 3000),
    ("/api/v1/supplier-engine/summary", 3000),
    ("/api/v1/supplier-engine/scores", 3000),
    ("/api/v1/procurement-engine/summary", 2000),
    ("/api/v1/executive-engine/daily-briefing", 3000),
    ("/api/v1/executive-engine/health-score", 2000),
]

def test_pm_engine_under_2s(auth_headers):
    start = time.time()
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=10)
    ms = (time.time() - start) * 1000
    _skip(r, "pm-perf")
    assert r.status_code == 200
    assert ms < 2000, f"PM engine took {ms:.0f}ms (limit: 2000ms)"

def test_sla_engine_at_risk_under_2s(auth_headers):
    start = time.time()
    r = requests.get(f"{BASE}/api/v1/sla-engine/at-risk",
                     headers=auth_headers, timeout=10)
    ms = (time.time() - start) * 1000
    _skip(r, "sla-at-risk-perf")
    assert r.status_code == 200
    assert ms < 2000, f"SLA at-risk took {ms:.0f}ms (limit: 2000ms)"

def test_asset_engine_health_under_3s(auth_headers):
    start = time.time()
    r = requests.get(f"{BASE}/api/v1/asset-engine/health-scores",
                     headers=auth_headers, timeout=15)
    ms = (time.time() - start) * 1000
    _skip(r, "asset-health-perf")
    assert r.status_code == 200
    assert ms < 3000, f"Asset health scores took {ms:.0f}ms (limit: 3000ms)"

def test_supplier_engine_scores_under_3s(auth_headers):
    start = time.time()
    r = requests.get(f"{BASE}/api/v1/supplier-engine/scores",
                     headers=auth_headers, timeout=15)
    ms = (time.time() - start) * 1000
    _skip(r, "supplier-scores-perf")
    assert r.status_code == 200
    assert ms < 3000, f"Supplier scores took {ms:.0f}ms (limit: 3000ms)"

def test_executive_briefing_under_3s(auth_headers):
    start = time.time()
    r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing",
                     headers=auth_headers, timeout=15)
    ms = (time.time() - start) * 1000
    _skip(r, "exec-briefing-perf")
    assert r.status_code == 200
    assert ms < 3000, f"Executive briefing took {ms:.0f}ms (limit: 3000ms)"

def test_procurement_summary_under_2s(auth_headers):
    start = time.time()
    r = requests.get(f"{BASE}/api/v1/procurement-engine/summary",
                     headers=auth_headers, timeout=10)
    ms = (time.time() - start) * 1000
    _skip(r, "proc-summary-perf")
    assert r.status_code == 200
    assert ms < 2000, f"Procurement summary took {ms:.0f}ms (limit: 2000ms)"

def test_all_intelligence_engines_200_and_fast(auth_headers):
    """Batch performance check — all engines under their limit."""
    results = []
    for ep, limit_ms in INTELLIGENCE_ENDPOINTS:
        start = time.time()
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        ms = (time.time() - start) * 1000
        if r.status_code == 429:
            pytest.skip("Rate limited")
        results.append({
            "ep": ep, "status": r.status_code,
            "ms": ms, "limit": limit_ms, "ok": ms < limit_ms
        })

    failing = [r for r in results if not r["ok"] or r["status"] != 200]
    summary = "\n".join([
        f"  {'✅' if r['ok'] else '🔴'} {r['ms']:.0f}ms / {r['limit']}ms — {r['ep']}"
        for r in results
    ])
    assert not failing, f"Performance failures:\n{summary}"

def test_intelligence_response_headers(auth_headers):
    """Verify X-Response-Time header present on intelligence endpoints."""
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=10)
    _skip(r, "perf-headers")
    assert r.status_code == 200
    # X-Request-ID or X-Response-Time should be present (added by middleware)
    has_header = (
        "x-request-id" in r.headers or
        "x-response-time" in r.headers or
        "x-db-query-count" in r.headers
    )
    assert has_header, f"No performance headers found. Headers: {dict(r.headers)}"
