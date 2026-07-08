from sqlalchemy.orm import Session
from domain.models import Assignment

class AssignmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, assignment: Assignment):
        self.db.add(assignment)
        self.db.commit()
        self.db.refresh(assignment)
        return assignment