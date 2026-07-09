from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.commercial.agent_management.models import Agent
from src.commercial.agent_management.schemas import AgentCreate, AgentUpdate, AgentResponse
from src.commercial.agent_management.repository import AgentRepository


router = APIRouter()

@router.post("/agents", response_model=AgentResponse)
def create_agent(agent: AgentCreate, db: Session = Depends(get_db)) -> AgentResponse:
    agent_repo = AgentRepository(db)
    new_agent = agent_repo.create(agent.dict())
    return AgentResponse.from_orm(new_agent)

@router.get("/agents", response_model=list[AgentResponse])
def get_agents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> list[AgentResponse]:
    agent_repo = AgentRepository(db)
    agents = agent_repo.list(skip=skip, limit=limit)
    return [AgentResponse.from_orm(agent) for agent in agents]

@router.get("/agents/available", response_model=list[AgentResponse])
def get_available_agents(db: Session = Depends(get_db)) -> list[AgentResponse]:
    agent_repo = AgentRepository(db)
    available_agents = [agent for agent in agent_repo.list() if agent.current_load < agent.max_leads]
    return [AgentResponse.from_orm(agent) for agent in available_agents]

@router.get("/agents/{id}", response_model=AgentResponse)
def get_agent(id: str, db: Session = Depends(get_db)) -> AgentResponse:
    agent_repo = AgentRepository(db)
    agent = agent_repo.get(id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AgentResponse.from_orm(agent)

@router.put("/agents/{id}", response_model=AgentResponse)
def update_agent(id: str, agent_update: AgentUpdate, db: Session = Depends(get_db)) -> AgentResponse:
    agent_repo = AgentRepository(db)
    updated_agent = agent_repo.update(id, agent_update.dict())
    if not updated_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AgentResponse.from_orm(updated_agent)

@router.delete("/agents/{id}")
def delete_agent(id: str, db: Session = Depends(get_db)) -> None:
    agent_repo = AgentRepository(db)
    agent_repo.delete(id)