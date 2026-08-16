"""Sprint-208: Contract and Invoice schema validation tests"""
import pytest
from pydantic import ValidationError
from datetime import datetime

# ── CONTRACT TESTS ────────────────────────────────────────────────────────────
def test_contract_create_valid():
    from src.commercial.contracts.schemas import ContractCreate
    c = ContractCreate(title="Hotel MEP Services 2026", total_value=120000.0)
    assert c.title == "Hotel MEP Services 2026"
    assert c.total_value == 120000.0
    assert c.status == "pending_signature"

def test_contract_create_normalises_status_case():
    from src.commercial.contracts.schemas import ContractCreate
    c = ContractCreate(title="Test Contract", status="ACTIVE")
    assert c.status == "active"

def test_contract_create_rejects_invalid_status():
    from src.commercial.contracts.schemas import ContractCreate
    with pytest.raises(ValidationError) as exc:
        ContractCreate(title="Test", status="signed")
    assert "status" in str(exc.value).lower()

def test_contract_create_rejects_short_title():
    from src.commercial.contracts.schemas import ContractCreate
    with pytest.raises(ValidationError):
        ContractCreate(title="AB")

def test_contract_create_rejects_negative_value():
    from src.commercial.contracts.schemas import ContractCreate
    with pytest.raises(ValidationError):
        ContractCreate(title="Test Contract", total_value=-1000.0)

def test_contract_create_rounds_value():
    from src.commercial.contracts.schemas import ContractCreate
    c = ContractCreate(title="Test Contract", total_value=1000.555)
    assert c.total_value == 1000.56

def test_contract_create_rejects_invalid_duration():
    from src.commercial.contracts.schemas import ContractCreate
    with pytest.raises(ValidationError):
        ContractCreate(title="Test Contract", duration_months=0)

def test_contract_update_allows_partial():
    from src.commercial.contracts.schemas import ContractUpdate
    upd = ContractUpdate(status="active")
    assert upd.status == "active"
    assert upd.title is None

def test_contract_update_rejects_invalid_status():
    from src.commercial.contracts.schemas import ContractUpdate
    with pytest.raises(ValidationError):
        ContractUpdate(status="terminated")

def test_contract_response_accepts_none_fields():
    from src.commercial.contracts.schemas import ContractResponse
    resp = ContractResponse()
    assert resp.title is None
    assert resp.total_value is None

# ── INVOICE TESTS ─────────────────────────────────────────────────────────────
def test_invoice_create_valid():
    from src.commercial.invoices.schemas import InvoiceCreate
    inv = InvoiceCreate(invoice_number="INV-2026-001", total_amount=50000.0)
    assert inv.invoice_number == "INV-2026-001"
    assert inv.total_amount == 50000.0
    assert inv.status == "pending"

def test_invoice_create_normalises_status_case():
    from src.commercial.invoices.schemas import InvoiceCreate
    inv = InvoiceCreate(invoice_number="INV-001", total_amount=1000.0, status="PAID")
    assert inv.status == "paid"

def test_invoice_create_rejects_invalid_status():
    from src.commercial.invoices.schemas import InvoiceCreate
    with pytest.raises(ValidationError) as exc:
        InvoiceCreate(invoice_number="INV-001", total_amount=1000.0, status="settled")
    assert "status" in str(exc.value).lower()

def test_invoice_create_rejects_negative_amount():
    from src.commercial.invoices.schemas import InvoiceCreate
    with pytest.raises(ValidationError):
        InvoiceCreate(invoice_number="INV-001", total_amount=-500.0)

def test_invoice_create_rounds_amount():
    from src.commercial.invoices.schemas import InvoiceCreate
    inv = InvoiceCreate(invoice_number="INV-001", total_amount=999.999)
    assert inv.total_amount == 1000.0

def test_invoice_create_rejects_blank_number():
    from src.commercial.invoices.schemas import InvoiceCreate
    with pytest.raises(ValidationError):
        InvoiceCreate(invoice_number="   ", total_amount=1000.0)

def test_invoice_update_allows_partial():
    from src.commercial.invoices.schemas import InvoiceUpdate
    upd = InvoiceUpdate(status="paid")
    assert upd.status == "paid"
    assert upd.total_amount is None

def test_invoice_update_rejects_invalid_status():
    from src.commercial.invoices.schemas import InvoiceUpdate
    with pytest.raises(ValidationError):
        InvoiceUpdate(status="written_off")

def test_invoice_response_accepts_none_fields():
    from src.commercial.invoices.schemas import InvoiceResponse
    resp = InvoiceResponse()
    assert resp.invoice_number is None
    assert resp.total_amount is None

def test_valid_invoice_statuses():
    from src.commercial.invoices.schemas import VALID_INVOICE_STATUSES
    assert "pending" in VALID_INVOICE_STATUSES
    assert "paid" in VALID_INVOICE_STATUSES
    assert "overdue" in VALID_INVOICE_STATUSES
    assert "cancelled" in VALID_INVOICE_STATUSES
