"""Sprint-213: Inventory Items and Goods Receipt schema validation tests"""
import pytest
from pydantic import ValidationError

# ── INVENTORY ITEM TESTS ──────────────────────────────────────────────────────
def test_inv_item_create_valid():
    from src.commercial.inventory_items.schemas import InventoryItemCreate
    item = InventoryItemCreate(item_code="HVAC-F001", name="HVAC Filter 16x20", category="HVAC")
    assert item.item_code == "HVAC-F001"
    assert item.name == "HVAC Filter 16x20"
    assert item.unit_of_measure == "piece"
    assert item.item_type == "spare_part"

def test_inv_item_create_uppercases_item_code():
    from src.commercial.inventory_items.schemas import InventoryItemCreate
    item = InventoryItemCreate(item_code="hvac-f001", name="Test Item")
    assert item.item_code == "HVAC-F001"

def test_inv_item_create_rejects_blank_code():
    from src.commercial.inventory_items.schemas import InventoryItemCreate
    with pytest.raises(ValidationError):
        InventoryItemCreate(item_code="   ", name="Test")

def test_inv_item_create_rejects_short_name():
    from src.commercial.inventory_items.schemas import InventoryItemCreate
    with pytest.raises(ValidationError):
        InventoryItemCreate(item_code="CODE", name="A")

def test_inv_item_create_rejects_invalid_item_type():
    from src.commercial.inventory_items.schemas import InventoryItemCreate
    with pytest.raises(ValidationError) as exc:
        InventoryItemCreate(item_code="CODE", name="Test Item", item_type="gadget")
    assert "item_type" in str(exc.value).lower()

def test_inv_item_create_rejects_invalid_uom():
    from src.commercial.inventory_items.schemas import InventoryItemCreate
    with pytest.raises(ValidationError) as exc:
        InventoryItemCreate(item_code="CODE", name="Test", unit_of_measure="dozen")
    assert "unit_of_measure" in str(exc.value).lower()

def test_inv_item_create_rejects_negative_cost():
    from src.commercial.inventory_items.schemas import InventoryItemCreate
    with pytest.raises(ValidationError):
        InventoryItemCreate(item_code="CODE", name="Test", standard_cost=-100.0)

def test_inv_item_create_rejects_vat_over_100():
    from src.commercial.inventory_items.schemas import InventoryItemCreate
    with pytest.raises(ValidationError):
        InventoryItemCreate(item_code="CODE", name="Test", vat_pct=101.0)

def test_inv_item_create_normalises_uom():
    from src.commercial.inventory_items.schemas import InventoryItemCreate
    item = InventoryItemCreate(item_code="CODE", name="Test Item", unit_of_measure="PIECE")
    assert item.unit_of_measure == "piece"

def test_inv_item_create_normalises_item_type():
    from src.commercial.inventory_items.schemas import InventoryItemCreate
    item = InventoryItemCreate(item_code="CODE", name="Test Item", item_type="CONSUMABLE")
    assert item.item_type == "consumable"

def test_inv_item_update_allows_partial():
    from src.commercial.inventory_items.schemas import InventoryItemUpdate
    upd = InventoryItemUpdate(min_stock=10.0, max_stock=100.0)
    assert upd.min_stock == 10.0
    assert upd.name is None

def test_inv_item_response_accepts_none_fields():
    from src.commercial.inventory_items.schemas import InventoryItemResponse
    resp = InventoryItemResponse()
    assert resp.name is None
    assert resp.item_type is None

# ── GOODS RECEIPT TESTS ───────────────────────────────────────────────────────
def test_grn_create_valid():
    from src.commercial.goods_receipts.schemas import GoodsReceiptCreate
    grn = GoodsReceiptCreate(warehouse_id="wh-001", po_id="po-001")
    assert grn.warehouse_id == "wh-001"
    assert grn.po_id == "po-001"
    assert grn.lines == []

def test_grn_create_rejects_blank_warehouse():
    from src.commercial.goods_receipts.schemas import GoodsReceiptCreate
    with pytest.raises(ValidationError):
        GoodsReceiptCreate(warehouse_id="   ")

def test_grn_create_default_empty_lines():
    from src.commercial.goods_receipts.schemas import GoodsReceiptCreate
    grn = GoodsReceiptCreate(warehouse_id="wh-001")
    assert grn.lines == []

def test_grn_update_rejects_invalid_status():
    from src.commercial.goods_receipts.schemas import GoodsReceiptUpdate
    with pytest.raises(ValidationError) as exc:
        GoodsReceiptUpdate(status="received")
    assert "status" in str(exc.value).lower()

def test_grn_update_accepts_valid_status():
    from src.commercial.goods_receipts.schemas import GoodsReceiptUpdate
    upd = GoodsReceiptUpdate(status="APPROVED")
    assert upd.status == "approved"

def test_grn_update_allows_partial():
    from src.commercial.goods_receipts.schemas import GoodsReceiptUpdate
    upd = GoodsReceiptUpdate(status="complete")
    assert upd.status == "complete"
    assert upd.lines is None

def test_grn_response_accepts_none_fields():
    from src.commercial.goods_receipts.schemas import GoodsReceiptResponse
    resp = GoodsReceiptResponse()
    assert resp.grn_number is None
    assert resp.status is None

def test_valid_grn_statuses():
    from src.commercial.goods_receipts.schemas import VALID_GRN_STATUSES
    assert "draft" in VALID_GRN_STATUSES
    assert "approved" in VALID_GRN_STATUSES
    assert "complete" in VALID_GRN_STATUSES
    assert "rejected" in VALID_GRN_STATUSES
