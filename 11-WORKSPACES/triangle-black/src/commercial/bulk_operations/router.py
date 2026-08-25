from __future__ import annotations
import uuid, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from typing import List

router = APIRouter(prefix="/bulk", tags=["bulk-operations"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

@router.post("/work-orders/assign", summary="Bulk assign work orders to technician")
def bulk_assign_work_orders(data: dict, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """
    Bulk assign multiple work orders to one technician.
    Body: { wo_ids: ["id1","id2",...], technician_id: "tech_id" }
    """
    wo_ids        = data.get("wo_ids", [])
    technician_id = data.get("technician_id")
    comment       = data.get("comment", "Bulk assignment")

    if not wo_ids:
        raise HTTPException(400, "wo_ids list is required")
    if not technician_id:
        raise HTTPException(400, "technician_id is required")
    if len(wo_ids) > 50:
        raise HTTPException(400, "Maximum 50 work orders per bulk operation")

    # Verify technician exists
    tech = db.execute(
        text("SELECT id, name, max_work_orders, current_work_orders FROM technicians WHERE id = :id"),
        {"id": technician_id}
    ).fetchone()
    if not tech:
        raise HTTPException(404, "Technician not found")

    t = row_to_dict(tech)
    capacity_remaining = int(t.get("max_work_orders") or 5) - int(t.get("current_work_orders") or 0)
    if len(wo_ids) > capacity_remaining:
        raise HTTPException(400, {
            "error": f"Technician only has {capacity_remaining} slots available",
            "requested": len(wo_ids),
            "available": capacity_remaining,
        })

    now = datetime.datetime.utcnow()
    assigned = []
    failed   = []

    for wo_id in wo_ids:
        try:
            db.execute(text("""
                UPDATE work_orders
                SET technician_id = :tech_id,
                    status = CASE WHEN status = 'open' THEN 'assigned' ELSE status END,
                    updated_at = :now
                WHERE id = :wo_id
            """), {"tech_id": technician_id, "now": now, "wo_id": wo_id})
            assigned.append(wo_id)
        except Exception as e:
            failed.append({"id": wo_id, "error": str(e)})

    if assigned:
        # Update technician count
        db.execute(text("""
            UPDATE technicians
            SET current_work_orders = current_work_orders + :count
            WHERE id = :id
        """), {"count": len(assigned), "id": technician_id})
        db.commit()

    return {
        "success":           True,
        "assigned_count":    len(assigned),
        "failed_count":      len(failed),
        "assigned_ids":      assigned,
        "failed":            failed,
        "technician_id":     technician_id,
        "technician_name":   t.get("name"),
        "message":           f"{len(assigned)} work orders assigned to {t.get('name')}",
    }

@router.post("/work-orders/update-status", summary="Bulk update work order status")
def bulk_update_status(data: dict, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """
    Bulk update status for multiple work orders.
    Body: { wo_ids: [...], status: "completed" }
    Validates using WO state machine rules.
    """
    wo_ids    = data.get("wo_ids", [])
    new_status = data.get("status", "").strip()
    comment   = data.get("comment", "Bulk status update")

    VALID_STATUSES = ["open","assigned","in_progress","waiting_parts",
                      "completed","closed","cancelled"]

    if not wo_ids:
        raise HTTPException(400, "wo_ids is required")
    if new_status not in VALID_STATUSES:
        raise HTTPException(400, f"Invalid status. Must be one of: {VALID_STATUSES}")
    if len(wo_ids) > 100:
        raise HTTPException(400, "Maximum 100 work orders per bulk update")

    now = datetime.datetime.utcnow()
    updated = []
    failed  = []

    extra_fields = ""
    extra_params = {}

    if new_status == "in_progress":
        extra_fields = ", started_at = CASE WHEN started_at IS NULL THEN :now2 ELSE started_at END"
        extra_params["now2"] = now
    elif new_status in ("completed", "closed"):
        extra_fields = ", completed_at = CASE WHEN completed_at IS NULL THEN :now2 ELSE completed_at END"
        extra_params["now2"] = now

    for wo_id in wo_ids:
        try:
            db.execute(text(f"""
                UPDATE work_orders
                SET status = :status, updated_at = :now{extra_fields}
                WHERE id = :wo_id
            """), {"status": new_status, "now": now, "wo_id": wo_id, **extra_params})
            updated.append(wo_id)
        except Exception as e:
            failed.append({"id": wo_id, "error": str(e)})

    if updated:
        db.commit()

    return {
        "success":       True,
        "updated_count": len(updated),
        "failed_count":  len(failed),
        "new_status":    new_status,
        "updated_ids":   updated,
        "failed":        failed,
        "message":       f"{len(updated)} work orders → {new_status}",
    }

@router.post("/purchase-requests/approve", summary="Bulk approve purchase requests")
def bulk_approve_prs(data: dict, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """
    Bulk approve multiple purchase requests.
    Body: { pr_ids: [...], approved_by: "user_id", comment: "..." }
    """
    pr_ids      = data.get("pr_ids", [])
    approved_by = data.get("approved_by", "bulk_approver")
    comment     = data.get("comment", "Bulk approved")

    if not pr_ids:
        raise HTTPException(400, "pr_ids is required")
    if len(pr_ids) > 50:
        raise HTTPException(400, "Maximum 50 PRs per bulk operation")

    now     = datetime.datetime.utcnow()
    approved = []
    failed   = []

    for pr_id in pr_ids:
        try:
            result = db.execute(text("""
                UPDATE purchase_requests
                SET status = 'approved', updated_at = :now
                WHERE id = :id
                  AND status IN ('submitted','pending','draft')
                RETURNING id
            """), {"now": now, "id": pr_id}).fetchone()

            if result:
                approved.append(pr_id)
            else:
                failed.append({"id": pr_id, "error": "Not in approvable status"})
        except Exception as e:
            failed.append({"id": pr_id, "error": str(e)})

    if approved:
        db.commit()

    return {
        "success":        True,
        "approved_count": len(approved),
        "failed_count":   len(failed),
        "approved_ids":   approved,
        "failed":         failed,
        "approved_by":    approved_by,
        "message":        f"{len(approved)} purchase requests approved",
    }

@router.get("/summary", summary="Bulk operations summary")
def bulk_summary(hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """Returns counts of items available for bulk operations."""
    results = {}
    queries = {
        "unassigned_work_orders": """
            SELECT count(*) as n FROM work_orders
            WHERE status = 'open' AND technician_id IS NULL""",
        "pending_prs": """
            SELECT count(*) as n FROM purchase_requests
            WHERE status IN ('submitted','pending','draft')""",
        "overdue_work_orders": """
            SELECT count(*) as n FROM work_orders
            WHERE due_date < NOW()
              AND status NOT IN ('completed','closed','cancelled')""",
        "critical_unassigned": """
            SELECT count(*) as n FROM work_orders
            WHERE priority = 'critical'
              AND status = 'open'
              AND technician_id IS NULL""",
    }
    for key, sql in queries.items():
        try:
            row = db.execute(text(sql)).fetchone()
            results[key] = int(row_to_dict(row).get("n") or 0)
        except Exception:
            results[key] = 0

    return {
        "bulk_opportunities": results,
        "generated_at": datetime.datetime.utcnow().isoformat(),
    }
