"""
Scope of Work (SOW) + BOQ router — Triangle Black
Backed by: scope_of_work + boq_items tables
"""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
import uuid, math

router = APIRouter(prefix="/scope-of-work", tags=["scope-of-work"])


def _next_sow_number(db: Session) -> str:
    count = db.execute(text("SELECT count(*) FROM scope_of_work")).scalar() or 0
    return f"SOW-{str(count + 1).zfill(5)}"


@router.get("/")
def list_sow(limit: int = 100, status: str = None, db: Session = Depends(get_db)):
    q = "SELECT * FROM scope_of_work"
    params = {}
    if status:
        q += " WHERE status = :status"
        params["status"] = status
    q += " ORDER BY created_at DESC LIMIT :limit"
    params["limit"] = limit
    rows = db.execute(text(q), params).fetchall()
    return [dict(r._mapping) for r in rows]


@router.post("/", status_code=201)
def create_sow(payload: dict, db: Session = Depends(get_db)):
    sow_id = str(uuid.uuid4())
    sow_number = _next_sow_number(db)
    labor = float(payload.get("labor_cost", 0))
    materials = float(payload.get("materials_cost", 0))
    overhead_pct = float(payload.get("overhead_pct", 15))
    margin_pct = float(payload.get("profit_margin_pct", 10))
    subtotal = labor + materials
    overhead = subtotal * overhead_pct / 100
    total = (subtotal + overhead) * (1 + margin_pct / 100)
    db.execute(text("""
        INSERT INTO scope_of_work (
            id, hotel_id, sow_number, title, description,
            service_request_id, work_order_id, contract_id,
            status, sow_type, scope_details, exclusions, assumptions,
            estimated_days, labor_cost, materials_cost,
            overhead_pct, profit_margin_pct, total_cost,
            currency, validity_days, prepared_by, client_name, client_email, notes
        ) VALUES (
            :id, :hotel_id, :sow_number, :title, :description,
            :sr_id, :wo_id, :contract_id,
            'draft', :sow_type, :scope_details, :exclusions, :assumptions,
            :est_days, :labor, :materials,
            :overhead_pct, :margin_pct, :total,
            :currency, :validity, :prepared_by, :client_name, :client_email, :notes
        )
    """), {
        "id": sow_id, "hotel_id": "tb-default-hotel-000000000001",
        "sow_number": sow_number,
        "title": payload.get("title", "New Scope of Work"),
        "description": payload.get("description", ""),
        "sr_id": payload.get("service_request_id"),
        "wo_id": payload.get("work_order_id"),
        "contract_id": payload.get("contract_id"),
        "sow_type": payload.get("sow_type", "service"),
        "scope_details": payload.get("scope_details", ""),
        "exclusions": payload.get("exclusions", ""),
        "assumptions": payload.get("assumptions", ""),
        "est_days": int(payload.get("estimated_days", 0)),
        "labor": labor, "materials": materials,
        "overhead_pct": overhead_pct, "margin_pct": margin_pct,
        "total": round(total, 2),
        "currency": payload.get("currency", "EGP"),
        "validity": int(payload.get("validity_days", 30)),
        "prepared_by": payload.get("prepared_by", ""),
        "client_name": payload.get("client_name", ""),
        "client_email": payload.get("client_email", ""),
        "notes": payload.get("notes", ""),
    })
    db.commit()
    row = db.execute(text("SELECT * FROM scope_of_work WHERE id = :id"), {"id": sow_id}).fetchone()
    return dict(row._mapping)


