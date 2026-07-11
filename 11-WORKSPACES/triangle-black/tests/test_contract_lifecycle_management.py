"""Fallback tests for: Contract Lifecycle Management"""


def test_contract_lifecycle_management_health(client):
    res = client.get("/api/v1/contract_lifecycle_management/health")
    assert res.status_code == 200
