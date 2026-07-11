import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from src.core.database import get_db, Base, engine
from src.commercial.email_service.models import EmailLog
from src.commercial.email_service.repository import EmailRepository
from src.commercial.email_service.service import EmailService
from src.main import app

# Create test database and tables
Base.metadata.create_all(bind=engine)

def override_get_db():
    return Session(bind=engine)

app.dependency_overrides[get_db] = override_get_db

test_client = TestClient(app)

def test_send_email(test_client):
    response = test_client.post(
        "/api/v1/email/send",
        json={
            "to_email": "test@example.com",
            "subject": "Test Email",
            "template_name": "quote_sent"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["to_email"] == "test@example.com"
    assert data["subject"] == "Test Email"
    assert data["template_name"] == "quote_sent"

def test_get_email_logs(test_client):
    response = test_client.get("/api/v1/email/logs")
    assert response.status_code == 200
    logs = response.json()
    assert isinstance(logs, list)
