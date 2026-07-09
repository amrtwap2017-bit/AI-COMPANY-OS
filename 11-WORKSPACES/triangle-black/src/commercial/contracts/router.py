"""
Contract FastAPI router — Triangle Black
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_agent, require_manager
from src.core.tenant import get_hotel_id
from src.commercial.auth.models import User
from .schemas import ContractCreate, ContractUpdate, ContractResponse
from .repository import ContractRepository

router = APIRouter(prefix="/contracts", tags=["contracts"])


@router.post("/", response_model=ContractResponse, status_code=201)
def create(
    payload: ContractCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return ContractRepository(db).create(data)


@router.get("/", response_model=List[ContractResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return ContractRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)


@router.get("/{contract_id}", response_model=ContractResponse)
def get(
    contract_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = ContractRepository(db).get(contract_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contract not found")
    return obj


@router.patch("/{contract_id}", response_model=ContractResponse)
def update(
    contract_id: str,
    payload: ContractUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = ContractRepository(db).update(
        contract_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Contract not found")
    return obj


@router.delete("/{contract_id}", status_code=204)
def delete(
    contract_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not ContractRepository(db).delete(contract_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="Contract not found")
