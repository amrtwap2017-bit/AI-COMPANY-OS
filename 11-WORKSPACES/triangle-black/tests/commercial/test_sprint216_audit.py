"""Sprint-216: Audit helper tests"""
import pytest

def test_audit_module_importable():
    from src.core.audit import audit_create, audit_update, audit_action, audit_delete
    assert callable(audit_create)
    assert callable(audit_update)
    assert callable(audit_action)
    assert callable(audit_delete)

def test_safe_json_handles_dict():
    from src.core.audit import _safe_json
    result = _safe_json({"key": "value", "num": 42})
    import json
    parsed = json.loads(result)
    assert parsed["key"] == "value"
    assert parsed["num"] == 42

def test_safe_json_handles_none():
    from src.core.audit import _safe_json
    assert _safe_json(None) is None

def test_safe_json_handles_string():
    from src.core.audit import _safe_json
    assert _safe_json("raw string") == "raw string"

def test_safe_json_handles_list():
    from src.core.audit import _safe_json
    import json
    result = _safe_json([1, 2, 3])
    assert json.loads(result) == [1, 2, 3]

def test_audit_create_is_safe_without_db():
    from src.core.audit import audit_create
    audit_create(
        db=None,
        entity_type="work_order",
        entity_id="wo-test-001",
        hotel_id="hotel-001",
        actor_id="user-001",
        metadata={"title": "Test WO"}
    )
    # Should not raise even with None db

def test_audit_update_is_safe_without_db():
    from src.core.audit import audit_update
    audit_update(
        db=None,
        entity_type="lead",
        entity_id="lead-001",
        hotel_id="hotel-001",
        old_value={"status": "new"},
        new_value={"status": "qualified"}
    )

def test_audit_action_is_safe_without_db():
    from src.core.audit import audit_action
    audit_action(
        db=None,
        entity_type="contract",
        entity_id="contract-001",
        action="ACTIVATE",
        hotel_id="hotel-001",
    )

def test_audit_delete_is_safe_without_db():
    from src.core.audit import audit_delete
    audit_delete(
        db=None,
        entity_type="asset",
        entity_id="asset-001",
        hotel_id="hotel-001",
    )

def test_audit_action_uppercases_action():
    from src.core.audit import audit_action
    audit_action(
        db=None,
        entity_type="work_order",
        entity_id="wo-001",
        action="complete",
    )
