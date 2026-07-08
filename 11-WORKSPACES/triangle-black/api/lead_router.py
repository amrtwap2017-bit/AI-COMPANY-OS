from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from application.lead_service import LeadService
from infrastructure.database import get_db
from domain.lead import Lead

router = APIRouter()

@router.get("/leads/export", response_model=list[Lead])
def export_leads(service: LeadService = Depends()):
    return service.get_all_leads()
