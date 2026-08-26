"""Sprint A-016 — Procurement Intelligence Engine Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_procurement_summary_requires_auth():
    r = requests.get(f"{BASE}/api/v1/procurement-engine/summary", timeout=10)
    assert r.status_code in (401, 403)

def test_procurement_summary_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/procurement-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "proc-summary")
    assert r.status_code == 200
    d = r.json()
    assert "spend" in d
    assert "concentration" in d
    assert "insights" in d
    s = d["spend"]
    assert "total_spend" in s
    assert "total_orders" in s
    assert "pending_orders" in s

def test_procurement_spend_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/procurement-engine/spend",
                     headers=auth_headers, timeout=20)
    _skip(r, "proc-spend")
    assert r.status_code == 200
    d = r.json()
    assert "suppliers" in d
    assert "total_spend" in d
    for s in d["suppliers"][:3]:
        assert "supplier" in s
        assert "total_spend" in s
        assert "order_count" in s
        assert "spend_risk" in s

def test_procurement_emergency_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/procurement-engine/emergency",
                     headers=auth_headers, timeout=20)
    _skip(r, "proc-emergency")
    assert r.status_code == 200
    d = r.json()
    assert "total" in d
    assert "bypass_risk_count" in d
    assert "purchases" in d

def test_procurement_pending_200(auth_headers):
    r = requests.get(f"{BASE}/api/v1/procurement-engine/pending",
                     headers=auth_headers, timeout=20)
    _skip(r, "proc-pending")
    assert r.status_code == 200
    d = r.json()
    assert "total_pending" in d
    assert "overdue_count" in d
    assert "purchase_orders" in d

def test_procurement_concentration_structure(auth_headers):
    r = requests.get(f"{BASE}/api/v1/procurement-engine/summary",
                     headers=auth_headers, timeout=20)
    _skip(r, "proc-concentration")
    assert r.status_code == 200
    c = r.json().get("concentration", {})
    assert "concentration_pct" in c
    assert "risk_level" in c
    assert c["risk_level"] in ("LOW","MODERATE","HIGH","CRITICAL")

def test_procurement_spend_limit(auth_headers):
    r = requests.get(f"{BASE}/api/v1/procurement-engine/spend?limit=5",
                     headers=auth_headers, timeout=20)
    _skip(r, "proc-spend-limit")
    assert r.status_code == 200
    assert len(r.json()["suppliers"]) <= 5

def test_procurement_emergency_risk_flags(auth_headers):
    r = requests.get(f"{BASE}/api/v1/procurement-engine/emergency",
                     headers=auth_headers, timeout=20)
    _skip(r, "proc-emergency-flags")
    assert r.status_code == 200
    valid_flags = {"BYPASS_RISK", "FAST_TRACK", "EXPEDITED"}
    for p in r.json()["purchases"][:5]:
        assert "risk_flag" in p
        assert p["risk_flag"] in valid_flags
