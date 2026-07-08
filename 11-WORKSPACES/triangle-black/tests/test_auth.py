def test_register(client):
    r = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "full_name": "Test User",
        "password": "password123",
        "role": "agent"
    })
    assert r.status_code == 201
    assert r.json()["email"] == "test@example.com"
    assert r.json()["role"] == "agent"

def test_login(client):
    client.post("/api/v1/auth/register", json={
        "email": "login@example.com",
        "full_name": "Login User",
        "password": "password123",
        "role": "agent"
    })
    r = client.post("/api/v1/auth/login", json={
        "email": "login@example.com",
        "password": "password123"
    })
    assert r.status_code == 200
    assert "access_token" in r.json()

def test_me(client, auth_headers):
    r = client.get("/api/v1/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["role"] == "admin"

def test_invalid_login(client):
    r = client.post("/api/v1/auth/login", json={
        "email": "nobody@example.com",
        "password": "wrong"
    })
    assert r.status_code == 401
