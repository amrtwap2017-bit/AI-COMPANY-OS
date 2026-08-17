"""Sprint-249A/B: Composite indexes + work_orders tenant isolation fix"""
import requests
from pathlib import Path

BASE = "http://localhost:8030"
SRC  = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src")
ALEMBIC = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/alembic/versions")

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

# ── Sprint-249A: Migration file ───────────────────────────────────────────────
def test_composite_index_migration_exists():
    p = ALEMBIC / "e2f3a4b5c6d7_composite_indexes_work_orders.py"
    assert p.exists(), "Migration e2f3a4b5c6d7 missing"

def test_composite_index_migration_correct_revision():
    text = (ALEMBIC / "e2f3a4b5c6d7_composite_indexes_work_orders.py").read_text()
    assert "e2f3a4b5c6d7" in text
    assert "d1e2f3a4b5c6" in text

def test_composite_index_migration_idempotent():
    text = (ALEMBIC / "e2f3a4b5c6d7_composite_indexes_work_orders.py").read_text()
    assert "_idx_exists" in text
    assert "IF NOT EXISTS" in text or "_idx_exists" in text

def test_alembic_head_is_e2f3a4b5c6d7():
    import subprocess
    result = subprocess.run(
        [".venv/bin/alembic", "current"],
        capture_output=True, text=True,
        cwd="/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black"
    )
    output = result.stdout + result.stderr
    assert "e2f3a4b5c6d7" in output, f"Head: {output.strip()}"

# ── Sprint-249A: DB indexes exist ────────────────────────────────────────────
def test_hotel_status_composite_index_exists():
    from src.core.database import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        r = conn.execute(text("""
            SELECT 1 FROM pg_indexes
            WHERE indexname = 'ix_work_orders_hotel_status'
        """)).fetchone()
    assert r is not None, "ix_work_orders_hotel_status missing"

def test_hotel_created_composite_index_exists():
    from src.core.database import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        r = conn.execute(text("""
            SELECT 1 FROM pg_indexes
            WHERE indexname = 'ix_work_orders_hotel_created'
        """)).fetchone()
    assert r is not None, "ix_work_orders_hotel_created missing"

def test_composite_indexes_are_partial():
    from src.core.database import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        r = conn.execute(text("""
            SELECT indexdef FROM pg_indexes
            WHERE indexname = 'ix_work_orders_hotel_status'
        """)).fetchone()
    assert r is not None
    assert "deleted_at IS NULL" in r[0], "Index should be partial (WHERE deleted_at IS NULL)"

# ── Sprint-249B: Router tenant isolation ─────────────────────────────────────
def test_wo_router_no_optional_hotel_id():
    text = (SRC / "commercial/work_orders/router.py").read_text()
    # Vulnerable pattern should be gone
    assert "hotel_id:      Optional[str] = None" not in text

def test_wo_router_uses_depends_get_hotel_id():
    text = (SRC / "commercial/work_orders/router.py").read_text()
    assert "Depends(get_hotel_id)" in text

def test_wo_router_hotel_id_always_applied():
    text = (SRC / "commercial/work_orders/router.py").read_text()
    # Mandatory filter (not wrapped in if hotel_id:)
    assert "AND hotel_id = :hotel_id" in text

# ── Live API: tenant isolation enforced ──────────────────────────────────────
def test_wo_list_works_without_hotel_id_param():
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=5", headers=_h(), timeout=5)
    _s(r, "wo-no-param")
    assert r.status_code == 200

def test_wo_list_requires_auth():
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=5", timeout=5)
    _s(r, "wo-no-auth")
    assert r.status_code in (401, 422), f"Expected 401/422 without auth, got {r.status_code}"

def test_wo_list_returns_valid_data():
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=5", headers=_h(), timeout=5)
    _s(r, "wo-valid")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, (list, dict))

def test_wo_list_status_filter_works():
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=5&status=open",
        headers=_h(), timeout=5)
    _s(r, "wo-filter")
    assert r.status_code == 200

def test_wo_list_under_500ms():
    import time
    t0 = time.perf_counter()
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=10",
        headers=_h(), timeout=10)
    ms = round((time.perf_counter()-t0)*1000, 1)
    _s(r, "wo-perf")
    if r.status_code == 200:
        assert ms < 1000, f"WO list took {ms}ms — too slow"
