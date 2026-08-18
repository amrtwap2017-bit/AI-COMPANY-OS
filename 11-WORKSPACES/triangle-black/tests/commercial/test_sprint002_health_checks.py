"""SPRINT-002: Health check standardization verification"""
import requests
import pytest
import time
from pathlib import Path

BASE = "http://localhost:8030"
ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")

def _s(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def test_health_live_returns_200():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    _s(r, "health-live")
    assert r.status_code == 200

def test_health_live_returns_live_status():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    _s(r, "health-live-status")
    if r.status_code == 200:
        assert r.json().get("status") == "live"

def test_health_live_has_timestamp():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    _s(r, "health-timestamp")
    if r.status_code == 200:
        assert "timestamp" in r.json()

def test_health_ready_returns_200():
    r = requests.get(f"{BASE}/api/v1/health/ready", timeout=5)
    _s(r, "health-ready")
    assert r.status_code == 200

def test_health_ready_shows_database_connected():
    r = requests.get(f"{BASE}/api/v1/health/ready", timeout=5)
    _s(r, "health-ready-db")
    if r.status_code == 200:
        assert r.json().get("database") == "connected"

def test_health_live_under_500ms():
    start = time.perf_counter()
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    ms = round((time.perf_counter() - start) * 1000, 1)
    _s(r, "health-latency")
    if r.status_code == 200:
        assert ms < 500, f"Health live took {ms}ms — expected <500ms"

def test_health_ready_under_2000ms():
    start = time.perf_counter()
    r = requests.get(f"{BASE}/api/v1/health/ready", timeout=5)
    ms = round((time.perf_counter() - start) * 1000, 1)
    _s(r, "health-ready-latency")
    if r.status_code == 200:
        assert ms < 2000, f"Health ready took {ms}ms — expected <2000ms"

def test_health_response_headers_present():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    _s(r, "health-headers")
    if r.status_code == 200:
        assert "X-Request-ID" in r.headers
        assert "X-Response-Time-Ms" in r.headers

def test_docker_compose_has_healthcheck():
    text = (ROOT / "docker-compose.yml").read_text()
    assert "healthcheck" in text

def test_docker_compose_production_has_healthcheck():
    text = (ROOT / "docker-compose.production.yml").read_text()
    assert "healthcheck" in text

def test_health_slo_doc_exists():
    assert (ROOT / "docs/operations/HEALTH-CHECKS.md").exists()

def test_health_slo_doc_has_endpoints():
    text = (ROOT / "docs/operations/HEALTH-CHECKS.md").read_text()
    for ep in ["/health/live", "/health/ready", "SLOs"]:
        assert ep in text, f"Missing in health doc: {ep}"
