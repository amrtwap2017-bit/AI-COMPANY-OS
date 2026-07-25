from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

"""
PurchaseRequest FastAPI router — Triangle Black
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import PurchaseRequestCreate, PurchaseRequestUpdate, PurchaseRequestResponse
from .repository import PurchaseRequestRepository

router = APIRouter(prefix="/purchase-requests", tags=["purchase-requests"])

@router.post("/", response_model=PurchaseRequestResponse, status_code=201)
def create(
    payload: PurchaseRequestCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return PurchaseRequestRepository(db).create(data)

@router.get("/", response_model=List[PurchaseRequestResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return PurchaseRequestRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)

@router.get("/{pr_id}", response_model=PurchaseRequestResponse)
def get(
    pr_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = PurchaseRequestRepository(db).get(pr_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="PurchaseRequest not found")
    return obj

@router.patch("/{pr_id}", response_model=PurchaseRequestResponse)
def update(
    pr_id: str,
    payload: PurchaseRequestUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = PurchaseRequestRepository(db).update(
        pr_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="PurchaseRequest not found")
    return obj

@router.delete("/{pr_id}", status_code=204)
def delete(
    pr_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not PurchaseRequestRepository(db).delete(pr_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="PurchaseRequest not found")

# ── S69-02: Purchase Request Approval Workflow ──

@router.post("/{pr_id}/approve", status_code=200)
def approve(
    pr_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    try:
        pr = PurchaseRequestRepository(db).get(pr_id, hotel_id=hotel_id)
        if not pr:
            raise HTTPException(status_code=404, detail="PurchaseRequest not found")

        current_state = pr.status
        target_state = "approved"

        if current_state not in ["draft", "submitted"]:
            raise HTTPException(status_code=400, detail=f"Invalid transition from {current_state} to {target_state}")

        pr.status = target_state
        pr.approved_by = payload.approved_by
        pr.approved_at = datetime.now()

        db.commit()
        db.refresh(pr)

        return {"success": True, "pr_id": pr.id, "status": pr.status, "message": f"PurchaseRequest {pr.id} approved"}
    except AttributeError:
        pr.status = target_state
        db.commit()
        db.refresh(pr)
        return {"success": True, "pr_id": pr.id, "status": pr.status, "message": f"PurchaseRequest {pr.id} approved"}

@router.post("/{pr_id}/reject", status_code=200)
def reject(
    pr_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    try:
        pr = PurchaseRequestRepository(db).get(pr_id, hotel_id=hotel_id)
        if not pr:
            raise HTTPException(status_code=404, detail="PurchaseRequest not found")

        current_state = pr.status
        target_state = "rejected"

        if current_state != "submitted":
            raise HTTPException(status_code=400, detail=f"Invalid transition from {current_state} to {target_state}")

        pr.status = target_state
        pr.rejected_by = payload.rejected_by
        pr.reason = payload.reason

        db.commit()
        db.refresh(pr)

        return {"success": True, "pr_id": pr.id, "status": pr.status, "message": f"PurchaseRequest {pr.id} rejected"}
    except AttributeError:
        pr.status = target_state
        db.commit()
        db.refresh(pr)
        return {"success": True, "pr_id": pr.id, "status": pr.status, "message": f"PurchaseRequest {pr.id} rejected"}

@router.get("/{pr_id}/status", status_code=200)
def get_status(
    pr_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    try:
        pr = PurchaseRequestRepository(db).get(pr_id, hotel_id=hotel_id)
        if not pr:
            raise HTTPException(status_code=404, detail="PurchaseRequest not found")

        allowed_transitions = PR_TRANSITIONS.get(pr.status, [])

        return {
            "status": pr.status,
            "allowed_transitions": allowed_transitions,
            "title": pr.title
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))