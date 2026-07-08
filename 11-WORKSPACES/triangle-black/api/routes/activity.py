from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from application.services.activity_service import ActivityService
from infrastructure.repositories.activity_repository import get_activity_repository
from domain.models.activity import Activity

router = APIRouter()

@router.get("/activities", response_model=List[Activity])
def get_activities(service: ActivityService = Depends()):
    return service.get_all_activities()