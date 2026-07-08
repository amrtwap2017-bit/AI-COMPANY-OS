from fastapi.testclient import TestClient
from main import app
from infrastructure.db import get_db, Base, engine
import pytest

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    yield TestClient(app)
    Base.metadata.drop_all(bind=engine)

def test_update_lead_qualification(client):
    response = client.put('/leads/1/qualification', json={'qualification_status': 'qualified'})
    assert response.status_code == 200
    data = response.json()
    assert data['qualification_status'] == 'qualified'