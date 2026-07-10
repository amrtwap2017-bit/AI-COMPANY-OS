"""
Agent FastAPI router — Triangle Black
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_agent, require_manager
from src.core.tenant import get_hotel_id
from src.commercial.auth.models import User
from .schemas import AgentCreate, AgentUpdate, AgentResponse
from .repository import AgentRepository

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("/", response_model=AgentResponse, status_code=201)
def create(
    payload: AgentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return AgentRepository(db).create(data)


@router.get("/", response_model=List[AgentResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return AgentRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)


@router.get("/{agent_id}", response_model=AgentResponse)
def get(
    agent_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = AgentRepository(db).get(agent_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Agent not found")
    return obj


@router.patch("/{agent_id}", response_model=AgentResponse)
def update(
    agent_id: str,
    payload: AgentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = AgentRepository(db).update(
        agent_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Agent not found")
    return obj


@router.delete("/{agent_id}", status_code=204)
def delete(
    agent_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not AgentRepository(db).delete(agent_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="Agent not found")
