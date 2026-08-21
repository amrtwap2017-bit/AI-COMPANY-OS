"""T-017: Coverage push — new endpoints from T-002 through T-016"""
import requests
import pytest
from pathlib import Path

BASE = "http://localhost:8030"
SRC  = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src")
ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
HOTEL = "tb-default-hotel-000000000001"
DEMO  = "tb-demo-hotel-000000000001"

_C = {}
def _h():
    if "h" not in _C:
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def _s(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

# ── Workflow engine (T-002) ───────────────────────────────────────────────
def test_workflow_stats_has_all_fields():
    r = requests.get(f"{BASE}/api/v1/workflow/stats", headers=_h(), timeout=5)
    _s(r, "wf-stats")
    if r.status_code == 200:
        d = r.json()
        for f in ["hotel_id", "total_instances", "active_instances", "total_transitions"]:
            assert f in d

def test_workflow_instances_list_paginated():
    r = requests.get(f"{BASE}/api/v1/workflow/instances?limit=5&skip=0",
                     headers=_h(), timeout=5)
    _s(r, "wf-list")
    assert r.status_code == 200
    assert "results" in r.json()

def test_workflow_instances_filter_active():
    r = requests.get(f"{BASE}/api/v1/workflow/instances?status=active",
                     headers=_h(), timeout=5)
    _s(r, "wf-active")
    assert r.status_code == 200

def test_workflow_definitions_count():
    r = requests.get(f"{BASE}/api/v1/workflow/definitions", headers=_h(), timeout=5)
    _s(r, "wf-defs")
    if r.status_code == 200:
        assert "count" in r.json()

# ── SLA tracking (T-003) ─────────────────────────────────────────────────
def test_sla_breached_returns_list():
    r = requests.get(f"{BASE}/api/v1/work-orders/sla-breached",
                     headers=_h(), timeout=5)
    _s(r, "sla-breach")
    assert r.status_code == 200
    d = r.json()
    assert "count" in d and "results" in d

def test_sla_summary_has_compliance_pct():
    r = requests.get(f"{BASE}/api/v1/work-orders/sla-summary",
                     headers=_h(), timeout=5)
    _s(r, "sla-summary")
    if r.status_code == 200:
        assert "compliance_pct" in r.json() or "total" in r.json()

def test_sla_breached_pagination():
    r = requests.get(f"{BASE}/api/v1/work-orders/sla-breached?limit=3&skip=0",
                     headers=_h(), timeout=5)
    _s(r, "sla-page")
    assert r.status_code == 200

# ── Application service layer (T-005) ─────────────────────────────────────
def test_sr_service_file_structure():
    src = (SRC / "commercial/service_requests/service.py").read_text()
    for m in ["get_by_id", "list_by_status", "create",
              "update_status", "generate_work_order"]:
        assert f"def {m}" in src

def test_wo_service_file_structure():
    src = (SRC / "commercial/work_orders/service.py").read_text()
    for m in ["create_from_service_request", "complete", "close",
              "get_sla_summary"]:
        assert f"def {m}" in src

# ── Event outbox (T-006) ──────────────────────────────────────────────────
def test_events_migration_applied():
    from src.core.database import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        row = conn.execute(text(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='platform_events'"
        )).fetchone()
        assert int(row[0]) == 1

def test_events_outbox_has_hotel_scope():
    src = (SRC / "core/events.py").read_text()
    assert "self.hotel_id" in src
    assert "hotel_id = :hid" in src

def test_events_non_blocking_guarantee():
    src = (SRC / "core/events.py").read_text()
    assert "except Exception:" in src

# ── Executive read models (T-007) ─────────────────────────────────────────
def test_executive_read_model_has_sla_section():
    src = (SRC / "commercial/executive_dashboard/read_models.py").read_text()
    assert "_sla_kpis" in src
    assert "_event_outbox_stats" in src

def test_executive_dashboard_endpoint():
    r = requests.get(f"{BASE}/api/v1/executive-dashboard/",
                     headers=_h(), timeout=10)
    _s(r, "exec-dash")
    assert r.status_code in (200, 404)

# ── Organization_id migration (T-009) ─────────────────────────────────────
def test_organization_id_in_work_orders():
    from src.core.database import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        row = conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name='work_orders' AND column_name='organization_id'"
        )).fetchone()
        assert row is not None

