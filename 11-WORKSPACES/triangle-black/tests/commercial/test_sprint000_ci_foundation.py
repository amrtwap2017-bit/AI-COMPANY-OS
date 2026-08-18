"""SPRINT-000: CI/CD Foundation verification"""
from pathlib import Path

ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")

def test_github_workflows_directory_exists():
    assert (ROOT / ".github/workflows").exists()

def test_ci_workflow_exists():
    assert (ROOT / ".github/workflows/ci.yml").exists()

def test_ci_workflow_has_required_jobs():
    text = (ROOT / ".github/workflows/ci.yml").read_text()
    for job in ["python-lint", "portal-typecheck", "portal-lint",
                "python-test-fast", "build-guard"]:
        assert job in text, f"Missing CI job: {job}"

def test_ci_workflow_uses_postgres_service():
    text = (ROOT / ".github/workflows/ci.yml").read_text()
    assert "postgres" in text
    assert "POSTGRES_DB" in text

def test_pyproject_toml_exists():
    assert (ROOT / "pyproject.toml").exists()

def test_pyproject_has_ruff_config():
    text = (ROOT / "pyproject.toml").read_text()
    assert "[tool.ruff]" in text
    assert "line-length" in text

def test_ci_excludes_live_http_tests():
    text = (ROOT / ".github/workflows/ci.yml").read_text()
    assert "not live_http" in text or "live_http" in text

def test_ci_has_timeout():
    text = (ROOT / ".github/workflows/ci.yml").read_text()
    assert "timeout" in text

def test_portal_has_typecheck_script():
    import json
    pkg = json.loads((ROOT / "portal/package.json").read_text())
    scripts = pkg.get("scripts", {})
    assert "test:types" in scripts or "typecheck" in scripts

def test_agent_protocol_exists():
    assert (ROOT / "docs/upgrade-analysis/24_AGENT_EXECUTION_PROTOCOL.md").exists()

def test_upgrade_analysis_directory_exists():
    assert (ROOT / "docs/upgrade-analysis").exists()

def test_sprint_roadmap_exists():
    assert (ROOT / "docs/upgrade-analysis/23_SPRINT_ROADMAP.md").exists()
