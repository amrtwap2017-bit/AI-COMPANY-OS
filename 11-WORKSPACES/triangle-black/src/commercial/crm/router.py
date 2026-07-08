from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.security import get_current_user, require_roles
from src.commercial.crm.models import Agent
from src.commercial.crm.schemas import LeadCreate, LeadUpdate, LeadStatusUpdate, LeadResponse, AgentCreate, AgentResponse, ActivityResponse, QualificationResult, PipelineSummary
from src.commercial.crm.service import LeadService

router = APIRouter(prefix="/crm", tags=["CRM"])

@router.post("/agents", response_model=AgentResponse, status_code=201)
def create_agent(payload: AgentCreate, db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    agent = Agent(**payload.model_dump())
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@router.get("/agents", response_model=list[AgentResponse])
def list_agents(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Agent).filter(Agent.is_active == "true").all()

@router.post("/leads", response_model=LeadResponse, status_code=201)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return LeadService(db).create(payload, actor=user.email)

@router.get("/leads", response_model=list[LeadResponse])
def list_leads(
    status: str | None = None,
    source: str | None = None,
    agent_id: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return LeadService(db).list(status=status, source=source, agent_id=agent_id, skip=skip, limit=limit)

@router.get("/leads/search", response_model=list[LeadResponse])
def search_leads(q: str = Query(..., min_length=2), db: Session = Depends(get_db), _=Depends(get_current_user)):
    return LeadService(db).search(q)

@router.get("/leads/pipeline", response_model=PipelineSummary)
def pipeline_summary(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return LeadService(db).pipeline_summary()

@router.get("/leads/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return LeadService(db).get(lead_id)

@router.put("/leads/{lead_id}/status", response_model=LeadResponse)
def update_status(lead_id: str, payload: LeadStatusUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return LeadService(db).update_status(lead_id, payload, actor=user.email)

@router.post("/leads/{lead_id}/qualify", response_model=QualificationResult)
def qualify_lead(lead_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return LeadService(db).qualify(lead_id, actor=user.email)

@router.post("/leads/{lead_id}/assign", response_model=LeadResponse)
def assign_lead(lead_id: str, agent_id: str | None = None, db: Session = Depends(get_db), user=Depends(require_roles("admin", "manager"))):
    return LeadService(db).assign(lead_id, agent_id=agent_id, actor=user.email)

@router.get("/leads/{lead_id}/activities", response_model=list[ActivityResponse])
def lead_activities(lead_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    svc = LeadService(db)
    lead = svc.get(lead_id)
    return lead.activities
