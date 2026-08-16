"""Sprint-212: Purchase Order and Service Request schema validation tests"""
import pytest
from pydantic import ValidationError

# ── PURCHASE ORDER TESTS ──────────────────────────────────────────────────────
def test_po_create_valid():
    from src.commercial.purchase_orders.schemas import PurchaseOrderCreate
    po = PurchaseOrderCreate(vendor_id="vendor-001", total_amount=50000.0, subtotal=43103.0, vat_amount=6897.0)
    assert po.vendor_id == "vendor-001"
    assert po.total_amount == 50000.0
    assert po.subtotal == 43103.0

def test_po_create_rejects_blank_vendor():
    from src.commercial.purchase_orders.schemas import PurchaseOrderCreate
    with pytest.raises(ValidationError):
        PurchaseOrderCreate(vendor_id="   ", total_amount=1000.0)

def test_po_create_rejects_negative_amount():
    from src.commercial.purchase_orders.schemas import PurchaseOrderCreate
    with pytest.raises(ValidationError):
        PurchaseOrderCreate(vendor_id="v1", total_amount=-1000.0)

def test_po_create_rounds_amounts():
    from src.commercial.purchase_orders.schemas import PurchaseOrderCreate
    po = PurchaseOrderCreate(vendor_id="v1", subtotal=100.555)
    assert po.subtotal == 100.56

def test_po_create_default_empty_lines():
    from src.commercial.purchase_orders.schemas import PurchaseOrderCreate
    po = PurchaseOrderCreate(vendor_id="v1")
    assert po.lines == []

def test_po_update_rejects_invalid_status():
    from src.commercial.purchase_orders.schemas import PurchaseOrderUpdate
    with pytest.raises(ValidationError) as exc:
        PurchaseOrderUpdate(status="completed")
    assert "status" in str(exc.value).lower()

def test_po_update_accepts_valid_status():
    from src.commercial.purchase_orders.schemas import PurchaseOrderUpdate
    upd = PurchaseOrderUpdate(status="APPROVED")
    assert upd.status == "approved"

def test_po_update_allows_partial():
    from src.commercial.purchase_orders.schemas import PurchaseOrderUpdate
    upd = PurchaseOrderUpdate(status="sent")
    assert upd.status == "sent"
    assert upd.vendor_id is None

def test_po_response_accepts_none_fields():
    from src.commercial.purchase_orders.schemas import PurchaseOrderResponse
    resp = PurchaseOrderResponse()
    assert resp.vendor_id is None
    assert resp.total_amount is None

def test_valid_po_statuses_set():
    from src.commercial.purchase_orders.schemas import VALID_PO_STATUSES
    assert "draft" in VALID_PO_STATUSES
    assert "approved" in VALID_PO_STATUSES
    assert "received" in VALID_PO_STATUSES
    assert "cancelled" in VALID_PO_STATUSES

# ── SERVICE REQUEST TESTS ─────────────────────────────────────────────────────
def test_sr_create_valid():
    from src.commercial.service_requests.schemas import ServiceRequestCreate
    sr = ServiceRequestCreate(title="AC Unit Fault Tower B", category="HVAC", urgency="high")
    assert sr.title == "AC Unit Fault Tower B"
    assert sr.urgency == "high"
    assert sr.category == "HVAC"

def test_sr_create_normalises_urgency():
    from src.commercial.service_requests.schemas import ServiceRequestCreate
    sr = ServiceRequestCreate(title="Test Request", urgency="HIGH")
    assert sr.urgency == "high"

def test_sr_create_rejects_invalid_urgency():
    from src.commercial.service_requests.schemas import ServiceRequestCreate
    with pytest.raises(ValidationError) as exc:
        ServiceRequestCreate(title="Test", urgency="asap")
    assert "urgency" in str(exc.value).lower()

def test_sr_create_rejects_short_title():
    from src.commercial.service_requests.schemas import ServiceRequestCreate
    with pytest.raises(ValidationError):
        ServiceRequestCreate(title="AB")

def test_sr_create_rejects_blank_title():
    from src.commercial.service_requests.schemas import ServiceRequestCreate
    with pytest.raises(ValidationError):
        ServiceRequestCreate(title="   ")

def test_sr_update_rejects_invalid_status():
    from src.commercial.service_requests.schemas import ServiceRequestUpdate
    with pytest.raises(ValidationError) as exc:
        ServiceRequestUpdate(status="done")
    assert "status" in str(exc.value).lower()

def test_sr_update_accepts_valid_status():
    from src.commercial.service_requests.schemas import ServiceRequestUpdate
    upd = ServiceRequestUpdate(status="IN_PROGRESS")
    assert upd.status == "in_progress"

def test_sr_update_allows_partial():
    from src.commercial.service_requests.schemas import ServiceRequestUpdate
    upd = ServiceRequestUpdate(status="resolved", resolution_notes="Fixed HVAC filter")
    assert upd.status == "resolved"
    assert upd.title is None

def test_sr_response_accepts_none_fields():
    from src.commercial.service_requests.schemas import ServiceRequestResponse
    resp = ServiceRequestResponse()
    assert resp.title is None
    assert resp.urgency is None

def test_valid_sr_urgencies():
    from src.commercial.service_requests.schemas import VALID_SR_URGENCIES
    assert "emergency" in VALID_SR_URGENCIES
    assert "critical" in VALID_SR_URGENCIES
    assert "normal" in VALID_SR_URGENCIES
    assert "low" in VALID_SR_URGENCIES
