"""SPRINT-006: Repository layer audit — measure current state"""
import requests
import pytest
from pathlib import Path

BASE = "http://localhost:8030"
ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
SRC  = ROOT / "src"
COMMERCIAL = SRC / "commercial"

def _s(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_repository_audit_doc_exists():
    assert (ROOT / "docs/upgrade-analysis/06_REPOSITORY_LAYER_AUDIT.md").exists()

def test_repository_audit_has_metrics():
    text = (ROOT / "docs/upgrade-analysis/06_REPOSITORY_LAYER_AUDIT.md").read_text()
    assert "458" in text
    assert "Repository" in text

def test_work_orders_has_repository():
    assert (COMMERCIAL / "work_orders/repository.py").exists() or \
           (COMMERCIAL / "work_orders/models.py").exists()

def test_assets_has_repository():
    assert (COMMERCIAL / "assets/repository.py").exists()

def test_invoices_has_repository():
    assert (COMMERCIAL / "invoices/repository.py").exists()

def test_contracts_has_repository():
    assert (COMMERCIAL / "contracts/repository.py").exists()

def test_service_requests_has_service():
    assert (COMMERCIAL / "service_requests/service.py").exists()

def test_total_repository_files():
    repos = list(COMMERCIAL.rglob("repository.py"))
    assert len(repos) >= 20, f"Expected 20+ repositories, got {len(repos)}"

def test_total_modules_with_router():
    routers = list(COMMERCIAL.rglob("router.py"))
    assert len(routers) >= 50, f"Expected 50+ routers, got {len(routers)}"

def test_raw_sql_count_documented():
    text = (ROOT / "docs/upgrade-analysis/06_REPOSITORY_LAYER_AUDIT.md").read_text()
    assert "raw SQL" in text.lower() or "Raw SQL" in text

def test_work_orders_endpoint_still_works():
    token_r = requests.post(
        f"{BASE}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=10
    )
    if token_r.status_code != 200:
        pytest.skip("Login failed")
    token = token_r.json()["access_token"]
    r = requests.get(
        f"{BASE}/api/v1/work-orders/?limit=1",
        headers={"Authorization": f"Bearer {token}"},
        timeout=5
    )
    _s(r, "wo-list")
    assert r.status_code == 200

def test_health_still_ok():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert r.status_code == 200
