from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

from datetime import datetime, timedelta

from datetime import datetime, timedelta
"""
Contract FastAPI router — Triangle Black
"""
from typing import List, Optional
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import ContractCreate, ContractUpdate, ContractResponse
from .repository import ContractRepository
from src.commercial.contracts.models import Contract
from src.commercial.invoices.models import Invoice

router = APIRouter(prefix="/contracts", tags=["contracts"])

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

# ── helpers ───────────────────────────────────────────────────────────────────

def _next_invoice_number(db: Session) -> str:
    """Generate next sequential invoice number: TB-INV-YYYYMM-XXXX"""
    now = datetime.utcnow()
    prefix = f"TB-INV-{now.strftime('%Y%m')}-"
    count = (
        db.query(Invoice)
        .filter(Invoice.invoice_number.like(f"{prefix}%"))
        .count()
    )
    return f"{prefix}{str(count + 1).zfill(4)}"

def _create_invoice_for_contract(db: Session, contract: Contract,
                                  hotel_id: str, renewal_number: int = 0) -> Invoice:
    """Auto-create an invoice for a contract."""
    amount      = contract.total_value
    tax_amount  = round(amount * 0.14, 2)
    total_amount = round(amount + tax_amount, 2)
    now         = datetime.utcnow()
    due_date    = now + timedelta(days=30)

    inv = Invoice(
        id             = str(uuid.uuid4()),
        hotel_id       = hotel_id,
        invoice_number = _next_invoice_number(db),
        contract_id    = contract.id,
        lead_id        = contract.lead_id,
        title          = f"Annual Contract Invoice — {contract.title}",
        amount         = amount,
        tax_amount     = tax_amount,
        total_amount   = total_amount,
        status         = "draft",
        issue_date     = now,
        due_date       = due_date,
        renewal_number = renewal_number,
        created_at     = now,
        updated_at     = now,
    )
    db.add(inv)
    return inv

# ── CRUD ──────────────────────────────────────────────────────────────────────

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

# ── ACTIVATE ──────────────────────────────────────────────────────────────────

@router.post("/{contract_id}/activate", response_model=ContractResponse)
def activate(
    contract_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """
    Activate a pending_signature contract.
    Sets status=active, calculates dates, auto-creates invoice.
    """
    contract = (
        db.query(Contract)
        .filter(Contract.id == contract_id, Contract.hotel_id == hotel_id)
        .first()
    )
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract.status != "pending_signature":
        raise HTTPException(
            status_code=400,
            detail=f"Contract is '{contract.status}', must be 'pending_signature' to activate"
        )

    now = datetime.utcnow()
    contract.status     = "active"
    contract.start_date = now
    contract.end_date   = now + relativedelta(months=contract.duration_months or 12)
    contract.updated_at = now

    # Auto-create invoice
    invoice = _create_invoice_for_contract(db, contract, hotel_id, renewal_number=0)

    db.commit()
    db.refresh(contract)

    return contract

# ── RENEW ─────────────────────────────────────────────────────────────────────

class RenewIn(BaseModel):
    duration_months: Optional[int] = None  # override duration, defaults to same

@router.post("/{contract_id}/renew", response_model=ContractResponse)
def renew(
    contract_id: str,
    payload: RenewIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """
    Renew an active contract.
    Creates a new contract with renewal_count+1 and auto-creates invoice.
    """
    old = (
        db.query(Contract)
        .filter(Contract.id == contract_id, Contract.hotel_id == hotel_id)
        .first()
    )
    if not old:
        raise HTTPException(status_code=404, detail="Contract not found")
    if old.status != "active":
        raise HTTPException(
            status_code=400,
            detail=f"Contract is '{old.status}', must be 'active' to renew"
        )

    now            = datetime.utcnow()
    duration       = payload.duration_months or old.duration_months or 12
    new_start      = old.end_date or now
    new_end        = new_start + relativedelta(months=duration)
    renewal_number = (old.renewal_count or 0) + 1

    new_contract = Contract(
        id              = str(uuid.uuid4()),
        hotel_id        = hotel_id,
        quote_id        = old.quote_id,
        lead_id         = old.lead_id,
        title           = old.title,
        description     = old.description,
        services        = old.services,
        total_value     = old.total_value,
        monthly_value   = old.monthly_value,
        status          = "active",
        start_date      = new_start,
        end_date        = new_end,
        duration_months = duration,
        renewal_count   = renewal_number,
        notes           = old.notes,
        created_at      = now,
        updated_at      = now,
    )
    db.add(new_contract)

    # Mark old contract as expired
    old.status     = "expired"
    old.updated_at = now

    # Auto-create invoice for new contract
    _create_invoice_for_contract(db, new_contract, hotel_id, renewal_number=renewal_number)

    db.commit()
    db.refresh(new_contract)

    return new_contract
