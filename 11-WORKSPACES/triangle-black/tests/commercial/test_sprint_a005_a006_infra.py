"""
A-005: CI/CD Infrastructure verification
A-006: Observability + SLO verification
"""
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


# ── A-005: CI/CD Infrastructure ────────────────────────────────────────────
def test_github_actions_workflow_exists():
    p = Path(".github/workflows/ci.yml")
    assert p.exists(), "CI/CD workflow missing"
    text = p.read_text()
    assert "backend-quality" in text
    assert "security" in text
    assert "build-guard" in text
    assert "release-gate" in text

def test_dockerfile_exists():
    p = Path("Dockerfile")
    assert p.exists()
    text = p.read_text()
    assert "python:3.12" in text
    assert "HEALTHCHECK" in text
    assert "tbapp" in text  # non-root user

def test_production_compose_exists():
    p = Path("docker-compose.production.yml")
    assert p.exists()
    text = p.read_text()
    assert "postgres:15" in text
    assert "redis:7" in text
    assert "healthcheck" in text

def test_env_template_exists():
    p = Path(".env.production.template")
    assert p.exists()
    text = p.read_text()
    assert "TB_SECRET_KEY" in text
    assert "DATABASE_URL" in text
    assert "CHANGE_ME" in text  # should NOT have real values

def test_gitignore_protects_secrets():
    p = Path(".gitignore")
    text = p.read_text()
    assert ".env.production" in text

def test_slos_document_exists():
    p = Path("docs/slos.md")
    assert p.exists()
    text = p.read_text()
    assert "99.5%" in text
    assert "P95" in text


# ── A-006: Observability ───────────────────────────────────────────────────
def test_observability_module_importable():
    from src.core.observability import (
        init_observability, trace_operation,
        slo_tracker, get_observability_summary
    )
    assert init_observability is not None
    assert slo_tracker is not None

def test_slo_tracker_records_and_reports():
    from src.core.observability import SLOTracker
    tracker = SLOTracker()

    # Record some operations
    tracker.record("GET /test", 120.0, True)
    tracker.record("GET /test", 250.0, True)
    tracker.record("GET /test", 450.0, True)
    tracker.record("GET /test", 800.0, False)  # slow + error

    report = tracker.get_slo_report()
    assert "GET /test" in report
    m = report["GET /test"]
    assert m["total_requests"] == 4
    assert m["error_rate_pct"] == 25.0
    assert m["availability_pct"] == 75.0
    assert m["p95_ms"] > 0

def test_slo_check_detects_violations():
    from src.core.observability import SLOTracker
    tracker = SLOTracker()

    # Simulate high error rate
    for _ in range(10):
        tracker.record("POST /critical", 200.0, False)  # all errors

    check = tracker.check_slos()
    assert "slo_violations" in check
    assert len(check["slo_violations"]) > 0
    assert check["all_slos_met"] is False

def test_slo_report_endpoint():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/platform-monitoring/slo-report", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "otel_enabled" in data
    assert "slo_check" in data
    assert "all_slos_met" in data["slo_check"]

def test_observability_summary_structure():
    from src.core.observability import get_observability_summary
    summary = get_observability_summary()
    assert "otel_enabled" in summary
    assert "slo_report" in summary
    assert "slo_check" in summary
    assert isinstance(summary["slo_report"], dict)

def test_platform_monitoring_health_still_works():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/platform-monitoring/health", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["database_health"]["overall"] == "HEALTHY"
