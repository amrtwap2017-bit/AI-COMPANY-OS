"""
Approval Requests router — Triangle Black
Backed by: approval_requests table
Supports: SOW, RFQ, PO approval workflow
"""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id
import uuid

router = APIRouter(prefix="/approval-requests", tags=["approval-requests"])


@router.get("/")
def list_approvals(
    status: str = None,
    document_type: str = None,
    limit: int = 100,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    q = "SELECT * FROM approval_requests WHERE 1=1"
    params = {}
    if status:
        q += " AND status = :status"
        params["status"] = status
    if document_type:
        q += " AND document_type = :document_type"
        params["document_type"] = document_type
    q += " ORDER BY created_at DESC LIMIT :limit"
    params["limit"] = limit
    rows = db.execute(text(q), params).fetchall()
    return [dict(r._mapping) for r in rows]


@router.get("/pending")
def list_pending_approvals(db: Session = Depends(get_db)):
    rows = db.execute(
        text("SELECT * FROM approval_requests WHERE status = 'pending' ORDER BY requested_at ASC"),
        {}
    ).fetchall()
    return [dict(r._mapping) for r in rows]


@router.get("/{request_id}")
def get_approval(request_id: str, db: Session = Depends(get_db)):
    row = db.execute(
        text("SELECT * FROM approval_requests WHERE id = :id"),
        {"id": request_id}
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Approval request not found")
    return dict(row._mapping)


@router.post("/{request_id}/approve")
def approve_request(request_id: str, payload: dict, db: Session = Depends(get_db)):
    row = db.execute(
        text("SELECT * FROM approval_requests WHERE id = :id"),
        {"id": request_id}
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Approval request not found")
    ar = dict(row._mapping)
    if ar["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot approve — current status: {ar['status']}")
    approved_by = payload.get("approved_by", "admin")
    # Update approval request
    db.execute(text("""
        UPDATE approval_requests
        SET status = 'approved', approved_by = :by, approved_at = NOW()
        WHERE id = :id
    """), {"by": approved_by, "id": request_id})
    # Update source document
    doc_type = ar["document_type"]
    doc_id = ar["document_id"]
    if doc_type == "sow":
        db.execute(text("""
            UPDATE scope_of_work SET status = 'approved', approved_by = :by, approved_at = NOW(), updated_at = NOW()
            WHERE id = :id
        """), {"by": approved_by, "id": doc_id})
    elif doc_type == "po":
        db.execute(text("""
            UPDATE purchase_orders SET status = 'approved', approved_by = :by, approved_at = NOW(), updated_at = NOW()
            WHERE id = :id
        """), {"by": approved_by, "id": doc_id})
    elif doc_type == "rfq":
        db.execute(text("""
            UPDATE rfqs SET status = 'sent', updated_at = NOW() WHERE id = :id
        """), {"id": doc_id})
    db.commit()
    return {"status": "approved", "request_id": request_id, "document_type": doc_type, "document_id": doc_id}


@router.post("/{request_id}/reject")
def reject_request(request_id: str, payload: dict, db: Session = Depends(get_db)):
    row = db.execute(
        text("SELECT * FROM approval_requests WHERE id = :id"),
        {"id": request_id}
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Approval request not found")
    ar = dict(row._mapping)
    if ar["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot reject — current status: {ar['status']}")
    reason = payload.get("reason", "Rejected by approver")
    db.execute(text("""
        UPDATE approval_requests
        SET status = 'rejected', rejection_reason = :reason, approved_at = NOW()
        WHERE id = :id
    """), {"reason": reason, "id": request_id})
    # Update source document back to draft
    doc_type = ar["document_type"]
    doc_id = ar["document_id"]
    if doc_type == "sow":
        db.execute(text("UPDATE scope_of_work SET status = 'rejected', updated_at = NOW() WHERE id = :id"), {"id": doc_id})
    elif doc_type == "po":
        db.execute(text("UPDATE purchase_orders SET status = 'rejected', updated_at = NOW() WHERE id = :id"), {"id": doc_id})
    db.commit()
    return {"status": "rejected", "request_id": request_id, "reason": reason}
