from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from application.services.sprint_plan_service import SprintPlanService
from infrastructure.repositories.sprint_plan_repository import get_sprint_plan_repo
from domain.models import SprintPlan
from core.schemas.sprint_plan import SprintPlanCreate

router = APIRouter()

@router.post('/orchestrator/plan-sprint/{workspace_id}', response_model=SprintPlan)
def plan_sprint(workspace_id: str, sprint_plan_data: SprintPlanCreate, session: Session = Depends(get_sprint_plan_repo)):
    sprint_plan_service = SprintPlanService(session)
    return sprint_plan_service.create_sprint_plan(sprint_plan_data.dict())