"""Tests for contract endpoints."""


def test_list_contracts(client, auth):
    res = client.get("/api/v1/contracts/", headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 3


def test_contracts_have_required_fields(client, auth):
    contracts = client.get("/api/v1/contracts/", headers=auth).json()
    for c in contracts:
        assert "id" in c
        assert "title" in c
        assert "total_value" in c
        assert "status" in c
        assert "services" in c
        assert c["total_value"] > 0


def test_get_contract_by_id(client, auth):
    contracts = client.get("/api/v1/contracts/", headers=auth).json()
    contract_id = contracts[0]["id"]
    res = client.get(f"/api/v1/contracts/{contract_id}", headers=auth)
    assert res.status_code == 200
    assert res.json()["id"] == contract_id


def test_get_contract_not_found(client, auth):
    res = client.get("/api/v1/contracts/nonexistent-000", headers=auth)
    assert res.status_code == 404


def test_contract_total_values(client, auth):
    contracts = client.get("/api/v1/contracts/", headers=auth).json()
    total = sum(c["total_value"] for c in contracts)
    assert total >= 500_000, f"Expected pipeline >= 500k EGP, got {total}"


def test_contracts_requires_auth():
    import requests as _req
    res = _req.get("http://localhost:8030/api/v1/contracts/", timeout=10)
    assert res.status_code == 401
