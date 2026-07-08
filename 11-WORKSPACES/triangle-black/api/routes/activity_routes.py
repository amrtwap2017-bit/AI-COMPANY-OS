from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from application.services.activity_service import ActivityService
from infrastructure.repositories.activity_repository import get_activity_repository
from domain.models import Activity

router = APIRouter()

@router.get('/leads/{id}/activities', response_model=list[Activity])
def get_activity_history(id: int, repository: ActivityRepository = Depends(get_activity_repository)):
    service = ActivityService(repository)
    return await service.get_activity_history(id)