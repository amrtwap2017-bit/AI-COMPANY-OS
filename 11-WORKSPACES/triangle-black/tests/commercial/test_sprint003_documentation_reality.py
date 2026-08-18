"""SPRINT-003: Documentation reality sync verification"""
from pathlib import Path

ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")

def test_readme_exists():
    assert (ROOT / "README.md").exists()

def test_readme_mentions_fastapi():
    text = (ROOT / "README.md").read_text()
    assert "FastAPI" in text

def test_readme_has_quick_start():
    text = (ROOT / "README.md").read_text()
    assert "Quick Start" in text

def test_readme_has_tech_stack():
    text = (ROOT / "README.md").read_text()
    assert "SQLAlchemy" in text

def test_readme_has_key_commands():
    text = (ROOT / "README.md").read_text()
    assert "START.sh" in text

def test_readme_mentions_architecture_pivot():
    text = (ROOT / "README.md").read_text()
    assert "NestJS" in text

def test_architecture_reality_doc_exists():
    assert (ROOT / "00-ARCHITECT/ARCHITECTURE_REALITY.md").exists()

def test_architecture_reality_has_comparison():
    text = (ROOT / "00-ARCHITECT/ARCHITECTURE_REALITY.md").read_text()
    assert "FastAPI" in text
    assert "NestJS" in text

def test_architecture_reality_mentions_debt():
    text = (ROOT / "00-ARCHITECT/ARCHITECTURE_REALITY.md").read_text()
    assert "main.py" in text
    assert "Debt" in text or "debt" in text

def test_upgrade_analysis_exists():
    assert (ROOT / "docs/upgrade-analysis/00_EXECUTIVE_SUMMARY.md").exists()

def test_enterprise_blueprint_v4_exists():
    bp = ROOT / "docs/enterprise-blueprint-v4"
    assert bp.exists()
    assert len(list(bp.glob("*.md"))) >= 5

def test_env_example_has_required_keys():
    text = (ROOT / ".env.example").read_text()
    assert "DATABASE_URL" in text
    assert "TB_SECRET_KEY" in text
