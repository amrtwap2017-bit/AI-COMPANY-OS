from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from domain.models.agent import AgentCreate, AgentUpdate, Agent
from application.services.agent import AgentService
from infrastructure.db.session import get_db

router = APIRouter()

@router.post("/agents", response_model=Agent)
def create_agent(agent: AgentCreate, db: Session = Depends(get_db), service: AgentService = Depends()):
    return service.create_agent(agent)

@router.get("/agents/{agent_id}", response_model=Agent)
def get_agent(agent_id: int, db: Session = Depends(get_db), service: AgentService = Depends()):
    agent = service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.put("/agents/{agent_id}", response_model=Agent)
def update_agent(agent_id: int, agent: AgentUpdate, db: Session = Depends(get_db), service: AgentService = Depends()):
    return service.update_agent(agent_id, agent)

@router.delete("/agents/{agent_id}")
def delete_agent(agent_id: int, db: Session = Depends(get_db), service: AgentService = Depends()):
    service.delete_agent(agent_id)
    return {"detail": "Agent deleted"}