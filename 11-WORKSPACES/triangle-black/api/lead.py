from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from domain.lead import Lead
from application.repository import LeadRepository
from application.service import LeadService
from infrastructure.db import get_db

router = APIRouter()

@router.put('/leads/{lead_id}/qualification', response_model=Lead)
async def update_lead_qualification(lead_id: int, qualification_status: str, db: Session = Depends(get_db)):
    lead_service = LeadService(LeadRepository(db))
    try:
        lead_service.update_lead_qualification(lead_id, qualification_status)
        return lead_service.repository.get_lead(lead_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))