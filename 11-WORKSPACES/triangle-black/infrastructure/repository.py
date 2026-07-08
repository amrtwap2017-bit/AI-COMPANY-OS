from sqlalchemy.orm import Session
from domain.lead import Lead

class LeadRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Lead]:
        return self.db.query(Lead).all()
