import uuid
import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.commercial.lead_management.repository import LeadRepository
from src.core.database import get_db, Base, engine

TEST_PREFIX = 'TEST-PYTEST'

@pytest.fixture(scope='module')
def test_lead_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        '/api/v1/leads/',
        json={
            'name': f'{TEST_PREFIX} Hotel {unique}',
            'company': 'Pytest Hotels',
            'phone': '+201234567890',
            'email': f'test_{unique}@pytest-hotel.com',
            'source': 'web',
            'priority': 'medium',
            'status': 'new',
            'agent_id': str(uuid.uuid4())[:36],
        },
        headers=auth,
    )
    assert res.status_code == 201, f'Create failed: {res.text}'
    lead_id = res.json()['id']
    yield lead_id
    client.delete(f'/api/v1/leads/{lead_id}', headers=auth)

@pytest.fixture(scope='module')
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_create_lead(test_client: TestClient, auth):
    unique = str(uuid.uuid4())[:8]
    res = test_client.post(
        '/api/v1/leads/',
        json={
            'name': f'{TEST_PREFIX} Hotel {unique}',
            'company': 'Pytest Hotels',
            'phone': '+201234567890',
            'email': f'test_{unique}@pytest-hotel.com',
            'source': 'web',
            'priority': 'medium',
            'status': 'new',
            'agent_id': str(uuid.uuid4())[:36],
        },
        headers=auth,
    )
    assert res.status_code == 201
    data = res.json()
    assert data['data']['name'] == f'{TEST_PREFIX} Hotel {unique}'

def test_list_leads(test_client: TestClient, auth):
    res = test_client.get('/api/v1/leads/', headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data['data'], list)

def test_update_lead(test_client: TestClient, auth, test_lead_id):
    unique = str(uuid.uuid4())[:8]
    res = test_client.put(
        f'/api/v1/leads/{test_lead_id}',
        json={'status': 'qualified'},
        headers=auth,
    )
    assert res.status_code == 200
    data = res.json()
    assert data['data']['status'] == 'qualified'
