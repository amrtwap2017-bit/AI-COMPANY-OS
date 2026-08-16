"""Sprint-230: Workflow engine foundation tests"""
import pytest
from pathlib import Path

SRC = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/commercial/workflow_engine")

# ── Module structure tests ─────────────────────────────────────────────────────
def test_workflow_engine_models_exist():
    assert (SRC / "models.py").exists()

def test_workflow_engine_engine_exists():
    assert (SRC / "engine.py").exists()

def test_workflow_engine_importable():
    from src.commercial.workflow_engine import TriangleWorkflowEngine
    assert callable(TriangleWorkflowEngine)

def test_workflow_engine_has_three_models():
    from src.commercial.workflow_engine.models import (
        WorkflowDefinition, WorkflowInstance, WorkflowTransition
    )
    assert WorkflowDefinition.__tablename__ == "workflow_definitions"
    assert WorkflowInstance.__tablename__ == "workflow_instances"
    assert WorkflowTransition.__tablename__ == "workflow_transitions"

# ── Built-in transition map tests ──────────────────────────────────────────────
def test_wo_engine_valid_transition():
    from src.commercial.workflow_engine.engine import TriangleWorkflowEngine
    e = TriangleWorkflowEngine(entity_type="work_order")
    ok, msg = e.can_transition("open", "assigned")
    assert ok is True
    assert msg == "ok"

def test_wo_engine_invalid_transition():
    from src.commercial.workflow_engine.engine import TriangleWorkflowEngine
    e = TriangleWorkflowEngine(entity_type="work_order")
    ok, msg = e.can_transition("open", "closed")
    assert ok is False
    assert "not allowed" in msg.lower() or "allowed" in msg.lower()

def test_wo_engine_terminal_state_has_no_transitions():
    from src.commercial.workflow_engine.engine import TriangleWorkflowEngine
    e = TriangleWorkflowEngine(entity_type="work_order")
    ok, msg = e.can_transition("closed", "open")
    assert ok is False

def test_wo_engine_get_allowed_transitions():
    from src.commercial.workflow_engine.engine import TriangleWorkflowEngine
    e = TriangleWorkflowEngine(entity_type="work_order")
    allowed = e.get_allowed_transitions("open")
    assert "assigned" in allowed
    assert "cancelled" in allowed

def test_sr_engine_valid_transition():
    from src.commercial.workflow_engine.engine import TriangleWorkflowEngine
    e = TriangleWorkflowEngine(entity_type="service_request")
    ok, msg = e.can_transition("open", "in_progress")
    assert ok is True

def test_sr_engine_convert_transition():
    from src.commercial.workflow_engine.engine import TriangleWorkflowEngine
    e = TriangleWorkflowEngine(entity_type="service_request")
    ok, _ = e.can_transition("open", "converted")
    assert ok is True

def test_custom_definition_json():
    from src.commercial.workflow_engine.engine import TriangleWorkflowEngine
    import json
    custom = json.dumps({"states": {"draft": ["active", "cancelled"], "active": ["closed"]}})
    e = TriangleWorkflowEngine(definition_json=custom)
    ok, _ = e.can_transition("draft", "active")
    assert ok is True
    ok2, _ = e.can_transition("draft", "closed")
    assert ok2 is False

def test_engine_safe_with_unknown_state():
    from src.commercial.workflow_engine.engine import TriangleWorkflowEngine
    e = TriangleWorkflowEngine(entity_type="work_order")
    ok, msg = e.can_transition("nonexistent_state", "open")
    assert ok is False

def test_builtin_definitions_cover_both_entity_types():
    from src.commercial.workflow_engine.engine import BUILTIN_DEFINITIONS
    assert "work_order" in BUILTIN_DEFINITIONS
    assert "service_request" in BUILTIN_DEFINITIONS

def test_workflow_tables_exist_in_db():
    from src.core.database import engine
    from sqlalchemy import inspect
    insp = inspect(engine)
    tables = insp.get_table_names()
    assert "workflow_definitions" in tables, "workflow_definitions table missing"
    assert "workflow_instances" in tables, "workflow_instances table missing"
    assert "workflow_transitions" in tables, "workflow_transitions table missing"
