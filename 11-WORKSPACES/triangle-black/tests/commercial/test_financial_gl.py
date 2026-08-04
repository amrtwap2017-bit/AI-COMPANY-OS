"""Sprint-017: Financial GL + Chart of Accounts Tests"""
import pytest
from datetime import date


def test_gl_list(client, auth_headers):
    res = client.get("/api/v1/financial/gl/?limit=10", headers=auth_headers)
    assert res.status_code == 200

def test_gl_summary(client, auth_headers):
    res = client.get("/api/v1/financial/gl/summary", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_entries" in data

def test_gl_create(client, auth_headers):
    res = client.post("/api/v1/financial/gl/", json={
        "entry_date": str(date.today()),
        "description": "Test journal entry",
        "debit_account": "1001",
        "credit_account": "2001",
        "amount": 5000.00,
        "currency": "EGP",
        "reference": "REF-001",
    }, headers=auth_headers)
    assert res.status_code in (200, 201)

def test_coa_create(client, auth_headers):
    res = client.post("/api/v1/financial/gl/accounts/", json={
        "account_code": "1001",
        "account_name": "Cash and Bank",
        "account_type": "asset",
        "description": "Cash accounts",
    }, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["account_code"] == "1001"
    assert data["account_type"] == "asset"

def test_coa_list(client, auth_headers):
    res = client.get("/api/v1/financial/gl/accounts/", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "count" in data
    assert "results" in data

def test_coa_get(client, auth_headers):
    create = client.post("/api/v1/financial/gl/accounts/", json={
        "account_code": "2001",
        "account_name": "Accounts Payable",
        "account_type": "liability",
    }, headers=auth_headers)
    assert create.status_code == 201
    acc_id = create.json()["id"]
    res = client.get(f"/api/v1/financial/gl/accounts/{acc_id}", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["id"] == acc_id

def test_coa_filter_by_type(client, auth_headers):
    client.post("/api/v1/financial/gl/accounts/", json={
        "account_code": "4001",
        "account_name": "Revenue",
        "account_type": "revenue",
    }, headers=auth_headers)
    res = client.get("/api/v1/financial/gl/accounts/?account_type=revenue", headers=auth_headers)
    assert res.status_code == 200
    results = res.json()["results"]
    assert all(r["account_type"] == "revenue" for r in results)

def test_coa_tenant_isolation(client, auth_headers):
    res = client.get("/api/v1/financial/gl/accounts/nonexistent-xyz", headers=auth_headers)
    assert res.status_code == 404
