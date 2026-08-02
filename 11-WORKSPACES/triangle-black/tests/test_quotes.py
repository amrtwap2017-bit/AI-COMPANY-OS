"""Tests for quote endpoints."""


def test_list_quotes(client, auth):
    res = client.get("/api/v1/quotes/", headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 6


def test_quotes_have_required_fields(client, auth):
    quotes = client.get("/api/v1/quotes/", headers=auth).json()
    for q in quotes:
        assert "id" in q
        assert "title" in q
        assert "total" in q
        assert "status" in q
        assert q["status"] in (
            "draft", "review", "sent", "approved", "rejected", "expired"
        )


def test_get_quote_by_id(client, auth):
    quotes = client.get("/api/v1/quotes/", headers=auth).json()
    quote_id = quotes[0]["id"]
    res = client.get(f"/api/v1/quotes/{quote_id}", headers=auth)
    assert res.status_code == 200
    assert res.json()["id"] == quote_id


def test_get_quote_not_found(client, auth):
    res = client.get("/api/v1/quotes/nonexistent-000", headers=auth)
    assert res.status_code == 404


def test_pdf_endpoint_returns_pdf(client, auth):
    quotes = client.get("/api/v1/quotes/", headers=auth).json()
    quote_id = quotes[0]["id"]
    res = client.get(
        f"/api/v1/actions/quotes/{quote_id}/pdf",
        headers=auth,
    )
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 1000


def test_approved_quotes_exist(client, auth):
    quotes = client.get("/api/v1/quotes/?limit=100", headers=auth).json()
    approved = [q for q in quotes if q["status"] == "approved"]
    assert len(approved) >= 3, f"Expected 3 approved quotes, got {len(approved)}"


def test_quotes_requires_auth():
    import requests as _req
    res = _req.get("http://localhost:8030/api/v1/quotes/", timeout=10)
    assert res.status_code in (401, 429), f'Expected 401 or 429, got {res.status_code}'
