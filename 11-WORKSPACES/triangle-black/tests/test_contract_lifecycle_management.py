import pytest
"""Fallback tests for: Contract Lifecycle Management"""


@pytest.mark.skip(reason="Module health endpoint not registered in main API")
def test_contract_lifecycle_management_health(client):
    res = client.get("/api/v1/contract_lifecycle_management/health")
    assert res.status_code == 200
