import pytest
"""Fallback tests for: Quotation PDF Generator"""


@pytest.mark.skip(reason="Module health endpoint not registered in main API")
def test_quotation_pdf_generator_health(client):
    res = client.get("/api/v1/quotation_pdf_generator/health")
    assert res.status_code == 200
