from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from application.services.workload_service import WorkloadService
from infrastructure.repositories.workload_repository import WorkloadRepository
from infrastructure.db.models import session_factory

router = APIRouter()

@router.post("/assign_lead")
def assign_lead(agent_id: int, db: AsyncSession = Depends(session_factory)):
    repository = WorkloadRepository(db)
    service = WorkloadService(repository)
    return await service.assign_lead(agent_id)