from sqlalchemy.orm import Session
from src.commercial.lead_management.models import Lead, LeadStatus, Priority, Source
from src.commercial.lead_management.schemas import LeadCreate, LeadUpdate

class LeadRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_lead(self, lead_data: LeadCreate) -> Lead:
        lead = Lead(**lead_data.dict())
        self.db.add(lead)
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def get_lead(self, lead_id: int) -> Optional[Lead]:
        return self.db.query(Lead).filter(Lead.id == lead_id).first()

    def list_leads(self) -> List[Lead]:
        return self.db.query(Lead).all()

    def update_lead(self, lead_id: int, lead_data: LeadUpdate) -> Optional[Lead]:
        lead = self.get_lead(lead_id)
        if not lead:
            return None
        for key, value in lead_data.dict(exclude_unset=True).items():
            setattr(lead, key, value)
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def delete_lead(self, lead_id: int) -> bool:
        lead = self.get_lead(lead_id)
        if not lead:
            return False
        self.db.delete(lead)
        self.db.commit()
        return True