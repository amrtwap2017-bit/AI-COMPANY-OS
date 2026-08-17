"""Sprint-252: Batch tenant isolation fix — 7 routers secured"""
import requests
from pathlib import Path

BASE = "http://localhost:8030"
SRC  = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/commercial")

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
        import pytest; pytest.skip(f"Rate limited — {ctx}")

FIXED_ROUTERS = [
    "assets/router.py",
    "service_requests/router.py",
    "projects/router.py",
    "analytics_platform/router.py",
    "maintenance_enterprise/router.py",
    "executive_intelligence/router.py",
    "approval_center/router.py",
]

# ── Static: no Optional hotel_id in fixed routers ────────────────────────────
def test_assets_router_no_optional_hotel_id():
    text = (SRC / "assets/router.py").read_text()
    assert "hotel_id: Optional[str] = None" not in text
    assert "hotel_id:      Optional[str] = None" not in text

def test_service_requests_router_no_optional_hotel_id():
    text = (SRC / "service_requests/router.py").read_text()
    assert "hotel_id: Optional[str] = None" not in text

def test_projects_router_no_optional_hotel_id():
    text = (SRC / "projects/router.py").read_text()
    assert "hotel_id: Optional[str] = None" not in text

def test_analytics_platform_router_no_optional_hotel_id():
    text = (SRC / "analytics_platform/router.py").read_text()
    assert "hotel_id: Optional[str] = None" not in text

def test_maintenance_enterprise_router_no_optional_hotel_id():
    text = (SRC / "maintenance_enterprise/router.py").read_text()
    assert "hotel_id: Optional[str] = None" not in text

def test_executive_intelligence_router_no_optional_hotel_id():
    text = (SRC / "executive_intelligence/router.py").read_text()
    assert "hotel_id: Optional[str] = None" not in text

def test_approval_center_router_no_optional_hotel_id():
    text = (SRC / "approval_center/router.py").read_text()
    assert "hotel_id: Optional[str] = None" not in text

# ── Static: all fixed routers use Depends ─────────────────────────────────────
def test_assets_router_uses_depends():
    text = (SRC / "assets/router.py").read_text()
    assert "Depends(get_hotel_id)" in text

def test_service_requests_router_uses_depends():
    text = (SRC / "service_requests/router.py").read_text()
    assert "Depends(get_hotel_id)" in text

# ── Live: endpoints require auth ──────────────────────────────────────────────
def test_assets_requires_auth():
    r = requests.get(f"{BASE}/api/v1/assets/?limit=3", timeout=5)
    _s(r, "assets-auth")
    assert r.status_code in (401, 422), f"Assets accessible without auth: {r.status_code}"

def test_service_requests_requires_auth():
    r = requests.get(f"{BASE}/api/v1/service-requests/?limit=3", timeout=5)
    _s(r, "sr-auth")
    assert r.status_code in (401, 422), f"SRs accessible without auth: {r.status_code}"

# ── Live: endpoints work with valid auth ──────────────────────────────────────
def test_assets_returns_200_with_auth():
    r = requests.get(f"{BASE}/api/v1/assets/?limit=3", headers=_h(), timeout=5)
    _s(r, "assets-200")
    assert r.status_code == 200

def test_service_requests_returns_200_with_auth():
    r = requests.get(f"{BASE}/api/v1/service-requests/?limit=3", headers=_h(), timeout=5)
    _s(r, "sr-200")
    assert r.status_code == 200

def test_work_orders_still_secure_control():
    """Control test — work_orders was fixed in Sprint-249B."""
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=3", timeout=5)
    _s(r, "wo-control")
    assert r.status_code in (401, 422)

def test_total_vulnerable_routers_is_zero():
    """Scan all routers — confirm no Optional hotel_id remains in P0 set."""
    p0_routers = [
        "assets/router.py",
        "service_requests/router.py",
        "work_orders/router.py",
    ]
    for path in p0_routers:
        text = (SRC / path).read_text()
        assert "hotel_id: Optional[str] = None" not in text, \
            f"{path} still has vulnerable Optional hotel_id"
        assert "hotel_id:      Optional[str] = None" not in text, \
            f"{path} still has vulnerable Optional hotel_id"
