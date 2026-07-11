import uuid
import pytest
from datetime import datetime
from src.core.auth import require_manager
from src.commercial.invoices.schemas import InvoiceCreate
from src.commercial.invoices.repository import InvoiceRepository

TEST_PREFIX = "TEST-PYTEST"

@pytest.fixture(scope="module")
def test_invoice_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    invoice_data = {
        "hotel_id": "1",
        "invoice_number": f"{TEST_PREFIX}-INV-{unique}",
        "total_amount": 1000.0,
        "status": "draft",
        "due_date": datetime.now() + timedelta(days=30),
    }
    res = client.post(
        "/api/v1/invoices/",
        json=invoice_data,
        headers=auth,
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    invoice_id = res.json()["id"]
    yield invoice_id
    client.delete(f"/api/v1/invoices/{invoice_id}", headers=auth)

def test_create_invoice(client, auth):
    unique = str(uuid.uuid4())[:8]
    invoice_data = {
        "hotel_id": "1",
        "invoice_number": f"{TEST_PREFIX}-INV-{unique}",
        "total_amount": 1000.0,
        "status": "draft",
        "due_date": datetime.now() + timedelta(days=30),
    }
    res = client.post(
        "/api/v1/invoices/",
        json=invoice_data,
        headers=auth,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["hotel_id"] == invoice_data["hotel_id"]
    assert data["total_amount"] == invoice_data["total_amount"]
    assert data["status"] == invoice_data["status"]
    assert data["due_date"] == invoice_data["due_date"]

def test_get_invoice(client, auth, test_invoice_id):
    res = client.get(
        f"/api/v1/invoices/{test_invoice_id}",
        headers=auth,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == test_invoice_id

def test_update_invoice(client, auth, test_invoice_id):
    update_data = {
        "status": "sent",
    }
    res = client.put(
        f"/api/v1/invoices/{test_invoice_id}",
        json=update_data,
        headers=auth,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == update_data["status"]

def test_delete_invoice(client, auth, test_invoice_id):
    res = client.delete(
        f"/api/v1/invoices/{test_invoice_id}",
        headers=auth,
    )
    assert res.status_code == 204