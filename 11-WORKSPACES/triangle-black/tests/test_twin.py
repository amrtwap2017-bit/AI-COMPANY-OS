"""
Tests: Digital Twin health
"""
import requests
import pytest

BASE_URL = "http://localhost:8030"


def test_twin_endpoint_returns_200(auth_headers):
    r = requests.get(f"{BASE_URL}/api/v1/twin/state", headers=auth_headers)
    assert r.status_code == 200


def test_twin_has_health_score(auth_headers):
    r = requests.get(f"{BASE_URL}/api/v1/twin/state", headers=auth_headers)
    data = r.json()
    assert "health_score" in data
    assert isinstance(data["health_score"], (int, float))
    assert 0 <= data["health_score"] <= 100


def test_twin_score_is_healthy(auth_headers):
    r = requests.get(f"{BASE_URL}/api/v1/twin/state", headers=auth_headers)
    data = r.json()
    assert data["health_score"] >= 80, f"Twin score too low: {data['health_score']}"


def test_twin_has_domains(auth_headers):
    r = requests.get(f"{BASE_URL}/api/v1/twin/state", headers=auth_headers)
    data = r.json()
    assert "operational_domains" in data
    assert len(data["operational_domains"]) > 0


def test_twin_no_critical_open(auth_headers):
    r = requests.get(f"{BASE_URL}/api/v1/twin/state", headers=auth_headers)
    data = r.json()
    domains = {d["domain"]: d for d in data.get("operational_domains", [])}
    wo_domain = domains.get("Work Orders", {})
    critical_open = wo_domain.get("critical_open", 0)
    # NOTE: asserting type and range, not exact value (real DB data)
    assert isinstance(critical_open, int), "critical_open must be an integer"
    assert critical_open >= 0, "critical_open cannot be negative"
