"""SPRINT-010: Dual theme system — Obsidian Command + Ivory Operations"""
from pathlib import Path

ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
CSS  = ROOT / "portal/app/globals.css"
HOOKS = ROOT / "portal/lib/hooks"

def test_use_theme_hook_exists():
    assert (HOOKS / "useTheme.ts").exists()

def test_use_theme_hook_has_both_themes():
    text = (HOOKS / "useTheme.ts").read_text()
    assert "obsidian" in text
    assert "ivory" in text

def test_use_theme_hook_has_toggle():
    text = (HOOKS / "useTheme.ts").read_text()
    assert "toggleTheme" in text

def test_use_theme_hook_has_local_storage():
    text = (HOOKS / "useTheme.ts").read_text()
    assert "localStorage" in text

def test_use_theme_hook_applies_data_theme():
    text = (HOOKS / "useTheme.ts").read_text()
    assert "data-theme" in text

def test_globals_css_has_obsidian_theme():
    text = CSS.read_text()
    assert 'data-theme="obsidian"' in text

def test_globals_css_has_ivory_theme():
    text = CSS.read_text()
    assert 'data-theme="ivory"' in text

def test_globals_css_obsidian_has_dark_bg():
    text = CSS.read_text()
    obsidian_section = text[text.find('data-theme="obsidian"'):]
    obsidian_block = obsidian_section[:obsidian_section.find('}') + 500]
    assert "#111111" in obsidian_block

def test_globals_css_ivory_has_light_bg():
    text = CSS.read_text()
    ivory_section = text[text.find('data-theme="ivory"'):]
    ivory_block = ivory_section[:ivory_section.find('}') + 500]
    assert "#F4F4F2" in ivory_block

def test_globals_css_sidebar_graphite_in_both():
    text = CSS.read_text()
    # Both themes should have #1C1C1E or similar graphite for sidebar
    assert "#1C1C1E" in text

def test_platform_config_has_both_themes():
    text = (ROOT / "portal/lib/platform-config.ts").read_text()
    assert "obsidian" in text
    assert "ivory" in text

def test_dual_theme_doc_exists():
    assert (ROOT / "docs/design-system-v2/01-DESIGN-DIRECTION.md").exists()
