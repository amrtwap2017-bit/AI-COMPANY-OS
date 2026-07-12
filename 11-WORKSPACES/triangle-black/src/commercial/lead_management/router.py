from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .repository import LeadRepository
from .schemas import LeadCreate, LeadUpdate, LeadResponse

router = APIRouter()

@router.post('/', response_model=LeadResponse, status_code=201)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db), hotel_id: str = Depends(get_hotel_id)):
    payload.hotel_id = hotel_id
    lead_repo = LeadRepository(db)
    new_lead = lead_repo.create_lead(payload.dict())
    return {'data': new_lead}

@router.get('/', response_model=list[LeadResponse])
def list_leads(name: str = None, status: str = None, db: Session = Depends(get_db), hotel_id: str = Depends(get_hotel_id)):
    lead_repo = LeadRepository(db)
    leads = lead_repo.list_leads(name=name, status=status)
    return {'data': leads}

@router.put('/{id}', response_model=LeadResponse)
def update_lead(id: str, payload: LeadUpdate, db: Session = Depends(get_db), hotel_id: str = Depends(get_hotel_id)):
    lead_repo = LeadRepository(db)
    updated_lead = lead_repo.update_lead(id, payload.dict())
    if not updated_lead:
        raise HTTPException(status_code=404, detail='Lead not found')
    return {'data': updated_lead}

@router.delete('/{id}', status_code=204)
def delete_lead(id: str, db: Session = Depends(get_db), hotel_id: str = Depends(get_hotel_id)):
    lead_repo = LeadRepository(db)
    deleted_lead = lead_repo.delete_lead(id)
    if not deleted_lead:
        raise HTTPException(status_code=404, detail='Lead not found')
