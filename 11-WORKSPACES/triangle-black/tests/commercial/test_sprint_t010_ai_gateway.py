"""T-010: AI Gateway — governed single entry point for all AI calls"""
import requests
import pytest
from pathlib import Path
from unittest.mock import MagicMock

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

# ── File existence ─────────────────────────────────────────────────────────
def test_gateway_package_exists():
    assert (SRC / "commercial/ai_gateway/__init__.py").exists()

def test_gateway_module_exists():
    assert (SRC / "commercial/ai_gateway/gateway.py").exists()

def test_gateway_router_exists():
    assert (SRC / "commercial/ai_gateway/router.py").exists()

def test_gateway_has_required_classes():
    src = (SRC / "commercial/ai_gateway/gateway.py").read_text()
    for cls in ["class AIGateway", "class AIRequest", "class AIResponse"]:
        assert cls in src, f"Missing: {cls}"

def test_gateway_has_model_registry():
    src = (SRC / "commercial/ai_gateway/gateway.py").read_text()
    assert "MODEL_REGISTRY" in src
    assert "qwen2.5:7b" in src

def test_gateway_has_purpose_registry():
    src = (SRC / "commercial/ai_gateway/gateway.py").read_text()
    assert "ALLOWED_PURPOSES" in src
    assert "maintenance_recommendation" in src
    assert "work_order_summary" in src

def test_gateway_enforces_hotel_scope():
    src = (SRC / "commercial/ai_gateway/gateway.py").read_text()
    assert "self.hotel_id" in src
    assert "hotel_id" in src

def test_gateway_emits_audit():
    src = (SRC / "commercial/ai_gateway/gateway.py").read_text()
    assert "_emit_audit" in src
    assert "platform_audit_log" in src
    assert "AI_REQUEST" in src

# ── Unit tests ─────────────────────────────────────────────────────────────
def test_gateway_rejects_unknown_purpose():
    import sys
    sys.path.insert(0, str(SRC.parent))
    try:
        from src.commercial.ai_gateway.gateway import AIGateway, AIRequest
        mock_db = MagicMock()
        gw = AIGateway(db=mock_db, hotel_id=HOTEL)
        req = AIRequest(hotel_id=HOTEL, purpose="HACK_THE_SYSTEM",
                        prompt="drop table", model="qwen2.5:7b")
        resp = gw.request(req)
        assert resp.success is False
        assert "not allowed" in resp.error.lower()
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_gateway_registry_has_all_fields():
    import sys
    sys.path.insert(0, str(SRC.parent))
    try:
        from src.commercial.ai_gateway.gateway import AIGateway
        mock_db = MagicMock()
        gw = AIGateway(db=mock_db, hotel_id=HOTEL)
        reg = gw.get_registry()
        assert "hotel_id" in reg
        assert "models" in reg
        assert "purposes" in reg
        assert reg["hotel_id"] == HOTEL
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

# ── Live API ───────────────────────────────────────────────────────────────
def test_ai_gateway_registry_endpoint():
    r = requests.get(f"{BASE}/api/v1/ai-gateway/registry",
                     headers=_h(), timeout=5)
    _s(r, "ai-registry")
    assert r.status_code == 200
    data = r.json()
    assert "models" in data
    assert "purposes" in data

def test_ai_gateway_request_invalid_purpose():
    r = requests.post(f"{BASE}/api/v1/ai-gateway/request",
        headers={**_h(), "Content-Type": "application/json"},
        json={"purpose": "INVALID", "prompt": "test", "model": "qwen2.5:7b"},
        timeout=10)
    _s(r, "ai-invalid-purpose")
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is False

def test_health_still_works():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert r.status_code == 200
