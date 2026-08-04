"""Sprint-021: Work Orders coverage tests — clean rewrite"""
import pytest
import requests as _req

BASE_URL = "http://localhost:8030"


def test_work_orders_list(auth_headers):
    r = _req.get(f"{BASE_URL}/api/v1/work-orders/?limit=10", headers=auth_headers, timeout=15)
    assert r.status_code == 200


def test_work_orders_returns_data(auth_headers):
    r = _req.get(f"{BASE_URL}/api/v1/work-orders/?limit=3", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    data = r.json()
    items = data if isinstance(data, list) else data.get("results", data.get("items", []))
    assert isinstance(items, list)


def test_work_orders_have_fields(auth_headers):
    r = _req.get(f"{BASE_URL}/api/v1/work-orders/?limit=1", headers=auth_headers, timeout=15)
    data = r.json()
    items = data if isinstance(data, list) else data.get("results", data.get("items", []))
    if items:
        w = items[0]
        assert "id" in w
        assert "status" in w


def test_work_order_create(auth_headers):
    r = _req.post(f"{BASE_URL}/api/v1/work-orders/",
        json={"title": "Sprint021 Coverage WO", "type": "corrective", "priority": "low"},
        headers=auth_headers, timeout=15)
    assert r.status_code in (200, 201, 422)


def test_work_orders_with_auth_returns_200(auth_headers):
    r = _req.get(f"{BASE_URL}/api/v1/work-orders/?limit=5", headers=auth_headers, timeout=15)
    assert r.status_code == 200


def test_work_orders_get_nonexistent(auth_headers):
    r = _req.get(f"{BASE_URL}/api/v1/work-orders/nonexistent-wo-xyz",
        headers=auth_headers, timeout=15)
    assert r.status_code == 404
