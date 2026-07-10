# models.py
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Lead(Base):
    __tablename__ = 'leads'
    id = Column(Integer, primary_key=True)
    company_name = Column(String)
    contact_person = Column(String)
    email = Column(String)
    phone = Column(String)
    lead_source = Column(Enum('hotel_engineering', 'other'))
    created_at = Column(DateTime, default=datetime.utcnow)

# schemas.py
from pydantic import BaseModel


class LeadSchema(BaseModel):
    company_name: str
    contact_person: str
    email: str
    phone: str
    lead_source: Enum['LeadSource']

class LeadUpdateSchema(BaseModel):
    company_name: str = None
    contact_person: str = None
    email: str = None
    phone: str = None

class LeadSource(str, Enum):
    hotel_engineering = 'hotel_engineering'
    other = 'other'

# repository.py
from models import Lead
from sqlalchemy import create_engine

engine = create_engine('sqlite:///leads.db')
Session = sessionmaker(bind=engine)

def get_session():
    return Session()

def get_lead(id: int):
    session = get_session()
    lead = session.query(Lead).filter_by(id=id).first()
    return lead

def create_lead(data: LeadSchema):
    session = get_session()
    new_lead = Lead(**data.dict())
    session.add(new_lead)
    session.commit()
    return new_lead

def update_lead(id: int, data: LeadUpdateSchema):
    session = get_session()
    lead = get_lead(id)
    if lead:
        for key, value in data.dict().items():
            if key != 'id':
                setattr(lead, key, value)
        session.commit()
    return lead

def delete_lead(id: int):
    session = get_session()
    lead = get_lead(id)
    if lead:
        session.delete(lead)
        session.commit()

# service.py
from repository import create_lead, delete_lead, get_session, update_lead


class LeadService:
    def __init__(self):
        self.session = get_session()

    def calculate_lead_score(self, lead: Lead):
        # implement scoring logic here
        pass

    def qualify_lead(self, lead: Lead):
        # implement qualification logic here
        pass

    def create_lead(self, data: LeadSchema):
        return create_lead(data)

    def update_lead(self, id: int, data: LeadUpdateSchema):
        return update_lead(id, data)

    def delete_lead(self, id: int):
        return delete_lead(id)

# router.py
from fastapi import FastAPI, HTTPException
from service import LeadService

app = FastAPI()

lead_service = LeadService()

@app.get('/leads')
def get_leads():
    session = lead_service.session
    leads = session.query(Lead).all()
    return {'data': [lead.dict() for lead in leads]}

@app.get('/leads/{id}')
def get_lead(id: int):
    try:
        lead = lead_service.get_lead(id)
        if not lead:
            raise HTTPException(status_code=404, detail='Lead not found')
        return {'data': lead.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/leads')
def create_lead(data: LeadSchema):
    try:
        new_lead = lead_service.create_lead(data)
        return {'data': new_lead.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put('/leads/{id}')
def update_lead(id: int, data: LeadUpdateSchema):
    try:
        updated_lead = lead_service.update_lead(id, data)
        if not updated_lead:
            raise HTTPException(status_code=404, detail='Lead not found')
        return {'data': updated_lead.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete('/leads/{id}')
def delete_lead(id: int):
    try:
        lead_service.delete_lead(id)
        return {'message': 'Lead deleted successfully'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
