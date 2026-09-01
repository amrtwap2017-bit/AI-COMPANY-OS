from fastapi import APIRouter, Depends, HTTPException
from src.core.auth import require_manager
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .repository import LeadRepository
from .schemas import LeadCreate, LeadUpdate, LeadResponse
from src.core.audit import audit_create
from src.core.auth import get_current_user

router = APIRouter()

@router.post('/', status_code=201, dependencies=[Depends(get_current_user)])
def create_lead(payload: LeadCreate, db: Session = Depends(get_db), hotel_id: str = Depends(get_hotel_id)):
    payload.hotel_id = hotel_id
    lead_repo = LeadRepository(db)
    new_lead = lead_repo.create_lead(payload.dict())
    safe_keys = ["id","hotel_id","name","company","phone","email","source","priority","status","score","notes","agent_id","created_at","updated_at"]
    result = {k: str(v) if hasattr(v,"isoformat") else v for k,v in new_lead.__dict__.items() if k in safe_keys}
    try:
        audit_create(db, "lead", result.get("id", ""),
                     hotel_id=hotel_id,
                     metadata={"name": result.get("name"), "source": result.get("source"), "priority": result.get("priority")})
    except Exception:
        pass
    return result

@router.get('/')
def list_leads(name: str = None, status: str = None, db: Session = Depends(get_db), hotel_id: str = Depends(get_hotel_id), current_user=Depends(require_manager)):
    lead_repo = LeadRepository(db)
    leads = lead_repo.list_leads(name=name, status=status)
    if not leads: return []
    safe_keys = ["id","hotel_id","name","company","phone","email","source","priority","status","score","notes","agent_id","created_at","updated_at"]
    return [{k: str(v) if hasattr(v,"isoformat") else v for k,v in lead.__dict__.items() if k in safe_keys} for lead in leads]
