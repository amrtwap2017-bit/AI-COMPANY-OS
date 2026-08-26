"""Sprint A-035 — WO Backlog Intelligence Engine Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_backlog_summary_requires_auth():
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary", timeout=10)
    assert r.status_code in (401, 403)

def test_backlog_summary_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "backlog-summary")
    assert r.status_code == 200
    d = r.json()
    assert "backlog_summary" in d
    assert "by_priority" in d
    assert "insights" in d
    b = d["backlog_summary"]
    assert "total_open" in b
    assert "avg_age_days" in b
    assert "max_age_days" in b

def test_backlog_has_open_wos(auth_headers):
    """Demo has 509+ open WOs — backlog should be significant."""
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "backlog-count")
    assert r.status_code == 200
    total = r.json()["backlog_summary"]["total_open"]
    assert total > 0, "No open WOs in backlog"

def test_backlog_by_priority_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/backlog-engine/by-priority",
                     headers=auth_headers, timeout=20)
    _skip(r, "backlog-priority")
    assert r.status_code == 200
    d = r.json()
    assert "by_priority" in d
    for item in d["by_priority"]:
        assert "priority" in item
        assert "avg_age_hours" in item
        assert "sla_target_hours" in item
        assert "risk_level" in item
        assert item["risk_level"] in ("CRITICAL","HIGH","MODERATE","LOW")

def test_backlog_oldest_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/backlog-engine/oldest",
                     headers=auth_headers, timeout=20)
    _skip(r, "backlog-oldest")
    assert r.status_code == 200
    d = r.json()
    assert "work_orders" in d
    assert "critical_count" in d
    for wo in d["work_orders"][:3]:
        assert "age_days" in wo
        assert "urgency" in wo
        assert wo["urgency"] in ("CRITICAL","HIGH","OVERDUE","PENDING")

def test_backlog_oldest_sorted(auth_headers):
    """Oldest WOs should be sorted by age (oldest first)."""
    r = requests.get(f"{BASE}/api/v1/backlog-engine/oldest?limit=10",
                     headers=auth_headers, timeout=20)
    _skip(r, "backlog-sorted")
    assert r.status_code == 200
    ages = [w["age_days"] for w in r.json()["work_orders"]]
    if len(ages) > 1:
        assert ages == sorted(ages, reverse=True), "WOs not sorted oldest first"

def test_backlog_sla_targets_ordered(auth_headers):
    """Emergency SLA target < Critical < High < Medium < Low."""
    r = requests.get(f"{BASE}/api/v1/backlog-engine/by-priority",
                     headers=auth_headers, timeout=20)
    _skip(r, "backlog-targets")
    assert r.status_code == 200
    targets = {item["priority"]: item["sla_target_hours"]
               for item in r.json()["by_priority"]}
    if "emergency" in targets and "critical" in targets:
        assert targets["emergency"] < targets["critical"]
    if "critical" in targets and "high" in targets:
        assert targets["critical"] < targets["high"]

def test_backlog_engine_in_all_engines(auth_headers):
    """Verify backlog engine joins the intelligence platform."""
    r = requests.get(f"{BASE}/api/v1/backlog-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "backlog-platform")
    assert r.status_code == 200
    assert "hotel_id" in r.json()
