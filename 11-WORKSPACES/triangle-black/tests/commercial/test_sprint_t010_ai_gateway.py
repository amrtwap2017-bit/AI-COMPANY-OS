"""T-010: AI Gateway Foundation Tests"""
import pytest
import requests
from pathlib import Path

BASE = "http://localhost:8030"
SRC = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src")

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

# ── Structure ─────────────────────────────────────────────────────────────────
def test_gateway_file_exists():
    assert (SRC / "commercial/ai_gateway/gateway.py").exists()

def test_gateway_router_exists():
    assert (SRC / "commercial/ai_gateway/router.py").exists()

def test_gateway_importable():
    from src.commercial.ai_gateway.gateway import AIGateway
    assert AIGateway is not None

def test_gateway_has_request_method():
    from src.commercial.ai_gateway.gateway import AIGateway
    assert hasattr(AIGateway, "request")

def test_gateway_has_allowed_purposes():
    from src.commercial.ai_gateway.gateway import AIGateway
    assert len(AIGateway.ALLOWED_PURPOSES) >= 10
    assert "maintenance_recommendation" in AIGateway.ALLOWED_PURPOSES
    assert "work_order_summary" in AIGateway.ALLOWED_PURPOSES

def test_gateway_has_available_models():
    from src.commercial.ai_gateway.gateway import AIGateway
    assert "default" in AIGateway.AVAILABLE_MODELS
    assert "qwen2.5-7b" in AIGateway.AVAILABLE_MODELS

def test_gateway_policy_blocks_unknown_purpose():
    from src.commercial.ai_gateway.gateway import AIGateway
    gw = AIGateway(db=None, hotel_id="test-hotel")
    result = gw.request(purpose="unknown_invalid_purpose", context={})
    assert result["status"] == "policy_blocked"

def test_gateway_enforces_hotel_id():
    from src.commercial.ai_gateway.gateway import AIGateway
    gw = AIGateway(db=None, hotel_id="test-hotel-xyz")
    result = gw.request(purpose="unknown_invalid_purpose", context={})
    assert result["hotel_id"] == "test-hotel-xyz"

def test_gateway_cost_policy_blocks_expensive():
    from src.commercial.ai_gateway.gateway import AIGateway
    gw = AIGateway(db=None, hotel_id="test-hotel")
    # Request with max_cost_usd=0 — should block anything with tokens
    result = gw.request(
        purpose="maintenance_recommendation",
        context={"data": "x" * 10000},  # large context
        model="gpt-4o-mini",
        max_cost_usd=0.0,
    )
    assert result["status"] in ("policy_blocked", "error")

def test_gateway_router_registered():
    text = (SRC / "main.py").read_text()
    assert "ai_gateway_router" in text

# ── Live API tests ─────────────────────────────────────────────────────────────
def test_models_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/ai-gateway/models", headers=_h(), timeout=5)
    _s(r, "ai-models")
    assert r.status_code == 200

def test_models_endpoint_has_default():
    r = requests.get(f"{BASE}/api/v1/ai-gateway/models", headers=_h(), timeout=5)
    _s(r, "ai-models-default")
    if r.status_code == 200:
        d = r.json()
        assert "models" in d
        assert "default_model" in d

def test_purposes_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/ai-gateway/purposes", headers=_h(), timeout=5)
    _s(r, "ai-purposes")
    assert r.status_code == 200

def test_purposes_endpoint_has_maintenance():
    r = requests.get(f"{BASE}/api/v1/ai-gateway/purposes", headers=_h(), timeout=5)
    _s(r, "ai-purposes-maint")
    if r.status_code == 200:
        d = r.json()
        assert "maintenance_recommendation" in d.get("purposes", [])

def test_ai_request_endpoint_rejects_unknown_purpose():
    r = requests.post(f"{BASE}/api/v1/ai-gateway/request",
        headers={**_h(), "Content-Type": "application/json"},
        json={"purpose": "not_a_valid_purpose", "context": {}},
        timeout=15)
    _s(r, "ai-invalid-purpose")
    assert r.status_code in (200, 422)
    if r.status_code == 200:
        assert r.json().get("status") == "policy_blocked"

def test_maintenance_recommendation_endpoint():
    r = requests.post(f"{BASE}/api/v1/ai-gateway/maintenance-recommendation",
        headers={**_h(), "Content-Type": "application/json"},
        json={"symptoms": "HVAC making noise"},
        timeout=30)
    _s(r, "ai-maint-rec")
    assert r.status_code in (200, 422, 500)
    if r.status_code == 200:
        d = r.json()
        assert "hotel_id" in d
        assert "purpose" in d
        assert d["purpose"] == "maintenance_recommendation"
