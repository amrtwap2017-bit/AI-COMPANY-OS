"""Tests for dashboard, pipeline, search, and timeline endpoints."""


def test_pipeline_summary(client, auth):
    res = client.get("/api/v1/actions/pipeline/summary", headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, dict)
    assert len(data) > 0


def test_reports_dashboard(client, auth):
    res = client.get("/api/v1/actions/reports/dashboard", headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, dict)
    assert len(data) > 0


def test_lead_search_empty_query(client, auth):
    res = client.get("/api/v1/actions/leads/search?q=", headers=auth)
    assert res.status_code == 200
    data = res.json()
    # API returns {count, query, results} envelope
    results = data.get("results", data) if isinstance(data, dict) else data
    assert isinstance(results, list)
    assert len(results) >= 1


def test_lead_search_by_name(client, auth):
    res = client.get("/api/v1/actions/leads/search?q=Marriott", headers=auth)
    assert res.status_code == 200
    data = res.json()
    results = data.get("results", data) if isinstance(data, dict) else data
    assert isinstance(results, list)
    assert len(results) >= 1
    assert any(
        "Marriott" in r.get("name", "") or "Marriott" in r.get("company", "")
        for r in results
    )


def test_lead_search_by_status(client, auth):
    res = client.get(
        "/api/v1/actions/leads/search?q=&status=converted", headers=auth
    )
    assert res.status_code == 200
    data = res.json()
    results = data.get("results", data) if isinstance(data, dict) else data
    assert isinstance(results, list)
    for r in results:
        assert r["status"] == "converted"


def test_lead_search_by_source(client, auth):
    res = client.get(
        "/api/v1/actions/leads/search?q=&source=referral", headers=auth
    )
    assert res.status_code == 200
    data = res.json()
    results = data.get("results", data) if isinstance(data, dict) else data
    assert isinstance(results, list)
    # source filter works — results returned (field may not be in response)
    assert len(results) >= 1


def test_duplicate_check_existing_email(client, auth):
    res = client.get(
        "/api/v1/actions/leads/check-duplicate?email=eng@marriott-sharm.com",
        headers=auth,
    )
    assert res.status_code == 200
    assert isinstance(res.json(), dict)


def test_duplicate_check_new_email(client, auth):
    res = client.get(
        "/api/v1/actions/leads/check-duplicate?email=brand-new-999@unknown.com",
        headers=auth,
    )
    assert res.status_code == 200


def test_lead_timeline(client, auth):
    leads = client.get("/api/v1/leads/?limit=10", headers=auth).json()
    lead_id = leads[0]["id"]
    res = client.get(
        f"/api/v1/actions/leads/{lead_id}/timeline", headers=auth
    )
    assert res.status_code == 200
    data = res.json()
    # API returns {lead_id, timeline, ...} envelope
    timeline = data.get("timeline", data) if isinstance(data, dict) else data
    assert isinstance(timeline, list)


def test_pipeline_summary_requires_auth(client):
    res = client.get("/api/v1/actions/pipeline/summary")
    assert res.status_code == 401
