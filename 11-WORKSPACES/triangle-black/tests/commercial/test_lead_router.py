from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from src.database import create_test_engine, Base, get_db
from src.commercial.lead_management.router import router
from src.commercial.lead_management.schemas import LeadCreate, LeadResponse
import pytest

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_test_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = Session(bind=engine)
Base.metadata.create_all(bind=engine)

test_client = TestClient(router)

@pytest.fixture(autouse=True)
def override_get_db():
    yield TestingSessionLocal()

def test_create_lead(test_client: TestClient, override_get_db: Session):
    lead_data = LeadCreate(
        name='John Doe',
        email='john.doe@example.com',
        phone='1234567890',
        company='ABC Corp',
        source='web',
        priority='high',
        score=8.5,
        notes='Initial contact'
    )
    response = test_client.post('/leads', json=lead_data.dict())
    assert response.status_code == 201
    lead_response = LeadResponse(**response.json())
    assert lead_response.name == 'John Doe'
    assert lead_response.email == 'john.doe@example.com'

def test_get_lead(test_client: TestClient, override_get_db: Session):
    lead_data = LeadCreate(
        name='Jane Smith',
        email='jane.smith@example.com',
        phone='0987654321',
        company='XYZ Corp',
        source='referral',
        priority='medium',
        score=7.5,
        notes='Referral from friend'
    )
    response = test_client.post('/leads', json=lead_data.dict())
    lead_response = LeadResponse(**response.json())
    response = test_client.get(f'/leads/{lead_response.id}')
    assert response.status_code == 200
    retrieved_lead = LeadResponse(**response.json())
    assert retrieved_lead.name == 'Jane Smith'
    assert retrieved_lead.email == 'jane.smith@example.com'

def test_list_leads(test_client: TestClient, override_get_db: Session):
    lead_data1 = LeadCreate(
        name='Alice Johnson',
        email='alice.johnson@example.com',
        phone='1122334455',
        company='DEF Corp',
        source='direct',
        priority='low',
        score=6.0,
        notes='Direct contact'
    )
    lead_data2 = LeadCreate(
        name='Bob Brown',
        email='bob.brown@example.com',
        phone='5544332211',
        company='GHI Corp',
        source='web',
        priority='high',
        score=9.0,
        notes='Initial contact'
    )
    test_client.post('/leads', json=lead_data1.dict())
    test_client.post('/leads', json=lead_data2.dict())
    response = test_client.get('/leads')
    assert response.status_code == 200
    leads_response = [LeadResponse(**lead) for lead in response.json()]
    assert len(leads_response) == 2

def test_update_lead(test_client: TestClient, override_get_db: Session):
    lead_data = LeadCreate(
        name='Charlie Davis',
        email='charlie.davis@example.com',
        phone='1112223333',
        company='JKL Corp',
        source='referral',
        priority='medium',
        score=7.0,
        notes='Referral from friend'
    )
    response = test_client.post('/leads', json=lead_data.dict())
    lead_response = LeadResponse(**response.json())
    update_data = LeadUpdate(status='qualified')
    response = test_client.patch(f'/leads/{lead_response.id}', json=update_data.dict())
    assert response.status_code == 200
    updated_lead = LeadResponse(**response.json())
    assert updated_lead.status == 'qualified'

def test_delete_lead(test_client: TestClient, override_get_db: Session):
    lead_data = LeadCreate(
        name='David Evans',
        email='david.evans@example.com',
        phone='2233445566',
        company='MNO Corp',
        source='direct',
        priority='low',
        score=5.0,
        notes='Direct contact'
    )
    response = test_client.post('/leads', json=lead_data.dict())
    lead_response = LeadResponse(**response.json())
    response = test_client.delete(f'/leads/{lead_response.id}')
    assert response.status_code == 200
    assert response.json() == True