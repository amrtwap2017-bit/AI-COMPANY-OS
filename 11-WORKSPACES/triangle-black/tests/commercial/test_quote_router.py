from fastapi.testclient import TestClient
import pytest
from src.main import app
from src.commercial.quotation.repository import QuoteRepository
from sqlalchemy.orm import Session
from src.database import get_db, Base, engine

@pytest.fixture(scope='module')
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope='module')
def db_session(client):
    Base.metadata.create_all(bind=engine)
    yield Session(engine)
    Base.metadata.drop_all(bind=engine)

def test_create_quote(client, db_session):
    response = client.post('/quotes/', json={'title': 'Test Quote', 'description': 'This is a test quote.'})
    assert response.status_code == 200
    data = response.json()
    assert data['title'] == 'Test Quote'
    assert data['status'] == 'draft'

def test_get_quote(client, db_session):
    response = client.post('/quotes/', json={'title': 'Test Quote', 'description': 'This is a test quote.'})
    quote_id = response.json()['id']
    response = client.get(f'/quotes/{quote_id}')
    assert response.status_code == 200
    data = response.json()
    assert data['title'] == 'Test Quote'
    assert data['status'] == 'draft'

def test_update_quote(client, db_session):
    response = client.post('/quotes/', json={'title': 'Test Quote', 'description': 'This is a test quote.'})
    quote_id = response.json()['id']
    response = client.put(f'/quotes/{quote_id}', json={'title': 'Updated Test Quote'})
    assert response.status_code == 200
    data = response.json()
    assert data['title'] == 'Updated Test Quote'
    assert data['status'] == 'draft'

def test_delete_quote(client, db_session):
    response = client.post('/quotes/', json={'title': 'Test Quote', 'description': 'This is a test quote.'})
    quote_id = response.json()['id']
    response = client.delete(f'/quotes/{quote_id}')
    assert response.status_code == 204