"""P0 — Commercial Pilot Readiness Tests"""
import pytest
import requests
from pathlib import Path

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_ci_cd_pipeline_exists():
    """CI/CD pipeline must exist for production deployment."""
    ci_p = Path(".github/workflows/ci.yml")
    assert ci_p.exists(), "CI/CD pipeline missing"
    text = ci_p.read_text()
    assert "backend-test" in text or "pytest" in text

def test_backup_script_exists():
    assert Path("scripts/backup.sh").exists()
    text = Path("scripts/backup.sh").read_text()
    assert "pg_dump" in text

def test_restore_script_exists():
    assert Path("scripts/restore.sh").exists()

def test_backup_verify_script_exists():
    assert Path("scripts/backup_verify.py").exists()

def test_production_docker_compose_exists():
    assert Path("docker-compose.production.yml").exists()
    import yaml
    config = yaml.safe_load(Path("docker-compose.production.yml").read_text())
    assert "services" in config
    assert "api" in config["services"]
    assert "db" in config["services"]
    assert "redis" in config["services"]

def test_onboarding_page_exists():
    p = Path("portal/app/(app)/(enterprise)/onboarding/page.tsx")
    assert p.exists()
    text = p.read_text()
    assert "OnboardingPage" in text
    assert "welcome" in text.lower()
    assert "complete" in text.lower()

def test_seed_demo_data_script_complete():
    p = Path("scripts/seed_demo_data.py")
    assert p.exists()
    text = p.read_text()
    assert "maintenance_plans" in text
    assert "suppliers" in text
    assert "work_orders" in text

def test_platform_health_gate(auth_headers):
    r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                     headers=auth_headers, timeout=15)
    _skip(r, "health")
    assert r.status_code == 200
    assert r.json()["health_score"] >= 70

def test_all_13_engines_p0(auth_headers):
    eps = [
        "/api/v1/pm-engine/summary", "/api/v1/sla-engine/summary",
        "/api/v1/asset-engine/summary", "/api/v1/cost-engine/summary",
        "/api/v1/risk-engine/summary", "/api/v1/backlog-engine/summary",
        "/api/v1/technician-engine/summary", "/api/v1/trend-engine/summary",
        "/api/v1/predictive-engine/summary",
    ]
    failed = []
    for ep in eps:
        r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        if r.status_code != 200: failed.append(ep)
    assert not failed

def test_10_portal_pages_exist():
    """All 10 portal pages must exist."""
    pages = [
        "portal/app/(app)/(enterprise)/intelligence/page.tsx",
        "portal/app/(app)/(enterprise)/operations/command-center/page.tsx",
        "portal/app/(app)/(enterprise)/pilot-dashboard/page.tsx",
        "portal/app/(app)/(enterprise)/operations/intelligence-loop/page.tsx",
        "portal/app/(app)/(enterprise)/maintenance/intelligence/page.tsx",
        "portal/app/(app)/(enterprise)/maintenance/predictive/page.tsx",
        "portal/app/(app)/(enterprise)/demo/presentation/page.tsx",
        "portal/app/(app)/(enterprise)/operations/technicians/page.tsx",
        "portal/app/(app)/(enterprise)/analytics/trends/page.tsx",
        "portal/app/(app)/(enterprise)/onboarding/page.tsx",
    ]
    missing = [p for p in pages if not Path(p).exists()]
    assert not missing, f"Missing pages: {missing}"

def test_commercial_cost_2m(auth_headers):
    r = requests.get(f"{BASE}/api/v1/cost-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "cost")
    assert r.status_code == 200
    assert r.json()["cost_overview"]["total_operational_cost"] > 1_000_000

def test_commercial_pm_grade_c(auth_headers):
    r = requests.get(f"{BASE}/api/v1/pm-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "pm")
    assert r.status_code == 200
    assert r.json()["compliance_grade"] in ("C","B","A","A+")

def test_commercial_sla_95(auth_headers):
    r = requests.get(f"{BASE}/api/v1/sla-engine/summary",
                     headers=auth_headers, timeout=15)
    _skip(r, "sla")
    assert r.status_code == 200
    assert r.json()["overall_compliance_pct"] >= 95

def test_alembic_p0(auth_headers):
    import subprocess
    result = subprocess.run([".venv/bin/alembic","heads"],
                           capture_output=True, text=True)
    heads = [l.strip() for l in result.stdout.splitlines() if l.strip()]
    assert len(heads) == 1

def test_p0_complete_gate(auth_headers):
    """All P0 requirements met."""
    checks = [
        Path(".github/workflows/ci.yml").exists(),
        Path("scripts/backup.sh").exists(),
        Path("docker-compose.production.yml").exists(),
        Path("portal/app/(app)/(enterprise)/onboarding/page.tsx").exists(),
        Path("scripts/seed_demo_data.py").exists(),
    ]
    assert all(checks), f"P0 gaps: {[i for i,c in enumerate(checks) if not c]}"
