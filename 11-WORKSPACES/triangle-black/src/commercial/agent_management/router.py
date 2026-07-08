"""
Agent FastAPI router
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from .schemas import AgentCreate, AgentUpdate, AgentResponse
from .repository import AgentRepository

router = APIRouter(prefix="/agents", tags=["agents"])


def get_db():
    """Dependency — override in app startup."""
    raise NotImplementedError("Configure DB session in app factory")


@router.post("/", response_model=AgentResponse, status_code=201)
def create_agent(payload: AgentCreate, db: Session = Depends(get_db)):
    repo = AgentRepository(db)
    return repo.create(payload.model_dump())


@router.get("/", response_model=List[AgentResponse])
def list_agents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = AgentRepository(db)
    return repo.list(skip=skip, limit=limit)


@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: str, db: Session = Depends(get_db)):
    repo = AgentRepository(db)
    obj = repo.get(agent_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Agent not found")
    return obj


@router.patch("/{agent_id}", response_model=AgentResponse)
def update_agent(agent_id: str, payload: AgentUpdate, db: Session = Depends(get_db)):
    repo = AgentRepository(db)
    obj = repo.update(agent_id, payload.model_dump(exclude_none=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Agent not found")
    return obj


@router.delete("/{agent_id}", status_code=204)
def delete_agent(agent_id: str, db: Session = Depends(get_db)):
    repo = AgentRepository(db)
    if not repo.delete(agent_id):
        raise HTTPException(status_code=404, detail="Agent not found")
