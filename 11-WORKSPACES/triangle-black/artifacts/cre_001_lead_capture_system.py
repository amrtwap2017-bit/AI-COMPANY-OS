# models.py
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

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
    lead_source: str  # Changed Enum to str

class LeadUpdateSchema(BaseModel):
    company_name: str = None
    contact_person: str = None
    email: str = None
    phone: str = None

class LeadSource(str, Enum):
    hotel_engineering = 'hotel_engineering'
    other = 'other'

# repository.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Lead

engine = create_engine('sqlite:///leads.db')
Session = sessionmaker(bind=engine)
session = Session()

def get_lead(id: int) -> Lead:
    return session.query(Lead).filter_by(id=id).first()

def get_all_leads() -> list[Lead]:
    return session.query(Lead).all()

def create_lead(data: LeadSchema) -> None:
    new_lead = Lead(
        company_name=data.company_name,
        contact_person=data.contact_person,
        email=data.email,
        phone=data.phone,
        lead_source=data.lead_source
    )
    session.add(new_lead)
    session.commit()

def update_lead(id: int, data: LeadUpdateSchema) -> None:
    existing_lead = get_lead(id)
    if existing_lead:
        for key, value in data.items():
            setattr(existing_lead, key, value)
        session.commit()