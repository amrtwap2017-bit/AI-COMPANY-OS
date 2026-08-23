"""
Sprint C-002: E2E Infrastructure Verification Test
"""
import pytest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

def test_playwright_config_has_global_setup():
    config_path = PROJECT_ROOT / "portal" / "playwright.config.ts"
    assert config_path.exists()
    text = config_path.read_text()
    assert "globalSetup" in text, "Playwright config must have globalSetup"
    assert "60000" in text, "Timeout must be at least 60s"

def test_global_setup_script_exists():
    setup_path = PROJECT_ROOT / "portal" / "e2e" / "global-setup.ts"
    assert setup_path.exists(), "Global setup script missing"
    text = setup_path.read_text()
    assert "waitForServer" in text, "Must include server wait logic"
    assert "8030" in text, "Must wait for backend"
    assert "3000" in text, "Must wait for portal"

def test_middleware_whitelists_marketing():
    mw_path = PROJECT_ROOT / "portal" / "middleware.ts"
    assert mw_path.exists()
    text = mw_path.read_text()
    assert "/solutions" in text, "Must whitelist /solutions"
    assert "/how-it-works" in text, "Must whitelist /how-it-works"
    assert "/case-studies" in text, "Must whitelist /case-studies"
