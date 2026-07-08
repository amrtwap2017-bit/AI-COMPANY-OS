from domain.lead import Lead, LeadCreate, LeadUpdate
from sqlalchemy.orm import Session
from typing import List

class ILeadRepository:
    def get_all(self, db: Session) -> List[Lead]:
        pass

    def create(self, db: Session, lead_create: LeadCreate) -> Lead:
        pass

    def update(self, db: Session, lead_id: int, lead_update: LeadUpdate) -> Lead:
        pass

    def delete(self, db: Session, lead_id: int) -> None:
        pass

class LeadRepository(ILeadRepository):
    def get_all(self, db: Session) -> List[Lead]:
        return db.query(Lead).all()

    def create(self, db: Session, lead_create: LeadCreate) -> Lead:
        lead = Lead(**lead_create.dict())
        db.add(lead)
        db.commit()
        db.refresh(lead)
        return lead

    def update(self, db: Session, lead_id: int, lead_update: LeadUpdate) -> Lead:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise Exception("Lead not found")
        for key, value in lead_update.dict().items():
            setattr(lead, key, value)
        db.commit()
        db.refresh(lead)
        return lead

    def delete(self, db: Session, lead_id: int) -> None:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise Exception("Lead not found")
        db.delete(lead)
        db.commit()

class ILeadService:
    def get_all(self, db: Session) -> List[Lead]:
        pass

    def create(self, db: Session, lead_create: LeadCreate) -> Lead:
        pass

    def update(self, db: Session, lead_id: int, lead_update: LeadUpdate) -> Lead:
        pass

    def delete(self, db: Session, lead_id: int) -> None:
        pass

class LeadService(ILeadService):
    def __init__(self, repository: ILeadRepository):
        self.repository = repository

    def get_all(self, db: Session) -> List[Lead]:
        return self.repository.get_all(db)

    def create(self, db: Session, lead_create: LeadCreate) -> Lead:
        return self.repository.create(db, lead_create)

    def update(self, db: Session, lead_id: int, lead_update: LeadUpdate) -> Lead:
        return self.repository.update(db, lead_id, lead_update)

    def delete(self, db: Session, lead_id: int) -> None:
        self.repository.delete(db, lead_id)