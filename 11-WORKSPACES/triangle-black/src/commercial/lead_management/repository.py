from sqlalchemy.orm import Session
from src.core.database import get_db
from .models import Lead

class LeadRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_lead(self, data: dict):
        lead = Lead(**data)
        self.db.add(lead)
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def get_lead(self, id: str):
        return self.db.query(Lead).filter(Lead.id == id).first()

    def list_leads(self, name: str = None, status: str = None):
        query = self.db.query(Lead)
        if name:
            query = query.filter(Lead.name.contains(name))
        if status:
            query = query.filter(Lead.status == status)
        return query.all()

    def update_lead(self, id: str, data: dict):
        lead = self.db.query(Lead).filter(Lead.id == id).first()
        if not lead:
            return None
        for key, value in data.items():
            setattr(lead, key, value)
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def delete_lead(self, id: str):
        lead = self.db.query(Lead).filter(Lead.id == id).first()
        if not lead:
            return None
        self.db.delete(lead)
        self.db.commit()
