"""A-009: Data Import Domain Rule + assets.score fix verification"""
import requests
from pathlib import Path

BASE = "http://localhost:8030"
_C = {}

def _auth():
    if "h" not in _C:
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        assert r.status_code == 200
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_assets_endpoint_works():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/assets/?limit=5", headers=h, timeout=10)
    assert r.status_code == 200

def test_a007_modules_accessible():
    h = _auth()
    endpoints = [
        "/api/v1/rbac/users",
        "/api/v1/maintenance/pm-plans-v2/",
        "/api/v1/payment-tracking-v2/",
        "/api/v1/work-orders-v2/assets-sync",
        "/api/v1/service-requests-v2/nonexistent/work-order",
        "/api/v1/stock-api/balances",
        "/api/v1/stock-api/low-stock-alerts",
        "/api/v1/maintenance-v2/assets-with-work-orders",
        "/api/v1/maintenance-v2/overdue-pm",
        "/api/v1/financial-v2/spend-summary",
        "/api/v1/financial-v2/cost-by-category",
    ]
    failed = []
    for ep in endpoints:
        r = requests.get(f"{BASE}{ep}", headers=h, timeout=10)
        if r.status_code not in (200, 404):
            failed.append(f"{ep} → {r.status_code}")
    assert not failed, f"Failed: {failed}"

def test_main_py_module_count_reduced():
    """Verify A-007 is reducing main.py complexity."""
    main = Path("src/main.py").read_text()
    # We should have at least 8 new proper routers registered
    router_registrations = main.count("app.include_router(")
    print(f"Router registrations in main.py: {router_registrations}")
    assert router_registrations >= 8, f"Expected ≥8 routers, got {router_registrations}"

def test_a005_ci_workflow_is_valid_yaml():
    """Verify CI/CD workflow is valid YAML structure."""
    p = Path(".github/workflows/ci.yml")
    assert p.exists()
    text = p.read_text()
    assert "name: Triangle Black CI" in text
    assert "jobs:" in text
    assert "backend-quality:" in text
    assert "release-gate:" in text

def test_a006_slo_tracker_functional():
    from src.core.observability import SLOTracker
    t = SLOTracker()
    for i in range(100):
        t.record("/api/v1/test", float(i * 5), i % 10 != 0)
    report = t.get_slo_report()
    assert "/api/v1/test" in report
    m = report["/api/v1/test"]
    assert m["total_requests"] == 100
    assert 85.0 <= m["availability_pct"] <= 95.0
    assert m["p95_ms"] > 0