@router.get("/{sow_id}")
def get_sow(sow_id: str, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT * FROM scope_of_work WHERE id = :id"), {"id": sow_id}).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="SOW not found")
    items = db.execute(
        text("SELECT * FROM boq_items WHERE sow_id = :id ORDER BY item_number"),
        {"id": sow_id}
    ).fetchall()
    return {**dict(row._mapping), "boq_items": [dict(i._mapping) for i in items]}


@router.patch("/{sow_id}")
def update_sow(sow_id: str, payload: dict, db: Session = Depends(get_db)):
    allowed = [
        "title", "description", "status", "sow_type", "scope_details",
        "exclusions", "assumptions", "estimated_days", "labor_cost",
        "materials_cost", "overhead_pct", "profit_margin_pct", "total_cost",
        "currency", "validity_days", "prepared_by", "approved_by",
        "client_name", "client_email", "notes"
    ]
    updates = {k: v for k, v in payload.items() if k in allowed}
    if not updates:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    # Recalculate total if cost fields changed
    if any(k in updates for k in ["labor_cost", "materials_cost", "overhead_pct", "profit_margin_pct"]):
        row = db.execute(text("SELECT * FROM scope_of_work WHERE id = :id"), {"id": sow_id}).fetchone()
        if row:
            d = dict(row._mapping)
            labor = float(updates.get("labor_cost", d["labor_cost"] or 0))
            materials = float(updates.get("materials_cost", d["materials_cost"] or 0))
            overhead_pct = float(updates.get("overhead_pct", d["overhead_pct"] or 15))
            margin_pct = float(updates.get("profit_margin_pct", d["profit_margin_pct"] or 10))
            subtotal = labor + materials
            overhead = subtotal * overhead_pct / 100
            updates["total_cost"] = round((subtotal + overhead) * (1 + margin_pct / 100), 2)
    if "status" in updates and updates["status"] == "approved":
        updates["approved_at"] = "NOW()"
    set_clause = ", ".join([
        f"{k} = NOW()" if v == "NOW()" else f"{k} = :{k}"
        for k, v in updates.items()
    ])
    params = {k: v for k, v in updates.items() if v != "NOW()"}
    params["id"] = sow_id
    db.execute(text(f"UPDATE scope_of_work SET {set_clause}, updated_at = NOW() WHERE id = :id"), params)
    db.commit()
    row = db.execute(text("SELECT * FROM scope_of_work WHERE id = :id"), {"id": sow_id}).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="SOW not found")
    return dict(row._mapping)


@router.post("/{sow_id}/boq-items", status_code=201)
def add_boq_item(sow_id: str, payload: dict, db: Session = Depends(get_db)):
    sow = db.execute(text("SELECT id FROM scope_of_work WHERE id = :id"), {"id": sow_id}).fetchone()
    if not sow:
        raise HTTPException(status_code=404, detail="SOW not found")
    max_num = db.execute(
        text("SELECT COALESCE(MAX(item_number), 0) FROM boq_items WHERE sow_id = :id"),
        {"id": sow_id}
    ).scalar()
    qty = float(payload.get("quantity", 1))
    rate = float(payload.get("unit_rate", 0))
    item_id = str(uuid.uuid4())
    db.execute(text("""
        INSERT INTO boq_items (id, sow_id, item_number, description, unit, quantity, unit_rate, total_amount, category, notes)
        VALUES (:id, :sow_id, :num, :desc, :unit, :qty, :rate, :total, :category, :notes)
    """), {
        "id": item_id, "sow_id": sow_id, "num": max_num + 1,
        "desc": payload.get("description", "Item"),
        "unit": payload.get("unit", "unit"),
        "qty": qty, "rate": rate, "total": round(qty * rate, 2),
        "category": payload.get("category", "material"),
        "notes": payload.get("notes", ""),
    })
    # Update SOW total
    new_total = db.execute(
        text("SELECT COALESCE(SUM(total_amount), 0) FROM boq_items WHERE sow_id = :id"),
        {"id": sow_id}
    ).scalar()
    db.execute(
        text("UPDATE scope_of_work SET total_cost = :total, updated_at = NOW() WHERE id = :id"),
        {"total": float(new_total), "id": sow_id}
    )
    db.commit()
    row = db.execute(text("SELECT * FROM boq_items WHERE id = :id"), {"id": item_id}).fetchone()
    return dict(row._mapping)


@router.post("/{sow_id}/submit-for-approval", status_code=200)
def submit_sow_for_approval(sow_id: str, payload: dict, db: Session = Depends(get_db)):
    sow = db.execute(text("SELECT * FROM scope_of_work WHERE id = :id"), {"id": sow_id}).fetchone()
    if not sow:
        raise HTTPException(status_code=404, detail="SOW not found")
    sow_dict = dict(sow._mapping)
    # Update SOW status
    db.execute(
        text("UPDATE scope_of_work SET status = 'pending_approval', updated_at = NOW() WHERE id = :id"),
        {"id": sow_id}
    )
    # Create approval request
    ar_id = str(uuid.uuid4())
    db.execute(text("""
        INSERT INTO approval_requests (
            id, hotel_id, document_type, document_id, document_number,
            title, amount, currency, status, requested_by, requested_at
        ) VALUES (
            :id, :hotel_id, 'sow', :doc_id, :doc_number,
            :title, :amount, :currency, 'pending', :requested_by, NOW()
        )
    """), {
        "id": ar_id,
        "hotel_id": sow_dict.get("hotel_id", "tb-default-hotel-000000000001"),
        "doc_id": sow_id,
        "doc_number": sow_dict.get("sow_number", ""),
        "title": f"SOW Approval: {sow_dict.get('title', '')}",
        "amount": float(sow_dict.get("total_cost") or 0),
        "currency": sow_dict.get("currency", "EGP"),
        "requested_by": payload.get("requested_by", "system"),
    })
    db.commit()
    return {"status": "submitted", "sow_id": sow_id, "approval_request_id": ar_id}
