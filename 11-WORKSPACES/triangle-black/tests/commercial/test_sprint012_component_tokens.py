"""SPRINT-012: Input + DataTable + Modal component token migration"""
from pathlib import Path

ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
UI   = ROOT / "portal/components/ui"

def test_input_no_hardcoded_slate():
    text = (UI / "Input.tsx").read_text()
    assert "text-slate" not in text
    assert "bg-slate" not in text

def test_input_no_hardcoded_stone():
    text = (UI / "Input.tsx").read_text()
    assert "border-stone" not in text
    assert "text-stone" not in text

def test_input_no_hardcoded_amber():
    text = (UI / "Input.tsx").read_text()
    assert "ring-amber" not in text
    assert "border-amber" not in text

def test_input_uses_semantic_tokens():
    text = (UI / "Input.tsx").read_text()
    assert "color-text-1" in text or "color-surface" in text

def test_input_has_error_state():
    text = (UI / "Input.tsx").read_text()
    assert "color-danger" in text

def test_input_has_focus_state():
    text = (UI / "Input.tsx").read_text()
    assert "color-border-focus" in text

def test_datatable_no_hardcoded_slate():
    text = (UI / "DataTable.tsx").read_text()
    assert "bg-slate-50" not in text
    assert "text-slate-700" not in text

def test_datatable_no_hardcoded_amber():
    text = (UI / "DataTable.tsx").read_text()
    assert "text-amber-500" not in text

def test_datatable_uses_brand_token():
    text = (UI / "DataTable.tsx").read_text()
    assert "text-brand" in text or "color-brand" in text

def test_modal_no_hardcoded_slate():
    text = (UI / "Modal.tsx").read_text()
    assert "bg-slate-950" not in text

def test_modal_no_hardcoded_stone():
    text = (UI / "Modal.tsx").read_text()
    assert "border-stone-200" not in text

def test_modal_uses_overlay_token():
    text = (UI / "Modal.tsx").read_text()
    assert "color-overlay" in text or "color-surface" in text
