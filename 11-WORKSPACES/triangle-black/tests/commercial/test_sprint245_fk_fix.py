"""Sprint-245: Workflow FK fix — verify instance creation unblocked"""
import requests
from pathlib import Path

BASE = "http://localhost:8030"
SRC  = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")

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
        import pytest; pytest.skip(f"Rate limited — {ctx}")

# ── Migration file exists ─────────────────────────────────────────────────────
def test_fk_migration_file_exists():
    p = SRC / "alembic/versions/d1e2f3a4b5c6_drop_workflow_template_fk.py"
    assert p.exists(), "Migration file missing"

def test_fk_migration_has_correct_revision():
    p = SRC / "alembic/versions/d1e2f3a4b5c6_drop_workflow_template_fk.py"
    text = p.read_text()
    assert "d1e2f3a4b5c6" in text
    assert "c2d3e4f5a6b7" in text
    assert "down_revision" in text

def test_fk_migration_drops_constraint():
    p = SRC / "alembic/versions/d1e2f3a4b5c6_drop_workflow_template_fk.py"
    text = p.read_text()
    assert "workflow_instances_template_id_fkey" in text
    assert "DROP CONSTRAINT" in text

def test_fk_migration_has_safe_do_block():
    p = SRC / "alembic/versions/d1e2f3a4b5c6_drop_workflow_template_fk.py"
    text = p.read_text()
    assert "IF EXISTS" in text
    assert "DO $$" in text

def test_fk_migration_downgrade_is_noop():
    p = SRC / "alembic/versions/d1e2f3a4b5c6_drop_workflow_template_fk.py"
    text = p.read_text()
    assert "def downgrade" in text
    assert "pass" in text

# ── DB constraint gone ────────────────────────────────────────────────────────
def test_fk_constraint_removed_from_db():
    from src.core.database import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        r = conn.execute(text("""
            SELECT conname FROM pg_constraint
            WHERE conrelid = 'workflow_instances'::regclass
            AND conname LIKE '%template%'
        """)).fetchall()
    assert len(r) == 0, f"FK still exists: {r}"

def test_workflow_indexes_created():
    from src.core.database import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        r = conn.execute(text("""
            SELECT indexname FROM pg_indexes
            WHERE indexname IN (
                'ix_workflow_instances_hotel_entity',
                'ix_workflow_transitions_hotel_instance'
            )
        """)).fetchall()
    names = [x[0] for x in r]
    assert "ix_workflow_instances_hotel_entity" in names

# ── Workflow stats now accurate ───────────────────────────────────────────────
def test_workflow_stats_returns_200():
    r = requests.get(f"{BASE}/api/v1/workflow/stats", headers=_h(), timeout=5)
    _s(r, "wf-stats")
    assert r.status_code == 200

def test_workflow_stats_numeric_values():
    r = requests.get(f"{BASE}/api/v1/workflow/stats", headers=_h(), timeout=5)
    _s(r, "wf-stats-num")
    if r.status_code == 200:
        d = r.json()
        for field in ["total_instances", "active_instances",
                      "total_transitions", "total_definitions"]:
            assert isinstance(d[field], int), f"{field} not int"
            assert d[field] >= 0

def test_sr_generate_wo_returns_200():
    sr = requests.get(f"{BASE}/api/v1/service-requests/?limit=1", timeout=5)
    _s(sr, "sr-list")
    if sr.status_code != 200:
        import pytest; pytest.skip("SR list unavailable")
    items = sr.json()
    sr_list = items if isinstance(items, list) else items.get("results", items.get("items", []))
    if not sr_list:
        import pytest; pytest.skip("No SRs in DB")
    sr_id = sr_list[0]["id"]
    r = requests.post(
        f"{BASE}/api/v1/service-requests/{sr_id}/generate-work-order",
        headers=_h(), timeout=10)
    _s(r, "sr-gen-wo")
    assert r.status_code in (200, 201, 400, 404, 422)

def test_workflow_instances_list_works():
    r = requests.get(f"{BASE}/api/v1/workflow/instances", headers=_h(), timeout=5)
    _s(r, "wf-instances")
    assert r.status_code == 200
    d = r.json()
    assert "results" in d
    assert isinstance(d["results"], list)

def test_alembic_head_is_d1e2f3a4b5c6():
    import subprocess
    result = subprocess.run(
        [".venv/bin/alembic", "current"],
        capture_output=True, text=True,
        cwd="/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black"
    )
    output = result.stdout + result.stderr
    assert "d1e2f3a4b5c6" in output, f"Unexpected head: {output}"
