"""SPRINT-009: Design token system — Warm Enterprise direction"""
from pathlib import Path

ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
DS   = ROOT / "docs/design-system-v2"
CSS  = ROOT / "portal/app/globals.css"

def test_design_system_directory_exists():
    assert DS.exists()

def test_design_direction_doc_exists():
    assert (DS / "01-DESIGN-DIRECTION.md").exists()

def test_design_tokens_doc_exists():
    assert (DS / "02-DESIGN-TOKENS.md").exists()

def test_color_system_doc_exists():
    assert (DS / "03-COLOR-SYSTEM.md").exists()

def test_migration_plan_doc_exists():
    assert (DS / "16-DESIGN-MIGRATION-PLAN.md").exists()

def test_globals_css_uses_light_neutral_background():
    text = CSS.read_text()
    assert "#F4F4F2" in text, "Background should be refined warm neutral"

def test_globals_css_sidebar_is_graphite_not_espresso():
    text = CSS.read_text()
    assert "#1C1C1E" in text, "Sidebar should be neutral graphite"
    assert "#0F0D0B" not in text, "Old espresso brown sidebar should be gone"

def test_globals_css_text_is_deep_charcoal():
    text = CSS.read_text()
    assert "#111111" in text, "Primary text should be deep charcoal"
    # #221D1A should be mostly removed — allow 0 occurrences
    remaining = text.count("#221D1A")
    assert remaining == 0, f"Old warm near-black #221D1A still present {remaining} times"

def test_globals_css_sidebar_hover_is_neutral():
    text = CSS.read_text()
    assert "rgba(255,255,255,0.06)" in text, "Sidebar hover should be neutral white"

def test_globals_css_no_espresso_backgrounds():
    text = CSS.read_text()
    # #181614 is allowed in dark mode section and avatar gradients
    # Count occurrences — should only be in dark mode context
    count = text.count("#181614")
    assert count <= 3, f"Too many #181614 occurrences: {count} — check light mode context"

def test_design_direction_has_key_principles():
    text = (DS / "01-DESIGN-DIRECTION.md").read_text()
    for principle in ["LIGHT-FIRST", "BRONZE", "OPERATIONAL"]:
        assert principle in text

def test_color_system_has_semantic_status():
    text = (DS / "03-COLOR-SYSTEM.md").read_text()
    for status in ["SUCCESS", "WARNING", "ERROR", "INFO"]:
        assert status in text

def test_migration_plan_has_rollback():
    text = (DS / "16-DESIGN-MIGRATION-PLAN.md").read_text()
    assert "Rollback" in text
    assert "git revert" in text.lower() or "Git revert" in text
