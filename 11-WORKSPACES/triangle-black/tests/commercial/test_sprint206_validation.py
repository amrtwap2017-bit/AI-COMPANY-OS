"""Sprint-206: API Input Validation Hardening tests"""
import pytest
from pydantic import ValidationError

def test_work_order_create_valid():
    from src.commercial.work_orders.schemas import WorkOrderCreate
    wo = WorkOrderCreate(title="Fix HVAC Unit A3", priority="high", status="open")
    assert wo.title == "Fix HVAC Unit A3"
    assert wo.priority == "high"

def test_work_order_create_normalises_priority_case():
    from src.commercial.work_orders.schemas import WorkOrderCreate
    wo = WorkOrderCreate(title="Test WO", priority="HIGH")
    assert wo.priority == "high"

def test_work_order_create_rejects_invalid_priority():
    from src.commercial.work_orders.schemas import WorkOrderCreate
    with pytest.raises(ValidationError) as exc:
        WorkOrderCreate(title="Test WO", priority="urgent")
    assert "priority" in str(exc.value).lower()

def test_work_order_create_rejects_invalid_status():
    from src.commercial.work_orders.schemas import WorkOrderCreate
    with pytest.raises(ValidationError) as exc:
        WorkOrderCreate(title="Test WO", status="done")
    assert "status" in str(exc.value).lower()

def test_work_order_create_rejects_short_title():
    from src.commercial.work_orders.schemas import WorkOrderCreate
    with pytest.raises(ValidationError) as exc:
        WorkOrderCreate(title="AB", priority="medium")
    assert "title" in str(exc.value).lower() or "min_length" in str(exc.value).lower()

def test_work_order_create_rejects_blank_title():
    from src.commercial.work_orders.schemas import WorkOrderCreate
    with pytest.raises(ValidationError):
        WorkOrderCreate(title="   ", priority="medium")

def test_work_order_create_rejects_title_too_long():
    from src.commercial.work_orders.schemas import WorkOrderCreate
    with pytest.raises(ValidationError):
        WorkOrderCreate(title="x" * 501, priority="low")

def test_work_order_create_accepts_valid_type():
    from src.commercial.work_orders.schemas import WorkOrderCreate
    wo = WorkOrderCreate(title="PM Check", priority="low", type="preventive")
    assert wo.type == "preventive"

def test_work_order_create_rejects_invalid_type():
    from src.commercial.work_orders.schemas import WorkOrderCreate
    with pytest.raises(ValidationError):
        WorkOrderCreate(title="PM Check", priority="low", type="magic")

def test_work_order_update_allows_partial():
    from src.commercial.work_orders.schemas import WorkOrderUpdate
    upd = WorkOrderUpdate(status="completed")
    assert upd.status == "completed"
    assert upd.title is None

def test_work_order_update_rejects_invalid_status():
    from src.commercial.work_orders.schemas import WorkOrderUpdate
    with pytest.raises(ValidationError):
        WorkOrderUpdate(status="finished")

def test_work_order_update_normalises_status_case():
    from src.commercial.work_orders.schemas import WorkOrderUpdate
    upd = WorkOrderUpdate(status="IN_PROGRESS")
    assert upd.status == "in_progress"

def test_work_order_response_accepts_none_fields():
    from src.commercial.work_orders.schemas import WorkOrderResponse
    resp = WorkOrderResponse()
    assert resp.title is None
    assert resp.status is None

def test_valid_priorities_set_is_correct():
    from src.commercial.work_orders.schemas import VALID_PRIORITIES
    assert "critical" in VALID_PRIORITIES
    assert "high" in VALID_PRIORITIES
    assert "medium" in VALID_PRIORITIES
    assert "low" in VALID_PRIORITIES

def test_valid_statuses_set_is_correct():
    from src.commercial.work_orders.schemas import VALID_STATUSES
    assert "open" in VALID_STATUSES
    assert "in_progress" in VALID_STATUSES
    assert "completed" in VALID_STATUSES
    assert "cancelled" in VALID_STATUSES
