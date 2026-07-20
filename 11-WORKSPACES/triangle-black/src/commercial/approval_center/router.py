from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from typing import Optional
import datetime

def row_to_dict(row):
    if row is None: return None
    if hasattr(row, "_mapping"): d = dict(row._mapping)
    elif hasattr(row, "__dict__"): d = {k:v for k,v in row.__dict__.items() if not k.startswith("_")}
    else: return {}
    return {k: (v.isoformat() if hasattr(v,"isoformat") else v) for k,v in d.items()}

def rows(result): return [row_to_dict(r) for r in result]

router = APIRouter(prefix="/approvals", tags=["approvals"])

@router.get("/", summary="Unified approval queue")
def approval_queue(hotel_id: Optional[str] = None, db: Session = Depends(get_db)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    queue = []

    # Quotes pending review or sent
    q_quotes = rows(db.execute(text(
        "SELECT id, title, total AS amount, 'quote' AS approval_type,"
        " status, created_at, updated_at"
        " FROM quotes WHERE hotel_id=:hotel_id"
        " AND status IN ('review','sent') ORDER BY created_at DESC LIMIT 10"
    ), h).fetchall())
    queue.extend(q_quotes)

    # Purchase requests pending
    # Columns: pr_number, requester, urgency, status, created_at, updated_at
    q_prs = rows(db.execute(text(
        "SELECT id, pr_number AS title, requester,"
        " urgency, 0 AS amount,"
        " 'purchase_request' AS approval_type,"
        " status, created_at, updated_at"
        " FROM purchase_requests WHERE hotel_id=:hotel_id"
        " AND status IN ('draft','pending') ORDER BY created_at DESC LIMIT 10"
    ), h).fetchall())
    queue.extend(q_prs)

    # Purchase orders pending
    # Columns: po_number, vendor_id, total_amount, status, created_at, updated_at
    q_pos = rows(db.execute(text(
        "SELECT id, po_number AS title, vendor_id,"
        " total_amount AS amount,"
        " 'purchase_order' AS approval_type,"
        " status, created_at, updated_at"
        " FROM purchase_orders WHERE hotel_id=:hotel_id"
        " AND status IN ('draft','pending') ORDER BY created_at DESC LIMIT 10"
    ), h).fetchall())
    queue.extend(q_pos)

    queue.sort(key=lambda x: str(x.get("created_at") or ""), reverse=True)
    return {
        "queue":  queue,
        "total":  len(queue),
        "counts": {
            "quotes":            len(q_quotes),
            "purchase_requests": len(q_prs),
            "purchase_orders":   len(q_pos),
        },
    }

@router.get("/count", summary="Pending approval count")
def approval_count(hotel_id: Optional[str] = None, db: Session = Depends(get_db)):
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
        "total":             quotes + prs + pos,
        "quotes":            quotes,
        "purchase_requests": prs,
        "purchase_orders":   pos,
    }

@router.post("/{approval_id}/approve", summary="Approve an item")
def approve_item(
    approval_id: str,
    approval_type: str,
    db: Session = Depends(get_db)
):
    now = datetime.datetime.utcnow()
    table_map = {
        "quote":            ("quotes",            "approved"),
        "purchase_request": ("purchase_requests", "approved"),
        "purchase_order":   ("purchase_orders",   "approved"),
    }
    if approval_type not in table_map:
        from fastapi import HTTPException
        raise HTTPException(400, f"Unknown approval_type: {approval_type}")
    table, new_status = table_map[approval_type]
    db.execute(
        text(f"UPDATE {table} SET status=:status, updated_at=:now WHERE id=:id"),
        {"status": new_status, "now": now, "id": approval_id}
    )
    db.commit()
    return {"id": approval_id, "approval_type": approval_type, "status": new_status, "approved_at": now.isoformat()}

@router.post("/{approval_id}/reject", summary="Reject an item")
def reject_item(
    approval_id: str,
    approval_type: str,
    data: dict = None,
    db: Session = Depends(get_db)
):
    now = datetime.datetime.utcnow()
    table_map = {
        "quote":            "quotes",
        "purchase_request": "purchase_requests",
        "purchase_order":   "purchase_orders",
    }
    if approval_type not in table_map:
        from fastapi import HTTPException
        raise HTTPException(400, f"Unknown approval_type: {approval_type}")
    table = table_map[approval_type]
    db.execute(
        text(f"UPDATE {table} SET status='rejected', updated_at=:now WHERE id=:id"),
        {"now": now, "id": approval_id}
    )
    db.commit()
    return {"id": approval_id, "approval_type": approval_type, "status": "rejected", "rejected_at": now.isoformat()}
