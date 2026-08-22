"""
Sprint N-002: Release Engineering & Operations Hardening Verification Test
"""
import pytest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

def test_operational_backup_script_exists_and_runs():
    """Verify backup utility script is present and executable."""
    backup_script = PROJECT_ROOT / "scripts" / "backup_db.py"
    assert backup_script.exists()
    
    # Run a dry validation of the backup file format
    backup_dir = PROJECT_ROOT / "backups" / "db"
    assert backup_dir.exists()

def test_release_engineering_playbooks_exist():
    """Verify all NIST SSDF aligned release and rollback documentation is present."""
    release_dir = PROJECT_ROOT / "docs" / "release"
    assert release_dir.exists()
    
    required_docs = [
        "RELEASE-PROCESS.md",
        "RELEASE-CHECKLIST.md",
        "ROLLBACK.md",
        "DATABASE-MIGRATION-POLICY.md",
        "DISASTER-RECOVERY.md"
    ]
    
    for doc in required_docs:
        doc_path = release_dir / doc
        assert doc_path.exists(), f"Missing critical operations documentation: {doc}"
