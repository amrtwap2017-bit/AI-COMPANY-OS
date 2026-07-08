import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.database import Base, get_db
from app import app

SQLALCHEMY_TEST_URL = "sqlite:///./test_tb.db"
engine_test = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

Base.metadata.create_all(bind=engine_test)

def override_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_db

@pytest.fixture()
def client():
    return TestClient(app)

@pytest.fixture()
def auth_headers(client):
    client.post("/api/v1/auth/register", json={
        "email": "admin@triangleblack.com",
        "full_name": "Admin User",
        "password": "adminpass123",
        "role": "admin"
    })
    r = client.post("/api/v1/auth/login", json={
        "email": "admin@triangleblack.com",
        "password": "adminpass123"
    })
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
