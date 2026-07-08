from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.commercial.lead_management.models import LeadStatus, Priority, Source
from src.commercial.lead_management.repository import LeadRepository
from src.commercial.lead_management.schemas import LeadCreate, LeadUpdate, LeadResponse
from src.database import get_db

router = APIRouter()

@router.post('/leads', response_model=LeadResponse)
def create_lead(lead_data: LeadCreate, db: Session = Depends(get_db)) -> LeadResponse:
    lead_repo = LeadRepository(db)
    new_lead = lead_repo.create_lead(lead_data)
    return LeadResponse.from_orm(new_lead)

@router.get('/leads/{lead_id}', response_model=LeadResponse)
def get_lead(lead_id: int, db: Session = Depends(get_db)) -> LeadResponse:
    lead_repo = LeadRepository(db)
    lead = lead_repo.get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail='Lead not found')
    return LeadResponse.from_orm(lead)

@router.get('/leads', response_model=list[LeadResponse])
def list_leads(db: Session = Depends(get_db)) -> list[LeadResponse]:
    lead_repo = LeadRepository(db)
    leads = lead_repo.list_leads()
    return [LeadResponse.from_orm(lead) for lead in leads]

@router.patch('/leads/{lead_id}', response_model=LeadResponse)
def update_lead(lead_id: int, lead_data: LeadUpdate, db: Session = Depends(get_db)) -> LeadResponse:
    lead_repo = LeadRepository(db)
    updated_lead = lead_repo.update_lead(lead_id, lead_data)
    if not updated_lead:
        raise HTTPException(status_code=404, detail='Lead not found')
    return LeadResponse.from_orm(updated_lead)

@router.delete('/leads/{lead_id}', response_model=bool)
def delete_lead(lead_id: int, db: Session = Depends(get_db)) -> bool:
    lead_repo = LeadRepository(db)
    deleted = lead_repo.delete_lead(lead_id)
    if not deleted:
        raise HTTPException(status_code=404, detail='Lead not found')
    return deleted