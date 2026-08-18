"""SPRINT-013: FilterBar + AlertBanner + SectionCard + Breadcrumb token migration"""
from pathlib import Path

UI = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal/components/ui")

def test_filterbar_no_hardcoded_stone():
    text = (UI / "FilterBar.tsx").read_text()
    assert "border-stone-200" not in text
    assert "text-slate-600" not in text

def test_alertbanner_no_hardcoded_emerald():
    text = (UI / "AlertBanner.tsx").read_text()
    assert "bg-emerald-50" not in text
    assert "text-emerald-800" not in text

def test_alertbanner_no_hardcoded_amber():
    text = (UI / "AlertBanner.tsx").read_text()
    assert "bg-amber-50" not in text

def test_alertbanner_no_hardcoded_red():
    text = (UI / "AlertBanner.tsx").read_text()
    assert "bg-red-50" not in text

def test_alertbanner_no_hardcoded_slate():
    text = (UI / "AlertBanner.tsx").read_text()
    assert "bg-slate-50" not in text
    assert "text-slate-700" not in text

def test_alertbanner_uses_semantic_tokens():
    text = (UI / "AlertBanner.tsx").read_text()
    assert "success-bg" in text
    assert "warning-bg" in text
    assert "danger-bg" in text

def test_sectioncard_no_hardcoded_stone():
    text = (UI / "SectionCard.tsx").read_text()
    assert "border-stone-200" not in text
    assert "text-stone-900" not in text

def test_sectioncard_uses_surface_token():
    text = (UI / "SectionCard.tsx").read_text()
    assert "bg-surface" in text

def test_breadcrumb_no_hardcoded_slate():
    text = (UI / "Breadcrumb.tsx").read_text()
    assert "text-slate-600" not in text
    assert "text-slate-300" not in text

def test_breadcrumb_uses_semantic_tokens():
    text = (UI / "Breadcrumb.tsx").read_text()
    assert "text-secondary" in text or "text-tertiary" in text