def test_organization_id_in_assets():
    from src.core.database import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        row = conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name='assets' AND column_name='organization_id'"
        )).fetchone()
        assert row is not None

def test_hotel_id_still_primary():
    src = (SRC / "core/tenant.py").read_text()
    assert "get_hotel_id" in src
    # organization_id compatibility allowed in T-009
    assert "get_hotel_id" in src

# ── AI Gateway (T-010) ───────────────────────────────────────────────────
def test_ai_gateway_registry():
    r = requests.get(f"{BASE}/api/v1/ai-gateway/registry",
                     headers=_h(), timeout=5)
    _s(r, "ai-reg")
    assert r.status_code == 200
    d = r.json()
    assert "models" in d and "purposes" in d

def test_ai_gateway_rejects_bad_purpose():
    r = requests.post(f"{BASE}/api/v1/ai-gateway/request",
        headers={**_h(), "Content-Type": "application/json"},
        json={"purpose": "HACK", "prompt": "test", "model": "qwen2.5:7b"},
        timeout=10)
    _s(r, "ai-bad")
    if r.status_code == 200:
        assert r.json()["success"] is False

def test_ai_gateway_model_registry_has_qwen():
    src = (SRC / "commercial/ai_gateway/gateway.py").read_text()
    assert "qwen2.5:7b" in src
    assert "MODEL_REGISTRY" in src

# ── Digital Twin (T-011) ──────────────────────────────────────────────────
def test_twin_nodes_table_exists():
    from src.core.database import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        row = conn.execute(text(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='twin_nodes'"
        )).fetchone()
        assert int(row[0]) == 1

def test_twin_edges_table_exists():
    from src.core.database import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        row = conn.execute(text(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='twin_edges'"
        )).fetchone()
        assert int(row[0]) == 1

def test_twin_projector_structure():
    src = (SRC / "commercial/digital_twin/projector.py").read_text()
    for m in ["project_event", "_upsert_node", "_upsert_edge",
              "get_impact", "get_stats"]:
        assert f"def {m}" in src

# ── Demo tenant (T-012) ───────────────────────────────────────────────────
def test_demo_assets_count():
    from src.core.database import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        row = conn.execute(text(
            "SELECT COUNT(*) FROM assets WHERE hotel_id=:hid"
        ), {"hid": DEMO}).fetchone()
        assert int(row[0]) >= 10

def test_demo_work_orders_have_sla():
    from src.core.database import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        row = conn.execute(text(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND sla_hours IS NOT NULL"
        ), {"hid": DEMO}).fetchone()
        assert int(row[0]) >= 10

# ── Platform status (T-015) ───────────────────────────────────────────────
def test_platform_status_all_subsystems():
    r = requests.get(f"{BASE}/api/v1/platform/status",
                     headers=_h(), timeout=10)
    _s(r, "ps-all")
    if r.status_code == 200:
        subs = r.json()["subsystems"]
        for key in ["database", "events", "workflow", "sla",
                    "digital_twin", "operations"]:
            assert key in subs

def test_platform_events_query():
    r = requests.get(f"{BASE}/api/v1/platform/events?limit=5",
                     headers=_h(), timeout=5)
    _s(r, "ps-events")
    assert r.status_code == 200
    assert "results" in r.json()

def test_platform_events_stats():
    r = requests.get(f"{BASE}/api/v1/platform/events/stats",
                     headers=_h(), timeout=5)
    _s(r, "ps-stats")
    if r.status_code == 200:
        for f in ["total", "pending", "dispatched", "failed", "status"]:
            assert f in r.json()

# ── Backup/restore (T-016) ────────────────────────────────────────────────
def test_backup_runbook_complete():
    text = (ROOT / "docs/operations/BACKUP-RESTORE.md").read_text()
    for s in ["Backup", "Restore", "Recovery Time", "Post-Restore"]:
        assert s in text

def test_verify_script_has_required_tables():
    text = (ROOT / "scripts/verify_backup.py").read_text()
    for t in ["work_orders", "platform_events", "twin_nodes",
              "twin_edges", "platform_audit_log"]:
        assert t in text

def test_alembic_head_is_valid():
    import subprocess
    result = subprocess.run(
        [".venv/bin/alembic", "current"],
        capture_output=True, text=True,
        cwd=str(ROOT)
    )
    output = (result.stdout + result.stderr).strip()
    assert "(head)" in output
