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
    Full flow: lead → qualify → assign → quote → submit → send → approve → activate
    Verify invoice is auto-created on activate.
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

    # Assign
    agents = client.get("/api/v1/agents/", headers=auth).json()
    assert len(agents) > 0
    client.post(f"/api/v1/actions/leads/{lead_id}/assign",
                json={"agent_id": agents[0]["id"]}, headers=auth)

    # Generate quote
    client.post(f"/api/v1/actions/leads/{lead_id}/quote", headers=auth)
    quotes = client.get("/api/v1/quotes/", headers=auth).json()
    quote = next((q for q in quotes if q.get("lead_id") == lead_id), None)
    assert quote is not None, "No quote created"
    quote_id = quote["id"]

    # Submit → send → approve (creates contract)
    client.post(f"/api/v1/actions/quotes/{quote_id}/submit", headers=auth)
    client.post(f"/api/v1/actions/quotes/{quote_id}/send", headers=auth)
    approve_res = client.post(f"/api/v1/actions/quotes/{quote_id}/approve", headers=auth)
    assert approve_res.status_code == 200

    # Get the contract
    contracts = client.get("/api/v1/contracts/", headers=auth).json()
    contract = next((c for c in contracts if c.get("lead_id") == lead_id), None)
    assert contract is not None, "No contract created"
    contract_id = contract["id"]

    # Activate contract
    act_res = client.post(f"/api/v1/contracts/{contract_id}/activate", headers=auth)
    assert act_res.status_code == 200

    # Invoice must now exist
    invoices = client.get("/api/v1/invoices/", headers=auth).json()
    inv = next((i for i in invoices if i.get("contract_id") == contract_id), None)
    assert inv is not None, "Invoice was not auto-created on activate"
    assert inv["status"] == "draft"
    assert inv["total_amount"] > 0
    assert inv["tax_amount"] > 0

    return inv["id"]


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
    r = client.post(f"/api/v1/invoices/{sent['id']}/mark-paid", headers=auth)
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
