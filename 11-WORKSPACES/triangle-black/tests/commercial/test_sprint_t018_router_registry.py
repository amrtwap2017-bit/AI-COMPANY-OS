"""T-018: main.py router registration safety seam"""
import requests
import pytest
from pathlib import Path

BASE = "http://localhost:8030"
ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
MAIN = ROOT / "src/main.py"

def test_main_has_register_optional_router():
    text = MAIN.read_text()
    assert "def register_optional_router(" in text

def test_main_uses_import_module():
    text = MAIN.read_text()
    assert "import_module" in text

def test_main_registers_workflow_engine_via_helper():
    text = MAIN.read_text()
    assert '"src.commercial.workflow_engine.router"' in text
    assert 'label="workflow_engine_router"' in text

def test_main_registers_ai_gateway_via_helper():
    text = MAIN.read_text()
    assert '"src.commercial.ai_gateway.router"' in text
    assert 'label="ai_gateway_router"' in text

def test_main_registers_platform_status_via_helper():
    text = MAIN.read_text()
    assert '"src.commercial.platform_status.router"' in text
    assert 'label="platform_status_router"' in text

def test_main_no_fragile_inline_router_try_blocks():
    text = MAIN.read_text()
    assert 'from src.commercial.ai_gateway.router import router as ai_gateway_router' not in text
    assert 'from src.commercial.platform_status.router import router as platform_status_router' not in text
    assert 'from src.commercial.workflow_engine.router import router as workflow_engine_router' not in text

def test_main_compiles():
    import py_compile
    py_compile.compile(str(MAIN), doraise=True)

def test_server_health_after_registry_refactor():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert r.status_code == 200

def test_platform_status_still_reachable():
    token_resp = requests.post(
        f"{BASE}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=10,
    )
    if token_resp.status_code != 200:
        pytest.skip("Login failed")
    token = token_resp.json()["access_token"]
    r = requests.get(
        f"{BASE}/api/v1/platform/status",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    if r.status_code == 429:
        pytest.skip("Rate limited")
    assert r.status_code == 200
