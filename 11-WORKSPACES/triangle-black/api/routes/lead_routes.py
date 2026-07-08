from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from application.services.lead_service import LeadService
from infrastructure.repositories.lead_repository import LeadRepository
from infrastructure.database import async_session_factory
from domain.lead import Lead

router = APIRouter()

@router.get("/pipeline/recent", response_model=list[Lead])
def get_recent_leads(lead_repo: LeadRepository = Depends(LeadRepository), session: AsyncSession = Depends(async_session_factory)):
    lead_service = LeadService(lead_repo)
    return await lead_service.get_recent_leads()
