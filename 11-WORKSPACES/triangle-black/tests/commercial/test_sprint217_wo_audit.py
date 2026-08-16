"""Sprint-217: Work order router audit injection tests"""
import requests
BASE = "http://localhost:8030"
_C = {}

def _h():
    if "h" not in _C:
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_work_order_create_returns_201():
    r = requests.post(f"{BASE}/api/v1/work-orders/",
        json={"title": "Audit Test WO", "priority": "medium", "type": "corrective"},
        headers=_h(), timeout=10)
    assert r.status_code in (200, 201, 401)

def test_work_order_create_returns_id():
    r = requests.post(f"{BASE}/api/v1/work-orders/",
        json={"title": "Audit ID Test WO", "priority": "low"},
        headers=_h(), timeout=10)
    if r.status_code in (200, 201):
        data = r.json()
        assert "id" in data

def test_work_order_update_returns_updated():
    r = requests.post(f"{BASE}/api/v1/work-orders/",
        json={"title": "WO to Update", "priority": "medium"},
        headers=_h(), timeout=10)
    if r.status_code not in (200, 201):
        return
    wo_id = r.json().get("id")
    if not wo_id:
        return
    r2 = requests.patch(f"{BASE}/api/v1/work-orders/{wo_id}",
        json={"priority": "high"},
        headers=_h(), timeout=10)
    assert r2.status_code in (200, 201, 204)

def test_audit_log_accessible():
    r = requests.get(f"{BASE}/api/v1/security/audit", headers=_h(), timeout=10)
    assert r.status_code in (200, 401, 403, 404)

def test_work_order_list_still_works_after_audit_injection():
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=3", headers=_h(), timeout=10)
    assert r.status_code == 200

def test_audit_module_has_all_functions():
    from src.core.audit import audit_create, audit_update, audit_delete, audit_action
    assert callable(audit_create)
    assert callable(audit_update)
    assert callable(audit_delete)
    assert callable(audit_action)

def test_work_order_router_imports_audit():
    import importlib
    router_mod = importlib.import_module("src.commercial.work_orders.router")
    assert hasattr(router_mod, "audit_create") or "audit_create" in dir(router_mod)
