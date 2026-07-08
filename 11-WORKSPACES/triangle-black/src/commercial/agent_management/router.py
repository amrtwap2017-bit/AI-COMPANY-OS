from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_manager
from src.commercial.auth.models import User
from .schemas import AgentCreate, AgentUpdate, AgentResponse
from .repository import AgentRepository

router = APIRouter(prefix="/agents", tags=["agents"])

@router.post("/", response_model=AgentResponse, status_code=201)
def create(payload: AgentCreate, db: Session = Depends(get_db),
           _: User = Depends(require_manager)):
    return AgentRepository(db).create(payload.model_dump())

@router.get("/", response_model=List[AgentResponse])
def list_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
             _: User = Depends(require_manager)):
    return AgentRepository(db).list(skip=skip, limit=limit)

@router.get("/{agent_id}", response_model=AgentResponse)
def get(agent_id: str, db: Session = Depends(get_db),
        _: User = Depends(require_manager)):
    obj = AgentRepository(db).get(agent_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Agent not found")
    return obj

@router.patch("/{agent_id}", response_model=AgentResponse)
def update(agent_id: str, payload: AgentUpdate, db: Session = Depends(get_db),
           _: User = Depends(require_manager)):
    obj = AgentRepository(db).update(agent_id, payload.model_dump(exclude_none=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Agent not found")
    return obj

@router.delete("/{agent_id}", status_code=204)
def delete(agent_id: str, db: Session = Depends(get_db),
           _: User = Depends(require_manager)):
    if not AgentRepository(db).delete(agent_id):
        raise HTTPException(status_code=404, detail="Agent not found")
