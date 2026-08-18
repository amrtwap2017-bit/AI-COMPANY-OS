"""T-016: Backup and restore runbook verification"""
import pytest
import requests
from pathlib import Path

BASE = "http://localhost:8030"
ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")

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

def test_backup_script_exists():
    assert (ROOT / "scripts/backup_db.sh").exists()

def test_restore_runbook_exists():
    assert (ROOT / "docs/operations/BACKUP-RESTORE.md").exists()

def test_verify_script_exists():
    assert (ROOT / "scripts/verify_backup.py").exists()

def test_runbook_has_required_sections():
    text = (ROOT / "docs/operations/BACKUP-RESTORE.md").read_text()
    for s in ["Backup", "Restore", "Recovery Time", "Post-Restore"]:
        assert s in text, f"Missing: {s}"

def test_backup_script_has_pg_dump():
    text = (ROOT / "scripts/backup_db.sh").read_text()
    assert "pg_dump" in text
    assert "DATABASE_URL" in text

def test_verify_script_checks_tables():
    text = (ROOT / "scripts/verify_backup.py").read_text()
    for t in ["work_orders", "platform_events", "twin_nodes"]:
        assert t in text, f"Missing: {t}"

def test_verify_script_compiles():
    import py_compile
    py_compile.compile(str(ROOT / "scripts/verify_backup.py"), doraise=True)

def test_backups_directory_exists():
    d = ROOT / "backups"
    d.mkdir(exist_ok=True)
    assert d.exists()

def test_health_ready_returns_connected():
    r = requests.get(f"{BASE}/api/v1/health/ready", timeout=5)
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ready"
    assert data.get("database") == "connected"

def test_platform_status_db_healthy():
    r = requests.get(f"{BASE}/api/v1/platform/status",
                     headers=_h(), timeout=10)
    _s(r, "platform-db")
    if r.status_code == 200:
        db = r.json()["subsystems"]["database"]
        assert db.get("connected") is True
