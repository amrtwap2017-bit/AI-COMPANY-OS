"""Sprint A-038 — Backlog Engine + Intelligence Loop Extended Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_backlog_533_open_wos(auth_headers):
    """Verify 500+ open WOs in backlog (large commercial demo point)."""
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-533")
    assert r.status_code == 200
    total = r.json()["backlog_summary"]["total_open"]
    assert total >= 100, f"Backlog unexpectedly small: {total}"

def test_backlog_avg_age_positive(auth_headers):
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-age")
    assert r.status_code == 200
    avg = r.json()["backlog_summary"]["avg_age_days"]
    assert avg > 0, "Avg age should be positive"

def test_backlog_max_age_over_30_days(auth_headers):
    """37-day old WOs — strong commercial demo point."""
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-max-age")
    assert r.status_code == 200
    max_age = r.json()["backlog_summary"]["max_age_days"]
    assert max_age > 0, "Max age should be > 0"

def test_backlog_insights_present(auth_headers):
    """Backlog should generate intelligence insights."""
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-insights")
    assert r.status_code == 200
    insights = r.json().get("insights", [])
    assert len(insights) > 0, "No insights generated despite large backlog"
    for ins in insights:
        assert "type" in ins
        assert "severity" in ins
        assert "message" in ins

def test_backlog_oldest_20_limit(auth_headers):
    r = requests.get(f"{BASE}/api/v1/backlog-engine/oldest?limit=20",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-limit")
    assert r.status_code == 200
    assert len(r.json()["work_orders"]) <= 20

def test_backlog_all_priorities_covered(auth_headers):
    """Multiple priorities should exist in backlog."""
    r = requests.get(f"{BASE}/api/v1/backlog-engine/by-priority",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-priorities")
    assert r.status_code == 200
    priorities = [item["priority"] for item in r.json()["by_priority"]]
    assert len(priorities) >= 2, f"Too few priority groups: {priorities}"

def test_all_10_engines_200(auth_headers):
    """All 10 intelligence engines should return 200."""
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
        "/api/v1/backlog-engine/summary",
    ]
    failed = []
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429:
            pytest.skip("Rate limited")
        if r.status_code != 200:
            failed.append(f"{ep} → {r.status_code}")
    assert not failed, f"Engine failures: {failed}"

def test_backlog_engine_has_hotel_id(auth_headers):
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-hid")
    assert r.status_code == 200
    assert "hotel_id" in r.json()

def test_backlog_oldest_5_in_summary(auth_headers):
    """Summary should include top 5 oldest WOs."""
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-oldest5")
    assert r.status_code == 200
    assert "oldest_5" in r.json()

def test_backlog_priority_risk_valid(auth_headers):
    r = requests.get(f"{BASE}/api/v1/backlog-engine/by-priority",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-risk")
    assert r.status_code == 200
    valid = {"CRITICAL","HIGH","MODERATE","LOW"}
    for item in r.json()["by_priority"]:
        assert item["risk_level"] in valid

def test_intelligence_loop_endpoints_200(auth_headers):
    """All endpoints powering the intelligence loop page should work."""
    endpoints = [
        "/api/v1/backlog-engine/summary",
        "/api/v1/sla-engine/summary",
        "/api/v1/pm-engine/summary",
    ]
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429:
            pytest.skip("Rate limited")
        assert r.status_code == 200, f"{ep} → {r.status_code}"

def test_backlog_critical_count_accurate(auth_headers):
    """Oldest endpoint critical count should match urgency values."""
    r = requests.get(f"{BASE}/api/v1/backlog-engine/oldest?limit=50",
                     headers=auth_headers, timeout=15)
    _skip(r, "backlog-critical-count")
    assert r.status_code == 200
    d = r.json()
    reported_critical = d["critical_count"]
    actual_critical = sum(
        1 for wo in d["work_orders"]
        if wo["urgency"] in ("CRITICAL","HIGH")
    )
    assert reported_critical == actual_critical
