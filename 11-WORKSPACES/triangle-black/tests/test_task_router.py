from fastapi.testclient import TestClient
from main import app
from infrastructure.db import get_db, Base, db_engine
from sqlalchemy.orm import sessionmaker
import pytest

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
echo = False
db_engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={'check_same_thread': False}, echo=echo)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)

Base.metadata.create_all(bind=db_engine)

client = TestClient(app)

def test_create_task(test_db):
    task_data = {
        "email": "test@example.com",
        "status": "pending",
        "source": "web",
        "assigned_agent_id": 1
    }
    response = client.post('/tasks/', json=task_data)
    assert response.status_code == 200
    assert response.json()['email'] == task_data['email']

def test_get_tasks_by_email(test_db):
    task_data = {
        "email": "test@example.com",
        "status": "pending",
        "source": "web",
        "assigned_agent_id": 1
    }
    client.post('/tasks/', json=task_data)
    response = client.get('/tasks/email/test@example.com')
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_get_tasks_by_status(test_db):
    task_data = {
        "email": "test@example.com",
        "status": "pending",
        "source": "web",
        "assigned_agent_id": 1
    }
    client.post('/tasks/', json=task_data)
    response = client.get('/tasks/status/pending')
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_get_tasks_by_source(test_db):
    task_data = {
        "email": "test@example.com",
        "status": "pending",
        "source": "web",
        "assigned_agent_id": 1
    }
    client.post('/tasks/', json=task_data)
    response = client.get('/tasks/source/web')
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_get_tasks_by_assigned_agent_id(test_db):
    task_data = {
        "email": "test@example.com",
        "status": "pending",
        "source": "web",
        "assigned_agent_id": 1
    }
    client.post('/tasks/', json=task_data)
    response = client.get('/tasks/agent/1')
    assert response.status_code == 200
    assert len(response.json()) == 1
