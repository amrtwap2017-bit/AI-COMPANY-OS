from sqlalchemy.orm import Session
from domain.lead import Lead

class LeadRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, lead_id: int) -> Lead:
        return self.db.query(Lead).filter(Lead.id == lead_id).first()

    def update(self, lead: Lead) -> None:
        self.db.merge(lead)
        self.db.commit()