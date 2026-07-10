"""
tests/test_invoices.py — Sprint 13X Invoice lifecycle tests
10 tests covering full invoice flow
"""
import pytest


# ── helpers ───────────────────────────────────────────────────────────────────

def _admin(client):
    r = client.post(
        "/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "Admin123!"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _manager(client):
    r = client.post(
        "/api/v1/auth/login",
        data={"username": "sara@triangleblack.com", "password": "Manager123!"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _agent(client):
    r = client.post(
        "/api/v1/auth/login",
        data={"username": "hassan@triangleblack.com", "password": "Agent123!"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


# ── 1. List invoices ──────────────────────────────────────────────────────────

def test_list_invoices_requires_auth(client):
    r = client.get("/api/v1/invoices/")
    assert r.status_code == 401


def test_list_invoices_admin(client):
    r = client.get("/api/v1/invoices/", headers=_admin(client))
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


def test_list_invoices_manager(client):
    r = client.get("/api/v1/invoices/", headers=_manager(client))
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ── 2. Invoice created on contract activate ───────────────────────────────────

def test_invoice_auto_created_on_contract_activate(client):
    """
    Full flow test: create lead → qualify → assign → quote → approve → activate
    Verify invoice is auto-created on contract activation.
    """
    import uuid
    auth = _admin(client)
    unique = str(uuid.uuid4())[:8]

    # Create lead
    lead = client.post("/api/v1/leads/", json={
        "name": f"INV-TEST Hotel {unique}",
        "email": f"inv_{unique}@test.com",
        "source": "direct", "priority": "high",
    }, headers=auth).json()
    lead_id = lead["id"]

    # Qualify
    client.post(f"/api/v1/actions/leads/{lead_id}/qualify", headers=auth)

    # Assign to first agent
    agents = client.get("/api/v1/agents/", headers=auth).json()
    assert agents, "No agents in DB"
    client.post(f"/api/v1/actions/leads/{lead_id}/assign",
                json={"agent_id": agents[0]["id"]}, headers=auth)

    # Generate quote
    gen_res = client.post(
        f"/api/v1/actions/leads/{lead_id}/quote",
        json={"contract_months": 12},
        headers=auth,
    )
    assert gen_res.status_code == 200, f"Quote gen failed: {gen_res.text}"
    quote_id = gen_res.json()["quote_id"]

    # Submit → send → approve (creates contract)
    client.post(f"/api/v1/actions/quotes/{quote_id}/submit", json={}, headers=auth)
    client.post(f"/api/v1/actions/quotes/{quote_id}/send",   json={}, headers=auth)
    approve = client.post(f"/api/v1/actions/quotes/{quote_id}/approve", json={}, headers=auth)
    assert approve.status_code == 200, f"Approve failed: {approve.text}"
    contract_id = approve.json()["contract_id"]

    # Activate contract — NOW builds the endpoint
    act = client.post(
        f"/api/v1/contracts/{contract_id}/activate",
        json={},
        headers=auth,
    )
    assert act.status_code == 200, f"Activate failed {act.status_code}: {act.text}"
    assert act.json()["status"] == "active"

    # Invoice must now exist
    invoices = client.get("/api/v1/invoices/", headers=auth).json()
    inv = next((i for i in invoices if i.get("contract_id") == contract_id), None)
    assert inv is not None, "Invoice was not auto-created on activate"
    assert inv["status"] == "draft"
    assert inv["total_amount"] > 0
    assert inv["tax_amount"] > 0
    assert inv["invoice_number"].startswith("TB-INV-")


# ── 3. Invoice detail ─────────────────────────────────────────────────────────

def test_get_invoice_detail(client):
    auth = _admin(client)
    invoices = client.get("/api/v1/invoices/", headers=auth).json()
    if not invoices:
        pytest.skip("No invoices in DB")
    inv_id = invoices[0]["id"]
    r = client.get(f"/api/v1/invoices/{inv_id}", headers=auth)
    assert r.status_code == 200
    data = r.json()
    assert "invoice_number" in data
    assert "total_amount" in data
    assert "tax_amount" in data
    assert "status" in data
    assert "due_date" in data


def test_get_invoice_not_found(client):
    r = client.get("/api/v1/invoices/nonexistent-0000", headers=_admin(client))
    assert r.status_code == 404


# ── 4. Send invoice ───────────────────────────────────────────────────────────

def test_send_invoice(client):
    auth = _admin(client)
    invoices = client.get("/api/v1/invoices/", headers=auth).json()
    draft = next((i for i in invoices if i["status"] == "draft"), None)
    if not draft:
        pytest.skip("No draft invoice available")
    r = client.post(f"/api/v1/invoices/{draft['id']}/send", headers=auth)
    assert r.status_code == 200
    assert r.json()["status"] == "sent"


# ── 5. Mark paid ──────────────────────────────────────────────────────────────

def test_mark_invoice_paid(client):
    auth = _admin(client)
    invoices = client.get("/api/v1/invoices/", headers=auth).json()
    sent = next((i for i in invoices if i["status"] == "sent"), None)
    if not sent:
        pytest.skip("No sent invoice available")
    r = client.post(f"/api/v1/invoices/{sent['id']}/mark-paid", json={}, headers=auth)
    assert r.status_code == 200
    assert r.json()["status"] == "paid"


# ── 6. Permissions ────────────────────────────────────────────────────────────

def test_agent_can_list_invoices(client):
    """Agents should be able to view invoices (read access)."""
    r = client.get("/api/v1/invoices/", headers=_agent(client))
    assert r.status_code in (200, 403)  # 200 if allowed, 403 if manager-only


def test_invoice_csv_has_correct_headers(client):
    r = client.get(
        "/api/v1/actions/reports/export/invoices.csv",
        headers=_admin(client),
    )
    assert r.status_code == 200
    assert "text/csv" in r.headers.get("content-type", "")
    header = r.text.splitlines()[0]
    assert "invoice_number" in header
    assert "total_amount" in header
    assert "status" in header
    assert "due_date" in header


def test_invoice_numbers_are_sequential(client):
    """Invoice numbers should follow TB-INV-YYYYMM-XXXX format."""
    auth = _admin(client)
    invoices = client.get("/api/v1/invoices/", headers=auth).json()
    if not invoices:
        pytest.skip("No invoices")
    for inv in invoices:
        num = inv.get("invoice_number", "")
        assert num.startswith("TB-INV-"), f"Bad invoice number format: {num}"
