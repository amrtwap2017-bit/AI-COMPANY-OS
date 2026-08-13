from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .repository import LeadRepository
from .schemas import LeadCreate, LeadUpdate, LeadResponse

router = APIRouter()

@router.post('/', status_code=201)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db), hotel_id: str = Depends(get_hotel_id)):
    payload.hotel_id = hotel_id
    lead_repo = LeadRepository(db)
    new_lead = lead_repo.create_lead(payload.dict())
    return new_lead.__dict__ if hasattr(new_lead, '__dict__') else new_lead

@router.get('/')
def list_leads(name: str = None, status: str = None, db: Session = Depends(get_db), hotel_id: str = Depends(get_hotel_id)):
    lead_repo = LeadRepository(db)
    leads = lead_repo.list_leads(name=name, status=status)
    if not leads: return []
    return [lead.__dict__ for lead in leads] if hasattr(leads[0], '__dict__') else leads
