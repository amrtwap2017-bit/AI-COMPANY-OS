from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from application.services.lead_service import LeadService
from domain.models import Lead
from infrastructure.database import get_async_session

router = APIRouter()

@router.post('/leads', response_model=Lead)
async def create_lead(lead_data: Lead, session: AsyncSession = Depends(get_async_session), lead_service: LeadService = Depends()):
    return await lead_service.create_lead(lead_data)

@router.get('/leads', response_model=List[Lead])
async def get_leads(session: AsyncSession = Depends(get_async_session), lead_service: LeadService = Depends()):
    return await lead_service.get_leads()

@router.get('/leads/{lead_id}', response_model=Lead)
async def get_lead_by_id(lead_id: int, session: AsyncSession = Depends(get_async_session), lead_service: LeadService = Depends()):
    lead = await lead_service.get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail='Lead not found')
    return lead

@router.put('/leads/{lead_id}', response_model=Lead)
async def update_lead(lead_id: int, lead_data: Lead, session: AsyncSession = Depends(get_async_session), lead_service: LeadService = Depends()):
    updated_lead = await lead_service.update_lead(lead_id, lead_data)
    if not updated_lead:
        raise HTTPException(status_code=404, detail='Lead not found')
    return updated_lead

@router.delete('/leads/{lead_id}', response_model=bool)
async def delete_lead(lead_id: int, session: AsyncSession = Depends(get_async_session), lead_service: LeadService = Depends()):
    return await lead_service.delete_lead(lead_id)
