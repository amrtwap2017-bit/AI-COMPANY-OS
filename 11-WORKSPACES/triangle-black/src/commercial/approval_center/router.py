from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.auth.models import User

router = APIRouter(prefix="/approvals", tags=["approvals"])


def row_to_dict(row):
    if row is None:
        return None
    if hasattr(row, "_mapping"):
        d = dict(row._mapping)
    elif hasattr(row, "__dict__"):
        d = {k: v for k, v in row.__dict__.items() if not k.startswith("_")}
    else:
        return {}
    return {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in d.items()}


def rows(result):
    return [row_to_dict(r) for r in result]


@router.get("/", summary="Unified approval queue")
def approval_queue(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    queue = []

    q_quotes = rows(db.execute(text(
        "SELECT id, title, total AS amount, 'quote' AS approval_type, "
        "status, created_at, updated_at "
        "FROM quotes WHERE hotel_id=:hotel_id "
        "AND status IN ('review','sent') "
        "ORDER BY created_at DESC LIMIT 10"
    ), h).fetchall())
    queue.extend(q_quotes)

    q_prs = rows(db.execute(text(
        "SELECT id, pr_number AS title, requester, urgency, 0 AS amount, "
        "'purchase_request' AS approval_type, "
        "status, created_at, updated_at "
        "FROM purchase_requests WHERE hotel_id=:hotel_id "
        "AND status IN ('draft','pending') "
        "ORDER BY created_at DESC LIMIT 10"
    ), h).fetchall())
    queue.extend(q_prs)

    q_pos = rows(db.execute(text(
        "SELECT id, po_number AS title, vendor_id, total_amount AS amount, "
        "'purchase_order' AS approval_type, "
        "status, created_at, updated_at "
        "FROM purchase_orders WHERE hotel_id=:hotel_id "
        "AND status IN ('draft','pending') "
        "ORDER BY created_at DESC LIMIT 10"
    ), h).fetchall())
    queue.extend(q_pos)

    queue.sort(key=lambda x: str(x.get("created_at") or ""), reverse=True)

    return {
        "queue": queue,
        "total": len(queue),
        "counts": {
            "quotes": len(q_quotes),
            "purchase_requests": len(q_prs),
            "purchase_orders": len(q_pos),
        },
    }


@router.get("", summary="Unified approval queue (no-slash alias)")
def approval_queue_noslash(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return approval_queue(hotel_id=hotel_id, db=db, current_user=current_user)


@router.get("/count", summary="Pending approval count")
def approval_count(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    quotes = db.execute(text(
        "SELECT COUNT(*) FROM quotes WHERE hotel_id=:hotel_id AND status IN ('review','sent')"
    ), h).scalar() or 0
    prs = db.execute(text(
        "SELECT COUNT(*) FROM purchase_requests WHERE hotel_id=:hotel_id AND status IN ('draft','pending')"
    ), h).scalar() or 0
    pos = db.execute(text(
        "SELECT COUNT(*) FROM purchase_orders WHERE hotel_id=:hotel_id AND status IN ('draft','pending')"
    ), h).scalar() or 0

    return {
        "total": quotes + prs + pos,
        "quotes": quotes,
        "purchase_requests": prs,
        "purchase_orders": pos,
    }


@router.post("/{approval_id}/approve", summary="Approve an item")
def approve_item(
    approval_id: str,
    approval_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    table_map = {
        "quote": "quotes",
        "purchase_request": "purchase_requests",
        "purchase_order": "purchase_orders",
    }
    table = table_map.get(approval_type)
    if not table:
        raise HTTPException(status_code=400, detail=f"Unknown approval_type: {approval_type}")

    db.execute(
        text(f"UPDATE {table} SET status='approved', updated_at=NOW() WHERE id=:id"),
        {"id": approval_id},
    )
    db.commit()

    return {
        "ok": True,
        "id": approval_id,
        "approval_type": approval_type,
        "status": "approved",
    }


@router.post("/{approval_id}/reject", summary="Reject an item")
def reject_item(
    approval_id: str,
    approval_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    table_map = {
        "quote": "quotes",
        "purchase_request": "purchase_requests",
        "purchase_order": "purchase_orders",
    }
    table = table_map.get(approval_type)
    if not table:
        raise HTTPException(status_code=400, detail=f"Unknown approval_type: {approval_type}")

    db.execute(
        text(f"UPDATE {table} SET status='rejected', updated_at=NOW() WHERE id=:id"),
        {"id": approval_id},
    )
    db.commit()

    return {
        "ok": True,
        "id": approval_id,
        "approval_type": approval_type,
        "status": "rejected",
    }
