"""
Sprint P-007: TBDL 3.0 Design Tokens Verification Test
"""
import pytest
from pathlib import Path

def test_globals_css_has_tbdl3_tokens():
    p = Path("portal/app/globals.css")
    assert p.exists()
    text = p.read_text()

    expected_tokens = [
        "--color-brand:",
        "--color-bg-base:",
        "--color-bg-surface:",
        "--color-success:",
        "--color-warning:",
        "--color-danger:",
        "--color-info:",
        ".dark {"
    ]

    for token in expected_tokens:
        assert token in text, f"Missing design token: {token}"

def test_status_badge_component_exists_and_clean():
    p = Path("portal/components/ui/StatusBadge.tsx")
    assert p.exists()
    text = p.read_text()
    assert "style={{" not in text, "StatusBadge must not have inline styles"
    assert "StatusBadge" in text
