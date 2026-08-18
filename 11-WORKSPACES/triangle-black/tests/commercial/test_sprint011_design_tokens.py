"""SPRINT-011: Component design token migration"""
from pathlib import Path

ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
UI   = ROOT / "portal/components/ui"
CSS  = ROOT / "portal/app/globals.css"

def test_button_no_hardcoded_amber():
    text = (UI / "Button.tsx").read_text()
    assert "bg-amber" not in text, "Button still has bg-amber"

def test_button_no_hardcoded_slate():
    text = (UI / "Button.tsx").read_text()
    assert "text-slate" not in text, "Button still has text-slate"

def test_button_no_hardcoded_emerald():
    text = (UI / "Button.tsx").read_text()
    assert "bg-emerald" not in text, "Button still has bg-emerald"

def test_button_uses_action_primary_token():
    text = (UI / "Button.tsx").read_text()
    assert "color-action-primary" in text, "Button should use --color-action-primary"

def test_button_uses_action_danger_token():
    text = (UI / "Button.tsx").read_text()
    assert "color-action-danger" in text, "Button should use --color-action-danger"

def test_button_has_focus_visible():
    text = (UI / "Button.tsx").read_text()
    assert "focus-visible" in text, "Button needs focus-visible state"

def test_kpicard_no_hardcoded_blue():
    text = (UI / "KpiCard.tsx").read_text()
    assert "text-blue-500" not in text

def test_kpicard_no_hardcoded_emerald():
    text = (UI / "KpiCard.tsx").read_text()
    assert "text-emerald-500" not in text

def test_kpicard_uses_kpi_tokens():
    text = (UI / "KpiCard.tsx").read_text()
    assert "color-kpi-blue" in text or "color-kpi" in text

def test_statusbadge_no_hardcoded_purple():
    text = (UI / "StatusBadge.tsx").read_text()
    assert "bg-purple-50" not in text

def test_statusbadge_no_hardcoded_orange():
    text = (UI / "StatusBadge.tsx").read_text()
    assert "bg-orange-100" not in text

def test_css_has_action_tokens():
    text = CSS.read_text()
    assert "--color-action-primary" in text
    assert "--color-action-danger" in text

def test_css_has_kpi_tokens():
    text = CSS.read_text()
    assert "--color-kpi-blue" in text

def test_css_has_extended_status_tokens():
    text = CSS.read_text()
    assert "--color-purple-bg" in text
    assert "--color-orange-bg" in text
