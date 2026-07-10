# conftest.py
import pytest
from sqlalchemy import text
from repository import session

@pytest.fixture
def db():
    with session() as s:
        yield s

@pytest.fixture
def mock_get_lead(db):
    def mock_get_lead(id):
        return Lead(
            id=id,
            company_name='Test Company',
            contact_person='John Doe',
            email='test@example.com',
            phone='1234567890',
            lead_source='hotel_engineering'
        )
    with db.begin():
        session.query(Lead).filter_by(id=1).delete()
    return mock_get_lead

@pytest.fixture
def mock_create_lead(db):
    def mock_create_lead(data):
        new_lead = Lead(
            company_name=data.company_name,
            contact_person=data.contact_person,
            email=data.email,
            phone=data.phone,
            lead_source=data.lead_source
        )
        session.add(new_lead)
        return new_lead

@pytest.fixture
def mock_update_lead(db):
    def mock_update_lead(id, data):
        existing_lead = Lead(
            id=id,
            company_name='Test Company',
            contact_person='John Doe',
            email='test@example.com',
            phone='1234567890',
            lead_source='hotel_engineering'
        )
        for key, value in data.items():
            setattr(existing_lead, key, value)
        session.commit()
    with db.begin():
        session.query(Lead).filter_by(id=1).delete()
    return mock_update_lead

# test_repository.py
import pytest
from repository import get_lead, get_all_leads, create_lead, update_lead
from models import Lead
from schemas import LeadSchema, LeadUpdateSchema
from conftest import db, mock_get_lead, mock_create_lead, mock_update_lead

def test_get_lead(db):
    lead = mock_get_lead(1)
    assert get_lead(1) == lead

def test_get_all_leads(db):
    for i in range(10):
        create_lead(mock_create_lead({'company_name': f'Test Company {i}', 'contact_person': f'John Doe {i}', 'email': f'test{i}@example.com', 'phone': f'1234567890{i}', 'lead_source': 'hotel_engineering'}))
    leads = get_all_leads()
    assert len(leads) == 10

def test_create_lead(db):
    lead = create_lead(mock_create_lead({'company_name': 'Test Company', 'contact_person': 'John Doe', 'email': 'test@example.com', 'phone': '1234567890', 'lead_source': 'hotel_engineering'}))
    assert lead.id == 1

def test_update_lead(db):
    update_lead(1, mock_update_lead({'company_name': 'Test Company Updated'}, {'contact_person': 'Jane Doe'}))
    lead = get_lead(1)
    assert lead.company_name == 'Test Company Updated'
    assert lead.contact_person == 'Jane Doe'

def test_get_lead_missing_id(db):
    with pytest.raises(ValueError):
        get_lead(None)

def test_create_lead_missing_fields(db):
    with pytest.raises(ValueError):
        create_lead(mock_create_lead({'company_name': 'Test Company', 'email': 'test@example.com', 'phone': '1234567890', 'lead_source': 'hotel_engineering'}))

def test_get_all_leads_empty(db):
    assert get_all_leads() == []

def test_update_lead_missing_id(db):
    with pytest.raises(ValueError):
        update_lead(None, mock_update_lead({'company_name': 'Test Company Updated'}, {'contact_person': 'Jane Doe'}))

def test_create_lead_invalid_data(db):
    with pytest.raises(ValueError):
        create_lead(mock_create_lead({'company_name': None, 'email': 'test@example.com', 'phone': '1234567890', 'lead_source': 'hotel_engineering'}))

def test_update_lead_invalid_data(db):
    update_lead(1, mock_update_lead({'company_name': None}, {'contact_person': 'Jane Doe'}))
    with pytest.raises(ValueError):
        get_lead(1)

# test_schemas.py
import pytest
from schemas import LeadSchema, LeadUpdateSchema

def test_lead_schema():
    lead_schema = LeadSchema(company_name='Test Company', contact_person='John Doe', email='test@example.com', phone='1234567890', lead_source='hotel_engineering')
    assert lead_schema.company_name == 'Test Company'
    assert lead_schema.contact_person == 'John Doe'
    assert lead_schema.email == 'test@example.com'
    assert lead_schema.phone == '1234567890'
    assert lead_schema.lead_source == 'hotel_engineering'

def test_lead_update_schema():
    lead_update_schema = LeadUpdateSchema(company_name='Test Company Updated', contact_person='Jane Doe')
    assert lead_update_schema.company_name is None
    assert lead_update_schema.contact_person == 'Jane Doe'

def test_lead_source_enum():
    with pytest.raises(ValueError):
        LeadSource('invalid')

# test_fastapi.py
import pytest
from fastapi.testclient import TestClient
from repository import get_all_leads

@pytest.fixture
def client():
    from main import app
    return TestClient(app)

def test_get_all_leads(client):
    response = client.get('/leads')
    assert response.status_code == 200
    assert len(response.json()) > 0