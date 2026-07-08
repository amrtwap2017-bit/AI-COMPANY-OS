from sqlalchemy.orm import Session
from domain.lead import Lead

class LeadRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_lead(self, lead_id: int) -> Lead:
        return self.db.query(Lead).filter(Lead.id == lead_id).first()

    def update_lead_qualification(self, lead_id: int, qualification_status: str) -> None:
        lead = self.get_lead(lead_id)
        if lead:
            lead.qualification_status = qualification_status
            self.db.commit()
            self.db.refresh(lead)