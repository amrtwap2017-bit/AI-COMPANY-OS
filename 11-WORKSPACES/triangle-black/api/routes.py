from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from application.services import LeadStatusService
from infrastructure.repositories import LeadStatusRepository
from domain.models import LeadStatusChange

router = APIRouter()

@router.post("/leads/status", response_model=LeadStatusChange)
async def log_lead_status_change(change: LeadStatusChange, db: Session = Depends(get_db), service: LeadStatusService = Depends()):
    try:
        service.log_status_change(change)
        return change
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))