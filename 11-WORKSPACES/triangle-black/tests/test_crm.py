def test_create_lead(client, auth_headers):
    r = client.post("/api/v1/crm/leads", json={
        "name": "Ahmed Hassan",
        "email": "ahmed@hilton.com",
        "company": "Hilton Hotels",
        "source": "referral",
        "phone": "+20123456789",
        "priority": "high"
    }, headers=auth_headers)
    assert r.status_code == 201
    d = r.json()
    assert d["name"] == "Ahmed Hassan"
    assert d["status"] == "new"
    assert d["source"] == "referral"
    return d["id"]

def test_qualify_lead(client, auth_headers):
    r = client.post("/api/v1/crm/leads", json={
        "name": "Sara Ahmed",
        "email": "sara@marriott.com",
        "company": "Marriott",
        "source": "referral",
        "phone": "+20111222333"
    }, headers=auth_headers)
    lead_id = r.json()["id"]
    r2 = client.post(f"/api/v1/crm/leads/{lead_id}/qualify", headers=auth_headers)
    assert r2.status_code == 200
    d = r2.json()
    assert d["score"] > 0
    assert d["grade"] in ("qualified", "warm", "cold")
    assert "recommendation" in d

def test_list_leads(client, auth_headers):
    client.post("/api/v1/crm/leads", json={
        "name": "Test Lead", "email": "test@test.com", "source": "web"
    }, headers=auth_headers)
    r = client.get("/api/v1/crm/leads", headers=auth_headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_update_status(client, auth_headers):
    r = client.post("/api/v1/crm/leads", json={
        "name": "Status Test", "email": "status@test.com", "source": "web"
    }, headers=auth_headers)
    lead_id = r.json()["id"]
    r2 = client.put(f"/api/v1/crm/leads/{lead_id}/status", json={
        "status": "qualified", "note": "Manually qualified"
    }, headers=auth_headers)
    assert r2.status_code == 200
    assert r2.json()["status"] == "qualified"

def test_agent_assign(client, auth_headers):
    client.post("/api/v1/crm/agents", json={
        "name": "Sales Agent", "email": "agent@tb.com", "max_leads": 50
    }, headers=auth_headers)
    r = client.post("/api/v1/crm/leads", json={
        "name": "Assign Test", "email": "assign@test.com", "source": "direct"
    }, headers=auth_headers)
    lead_id = r.json()["id"]
    r2 = client.post(f"/api/v1/crm/leads/{lead_id}/assign", headers=auth_headers)
    assert r2.status_code == 200
    assert r2.json()["status"] == "assigned"
    assert r2.json()["assigned_agent_id"] is not None

def test_pipeline_summary(client, auth_headers):
    r = client.get("/api/v1/crm/leads/pipeline", headers=auth_headers)
    assert r.status_code == 200
    d = r.json()
    assert "total" in d
    assert "by_status" in d
    assert "conversion_rate" in d

def test_search_leads(client, auth_headers):
    client.post("/api/v1/crm/leads", json={
        "name": "Searchable Person", "email": "search@unique.com", "source": "web"
    }, headers=auth_headers)
    r = client.get("/api/v1/crm/leads/search?q=Searchable", headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()) >= 1

def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
