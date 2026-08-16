"""Sprint-214: Quotation and Warehouse schema validation tests"""
import pytest
from pydantic import ValidationError

# ── QUOTATION TESTS ───────────────────────────────────────────────────────────
def test_quote_create_valid():
    from src.commercial.quotation.schemas import QuoteCreate
    q = QuoteCreate(title="MEP Services Q3 2026", total=85000.0, status="draft")
    assert q.title == "MEP Services Q3 2026"
    assert q.total == 85000.0
    assert q.status == "draft"

def test_quote_create_normalises_status():
    from src.commercial.quotation.schemas import QuoteCreate
    q = QuoteCreate(title="Test Quote", status="SUBMITTED")
    assert q.status == "submitted"

def test_quote_create_rejects_invalid_status():
    from src.commercial.quotation.schemas import QuoteCreate
    with pytest.raises(ValidationError) as exc:
        QuoteCreate(title="Test", status="accepted")
    assert "status" in str(exc.value).lower()

def test_quote_create_rejects_short_title():
    from src.commercial.quotation.schemas import QuoteCreate
    with pytest.raises(ValidationError):
        QuoteCreate(title="AB")

def test_quote_create_rejects_negative_total():
    from src.commercial.quotation.schemas import QuoteCreate
    with pytest.raises(ValidationError):
        QuoteCreate(title="Test Quote", total=-1000.0)

def test_quote_create_rounds_total():
    from src.commercial.quotation.schemas import QuoteCreate
    q = QuoteCreate(title="Test Quote", total=85000.555)
    assert q.total == 85000.56

def test_quote_update_allows_partial():
    from src.commercial.quotation.schemas import QuoteUpdate
    upd = QuoteUpdate(status="approved")
    assert upd.status == "approved"
    assert upd.title is None

def test_quote_update_rejects_invalid_status():
    from src.commercial.quotation.schemas import QuoteUpdate
    with pytest.raises(ValidationError):
        QuoteUpdate(status="signed")

def test_quote_response_accepts_none_fields():
    from src.commercial.quotation.schemas import QuoteResponse
    resp = QuoteResponse()
    assert resp.title is None
    assert resp.total is None

def test_valid_quote_statuses():
    from src.commercial.quotation.schemas import VALID_QUOTE_STATUSES
    assert "draft" in VALID_QUOTE_STATUSES
    assert "approved" in VALID_QUOTE_STATUSES
    assert "rejected" in VALID_QUOTE_STATUSES
    assert "converted" in VALID_QUOTE_STATUSES

# ── WAREHOUSE TESTS ───────────────────────────────────────────────────────────
def test_warehouse_create_valid():
    from src.commercial.warehouses.schemas import WarehouseCreate
    wh = WarehouseCreate(code="WH-001", name="Main Warehouse", type="main")
    assert wh.code == "WH-001"
    assert wh.name == "Main Warehouse"
    assert wh.type == "main"

def test_warehouse_create_uppercases_code():
    from src.commercial.warehouses.schemas import WarehouseCreate
    wh = WarehouseCreate(code="wh-001", name="Test Warehouse")
    assert wh.code == "WH-001"

def test_warehouse_create_normalises_type():
    from src.commercial.warehouses.schemas import WarehouseCreate
    wh = WarehouseCreate(code="WH-002", name="Cold Room", type="COLD_STORAGE")
    assert wh.type == "cold_storage"

def test_warehouse_create_rejects_invalid_type():
    from src.commercial.warehouses.schemas import WarehouseCreate
    with pytest.raises(ValidationError) as exc:
        WarehouseCreate(code="WH-003", name="Test", type="outdoor")
    assert "type" in str(exc.value).lower()

def test_warehouse_create_rejects_blank_code():
    from src.commercial.warehouses.schemas import WarehouseCreate
    with pytest.raises(ValidationError):
        WarehouseCreate(code="   ", name="Test")

def test_warehouse_create_rejects_short_name():
    from src.commercial.warehouses.schemas import WarehouseCreate
    with pytest.raises(ValidationError):
        WarehouseCreate(code="WH-004", name="A")

def test_warehouse_update_allows_partial():
    from src.commercial.warehouses.schemas import WarehouseUpdate
    upd = WarehouseUpdate(type="satellite")
    assert upd.type == "satellite"
    assert upd.name is None

def test_warehouse_update_rejects_invalid_type():
    from src.commercial.warehouses.schemas import WarehouseUpdate
    with pytest.raises(ValidationError):
        WarehouseUpdate(type="underground")

def test_warehouse_response_accepts_none_fields():
    from src.commercial.warehouses.schemas import WarehouseResponse
    resp = WarehouseResponse()
    assert resp.name is None
    assert resp.code is None

def test_valid_warehouse_types():
    from src.commercial.warehouses.schemas import VALID_WAREHOUSE_TYPES
    assert "main" in VALID_WAREHOUSE_TYPES
    assert "satellite" in VALID_WAREHOUSE_TYPES
    assert "cold_storage" in VALID_WAREHOUSE_TYPES
