from sqlalchemy.orm import Session
from application.services.base_service import BaseService
from infrastructure.repositories.sprint_plan_repository import get_sprint_plan_repo
from domain.models import SprintPlan

class SprintPlanService(BaseService):
    def __init__(self, session: Session):
        super().__init__(session)

    def create_sprint_plan(self, sprint_plan_data: dict) -> SprintPlan:
        sprint_plan = SprintPlan(**sprint_plan_data)
        self.session.add(sprint_plan)
        self.session.commit()
        self.session.refresh(sprint_plan)
        return sprint_plan