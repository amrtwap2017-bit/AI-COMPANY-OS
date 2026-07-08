from __future__ import annotations
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.core.auth import require_agent, require_manager
from src.commercial.auth.models import User
from src.commercial.contracts.models import Contract
from src.commercial.contracts.repository import ContractRepository
from src.commercial.contracts.schemas import ContractResponse, ContractUpdate
from src.commercial.quotation.models import Quote
from src.commercial.activity_tracking.models import Activity
import uuid

router = APIRouter(prefix="/contracts", tags=["contracts"])


class ActivateIn(BaseModel):
    start_date: Optional[datetime] = None
    notes: Optional[str] = None


class RenewIn(BaseModel):
    duration_months: int = 12
    notes: Optional[str] = None


@router.get("/", response_model=List[ContractResponse])
def list_contracts(
    skip: int = 0, limit: int = 100, status: str = "",
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
):
    return ContractRepository(db).list(
        skip=skip, limit=limit, status=status or None
    )


@router.get("/{contract_id}", response_model=ContractResponse)
def get_contract(
    contract_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
):
    c = ContractRepository(db).get(contract_id)
    if not c:
        raise HTTPException(status_code=404, detail="Contract not found")
    return c


@router.patch("/{contract_id}", response_model=ContractResponse)
def update_contract(
    contract_id: str,
    payload: ContractUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    c = ContractRepository(db).update(
        contract_id, payload.model_dump(exclude_none=True)
    )
    if not c:
        raise HTTPException(status_code=404, detail="Contract not found")
    return c


@router.post("/{contract_id}/activate", response_model=ContractResponse)
def activate_contract(
    contract_id: str,
    payload: ActivateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager),
):
    c = ContractRepository(db).get(contract_id)
    if not c:
        raise HTTPException(status_code=404, detail="Contract not found")
    if c.status != "pending_signature":
        raise HTTPException(
            status_code=400,
            detail=f"Contract is '{c.status}', must be 'pending_signature'"
        )

    start = payload.start_date or datetime.utcnow()
    end = start + timedelta(days=30 * c.duration_months)

    c.status = "active"
    c.start_date = start
    c.end_date = end
    c.updated_at = datetime.utcnow()
    if payload.notes:
        c.notes = payload.notes

    db.add(Activity(
        id=str(uuid.uuid4()),
        lead_id=c.lead_id,
        type="contract_activated",
        description=(
            f"Contract '{c.title}' ACTIVATED by {current_user.email}. "
            f"Start: {start.strftime('%Y-%m-%d')}. "
            f"End: {end.strftime('%Y-%m-%d')}. "
            f"Value: EGP {c.total_value:,.2f}"
        ),
        actor=current_user.email,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    ))
    db.commit()
    db.refresh(c)
    return c


@router.post("/{contract_id}/renew", response_model=ContractResponse)
def renew_contract(
    contract_id: str,
    payload: RenewIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager),
):
    c = ContractRepository(db).get(contract_id)
    if not c:
        raise HTTPException(status_code=404, detail="Contract not found")
    if c.status != "active":
        raise HTTPException(
            status_code=400, detail="Only active contracts can be renewed"
        )

    new_start = c.end_date or datetime.utcnow()
    new_end = new_start + timedelta(days=30 * payload.duration_months)

    c.status = "renewed"
    c.end_date = new_end
    c.duration_months = payload.duration_months
    c.renewal_count += 1
    c.updated_at = datetime.utcnow()

    db.add(Activity(
        id=str(uuid.uuid4()),
        lead_id=c.lead_id,
        type="contract_renewed",
        description=(
            f"Contract '{c.title}' RENEWED by {current_user.email}. "
            f"Renewal #{c.renewal_count}. "
            f"New end: {new_end.strftime('%Y-%m-%d')}."
        ),
        actor=current_user.email,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    ))
    db.commit()
    db.refresh(c)
    return c
