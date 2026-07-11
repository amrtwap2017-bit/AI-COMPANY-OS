"""Fallback tests for: Quotation PDF Generator"""


def test_quotation_pdf_generator_health(client):
    res = client.get("/api/v1/quotation_pdf_generator/health")
    assert res.status_code == 200
