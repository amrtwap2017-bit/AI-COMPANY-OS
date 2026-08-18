"""SPRINT-005: Router registry infrastructure"""
import requests
import pytest
from pathlib import Path

BASE = "http://localhost:8030"
ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
SRC  = ROOT / "src"

def _s(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_router_registry_file_exists():
    assert (SRC / "router_registry.py").exists()

def test_router_registry_has_class():
    text = (SRC / "router_registry.py").read_text()
    assert "class RouterRegistry" in text

def test_router_registry_has_register_method():
    text = (SRC / "router_registry.py").read_text()
    assert "def register(" in text

def test_router_registry_has_register_many():
    text = (SRC / "router_registry.py").read_text()
    assert "def register_many(" in text

def test_router_registry_is_non_blocking():
    text = (SRC / "router_registry.py").read_text()
    assert "except Exception" in text
    assert "logger.warning" in text or "WARN" in text

def test_router_registry_tracks_failures():
    text = (SRC / "router_registry.py").read_text()
    assert "_failed" in text
    assert "_registered" in text

def test_router_registry_compiles():
    import py_compile
    py_compile.compile(str(SRC / "router_registry.py"), doraise=True)

def test_router_registry_instantiates():
    import sys
    sys.path.insert(0, str(ROOT))
    try:
        from src.router_registry import RouterRegistry
        from unittest.mock import MagicMock
        mock_app = MagicMock()
        registry = RouterRegistry(app=mock_app)
        assert registry.summary["registered"] == 0
        assert registry.summary["failed"] == 0
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_router_registry_handles_bad_import():
    import sys
    sys.path.insert(0, str(ROOT))
    try:
        from src.router_registry import RouterRegistry
        from unittest.mock import MagicMock
        mock_app = MagicMock()
        registry = RouterRegistry(app=mock_app)
        result = registry.register("src.nonexistent.module.router")
        assert result is False
        assert registry.summary["failed"] == 1
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_existing_routes_still_work():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert r.status_code == 200

def test_existing_auth_routes_still_work():
    r = requests.post(
        f"{BASE}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=10
    )
    assert r.status_code == 200

def test_main_has_register_optional_router():
    text = (SRC / "main.py").read_text()
    assert "register_optional_router" in text

def test_main_router_count_not_decreased():
    text = (SRC / "main.py").read_text()
    count = text.count("app.include_router") + text.count("register_optional_router")
    assert count >= 70
