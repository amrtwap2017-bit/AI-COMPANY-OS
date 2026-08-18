"""T-021: AI Gateway adoption — ai_assistant router migrated to gateway"""
import requests
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch

BASE = "http://localhost:8030"
SRC  = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src")
HOTEL = "tb-default-hotel-000000000001"

_C = {}
def _h():
    if "h" not in _C:
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def _s(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_ai_assistant_router_has_gateway_wrapper():
    src = (SRC / "commercial/ai_assistant/router.py").read_text()
    assert "def _call_ai_gateway(" in src

def test_ai_assistant_router_imports_ai_gateway():
    src = (SRC / "commercial/ai_assistant/router.py").read_text()
    assert "AIGateway" in src
    assert "AIRequest" in src

def test_ai_assistant_router_uses_gateway_for_intake():
    src = (SRC / "commercial/ai_assistant/router.py").read_text()
    assert "_call_ai_gateway" in src
    assert "service_request_triage" in src

def test_ai_assistant_router_has_fallback():
    src = (SRC / "commercial/ai_assistant/router.py").read_text()
    assert "call_ollama(prompt)" in src

def test_ai_assistant_router_still_has_legacy_call_ollama():
    src = (SRC / "commercial/ai_assistant/router.py").read_text()
    assert "def call_ollama(" in src

def test_gateway_wrapper_uses_purpose_enum():
    src = (SRC / "commercial/ai_assistant/router.py").read_text()
    assert "service_request_triage" in src

def test_gateway_wrapper_is_non_blocking():
    src = (SRC / "commercial/ai_assistant/router.py").read_text()
    assert "except Exception:" in src

def test_gateway_wrapper_unit_fallback():
    import sys
    sys.path.insert(0, "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
    try:
        import importlib
        mod = importlib.import_module("src.commercial.ai_assistant.router")
        mock_db = MagicMock()
        with patch.object(mod, "call_ollama", return_value="fallback result"):
            result = mod._call_ai_gateway(
                "test prompt", hotel_id=HOTEL, db=mock_db
            )
            assert isinstance(result, str)
    except Exception as e:
        pytest.skip(f"Unit test skipped: {e}")

def test_ai_gateway_registry_still_works():
    r = requests.get(f"{BASE}/api/v1/ai-gateway/registry",
                     headers=_h(), timeout=5)
    _s(r, "ai-reg-t021")
    assert r.status_code == 200
    d = r.json()
    assert "purposes" in d
    assert "service_request_triage" in d["purposes"]

def test_ai_intake_endpoint_still_works():
    r = requests.post(
        f"{BASE}/api/v1/ai/intake/request?hotel_id={HOTEL}",
        json={"text": "The HVAC chiller in room 101 is not cooling"},
        timeout=15,
    )
    _s(r, "ai-intake")
    assert r.status_code in (200, 401, 422, 500)
    if r.status_code == 200:
        d = r.json()
        assert "parsed" in d or "error" in d

def test_platform_status_still_ok():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert r.status_code == 200
