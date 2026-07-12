from sqlalchemy.orm import Session
from domain.models import SprintPlan

def get_sprint_plan_repo(db: Session):
    return db.query(SprintPlan)
