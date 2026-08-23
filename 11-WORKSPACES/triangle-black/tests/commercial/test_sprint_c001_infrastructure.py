"""
Sprint C-001: CI/CD Infrastructure Verification Test
"""
import pytest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

def test_ci_workflow_exists():
    ci_path = PROJECT_ROOT / ".github" / "workflows" / "ci.yml"
    assert ci_path.exists(), "GitHub Actions CI workflow missing"
    text = ci_path.read_text()
    assert "pytest" in text, "CI workflow must include pytest step"
    assert "py_compile" in text, "CI workflow must include compile check"

def test_staging_compose_exists():
    staging_path = PROJECT_ROOT / "docker-compose.staging.yml"
    assert staging_path.exists(), "Staging docker-compose missing"
    text = staging_path.read_text()
    assert "postgres" in text, "Staging must include PostgreSQL"
    assert "redis" in text, "Staging must include Redis"

def test_backup_script_exists():
    backup_path = PROJECT_ROOT / "scripts" / "backup_db.py"
    assert backup_path.exists(), "Database backup script missing"

def test_release_docs_complete():
    release_dir = PROJECT_ROOT / "docs" / "release"
    required = [
        "RELEASE-PROCESS.md",
        "RELEASE-CHECKLIST.md",
        "ROLLBACK.md",
        "DATABASE-MIGRATION-POLICY.md",
        "DISASTER-RECOVERY.md",
        "INCIDENT-RESPONSE.md",
        "CHANGE-MANAGEMENT.md",
        "CI-CD-GUIDE.md"
    ]
    for doc in required:
        assert (release_dir / doc).exists(), f"Missing: {doc}"
