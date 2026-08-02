"""
tests/test_reports.py — Sprint 13B: Advanced Reports + CSV Export
8 integration tests
"""
import pytest


# ── helpers ───────────────────────────────────────────────────────────────────

def _manager_headers(client):
    """Get auth headers using manager account."""
    r = client.post(
        "/api/v1/auth/login",
        data={"username": "sara@triangleblack.com", "password": "Manager123!"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    token = r.json().get("access_token", "")
    return {"Authorization": f"Bearer {token}"}


def _admin_headers(client):
    """Get auth headers using admin account."""
    r = client.post(
        "/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    token = r.json().get("access_token", "")
    return {"Authorization": f"Bearer {token}"}


# ── 1. Revenue Trend ──────────────────────────────────────────────────────────

def test_revenue_trend_requires_auth():
    import requests as _req
    r = _req.get("http://localhost:8030/api/v1/actions/reports/revenue-trend", timeout=10)
    assert r.status_code == 401


def test_revenue_trend_default_12_months(client):
    headers = _admin_headers(client)
    r = client.get("/api/v1/actions/reports/revenue-trend", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["months"] == 12
    assert len(data["series"]) == 12
    assert "totals" in data
    assert "approved_quotes" in data["totals"]
    assert "invoices_paid" in data["totals"]
    assert data["currency"] == "EGP"


def test_revenue_trend_custom_months(client):
    headers = _admin_headers(client)
    r = client.get("/api/v1/actions/reports/revenue-trend?months=6", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["months"] == 6
    assert len(data["series"]) == 6
    # Each series row has required keys
    row = data["series"][0]
    assert "month" in row
    assert "approved_quotes" in row
    assert "active_contracts" in row
    assert "invoices_sent" in row
    assert "invoices_paid" in row


# ── 2. Lead Funnel ────────────────────────────────────────────────────────────

def test_lead_funnel_requires_auth(client):
    r = client.get("/api/v1/actions/reports/lead-funnel")
    assert r.status_code == 401


def test_lead_funnel_returns_all_stages(client):
    headers = _admin_headers(client)
    r = client.get("/api/v1/actions/reports/lead-funnel", headers=headers)
    assert r.status_code == 200
    data = r.json()
    keys = [s["key"] for s in data["stages"]]
    assert "new" in keys
    assert "qualified" in keys
    assert "assigned" in keys
    assert "quote_sent" in keys
    assert "quote_approved" in keys
    assert "contracts_active" in keys
    assert "conversion_rates" in data
    assert "total_leads" in data
    # conversion rates are percentages 0-100 (or higher if data quirks)
    for rate in data["conversion_rates"].values():
        assert rate >= 0.0


# ── 3. Agent Leaderboard ──────────────────────────────────────────────────────

def test_agent_leaderboard_requires_auth(client):
    r = client.get("/api/v1/actions/reports/agent-leaderboard")
    assert r.status_code == 401


def test_agent_leaderboard_structure(client):
    headers = _admin_headers(client)
    r = client.get("/api/v1/actions/reports/agent-leaderboard", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert "agents" in data
    assert "total_agents" in data
    assert data["total_agents"] >= 0
    if data["agents"]:
        agent = data["agents"][0]
        required_keys = [
            "agent_id", "name", "email",
            "current_leads", "max_leads", "utilization_pct",
            "quotes_sent", "quotes_approved",
            "contracts_active", "approval_rate",
        ]
        for key in required_keys:
            assert key in agent, f"Missing key: {key}"
        assert 0.0 <= agent["utilization_pct"] <= 100.0


# ── 4. Invoice CSV Export ─────────────────────────────────────────────────────

def test_invoice_csv_requires_auth(client):
    r = client.get("/api/v1/actions/reports/export/invoices.csv")
    assert r.status_code == 401


def test_invoice_csv_export(client):
    headers = _admin_headers(client)
    r = client.get("/api/v1/actions/reports/export/invoices.csv", headers=headers)
    assert r.status_code == 200
    assert "text/csv" in r.headers.get("content-type", "")
    assert "attachment" in r.headers.get("content-disposition", "")
    lines = r.text.strip().splitlines()
    assert len(lines) >= 1
    header = lines[0]
    assert "invoice_number" in header
    assert "total_amount" in header
    assert "status" in header


# ── 5. Contract CSV Export ────────────────────────────────────────────────────

def test_contract_csv_requires_auth(client):
    r = client.get("/api/v1/actions/reports/export/contracts.csv")
    assert r.status_code == 401


def test_contract_csv_export(client):
    headers = _admin_headers(client)
    r = client.get("/api/v1/actions/reports/export/contracts.csv", headers=headers)
    assert r.status_code == 200
    assert "text/csv" in r.headers.get("content-type", "")
    assert "attachment" in r.headers.get("content-disposition", "")
    lines = r.text.strip().splitlines()
    assert len(lines) >= 1
    header = lines[0]
    assert "contract_id" in header
    assert "total_value" in header
    assert "status" in header
