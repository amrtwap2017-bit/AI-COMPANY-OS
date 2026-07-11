from datetime import datetime
import uuid
import pytest
datetime = pytest.importorskip('datetime')
from fastapi.testclient import TestClient
from src.main import app
from src.core.auth import create_access_token
from src.commercial.projects.schemas import ProjectCreate, ProjectResponse

client = TestClient(app)

@pytest.fixture(scope='module')
def test_project_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        '/api/v1/projects/',
        json={
            'hotel_id': 'TEST-HOTEL-ID',
            'title': f'TEST-PROJECT-{unique}',
            'description': 'Test project for testing purposes.',
            'start_date': datetime.datetime.now().isoformat(),
            'end_date': (datetime.datetime.now() + datetime.timedelta(days=30)).isoformat(),
            'budget': 1000.0,
            'status': 'planning',
            'completion_pct': 0,
            'manager_id': 'TEST-MANAGER-ID'
        },
        headers=auth
    )
    assert res.status_code == 201, f'Create failed: {res.text}'
    project_id = res.json()['id']
    yield project_id
    client.delete(f'/api/v1/projects/{project_id}', headers=auth)

def test_list_projects_by_hotel_id_returns_results(client, auth):
    res = client.get('/api/v1/projects/', headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0


def test_get_project_by_id_returns_details(test_project_id, client, auth):
    project_id = test_project_id
    res = client.get(f'/api/v1/projects/{project_id}', headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert data['id'] == project_id


def test_update_project_updates_status_and_completion_pct(test_project_id, client, auth):
    project_id = test_project_id
    update_data = {
        'status': 'active',
        'completion_pct': 25
    }
    res = client.patch(f'/api/v1/projects/{project_id}', json=update_data, headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert data['status'] == update_data['status']
    assert data['completion_pct'] == update_data['completion_pct']


def test_delete_project_deletes_project(test_project_id, client, auth):
    project_id = test_project_id
    res = client.delete(f'/api/v1/projects/{project_id}', headers=auth)
    assert res.status_code == 204