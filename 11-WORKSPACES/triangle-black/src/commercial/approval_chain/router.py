from __future__ import annotations
import uuid, datetime
from datetime import datetime as _dt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id
import logging

logger = logging.getLogger("tb.approval_chain")
router = APIRouter(prefix="/approval-chain", tags=["approval-chain"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _safe_float(v):
    try: return float(v or 0)
    except: return 0.0

APPROVAL_STEPS = {
    1: {"role": "purchasing", "title": "Purchasing Manager", "next": 2},
    2: {"role": "finance",    "title": "Finance",            "next": 3},
    3: {"role": "requester",  "title": "Requester",          "next": None},
}

def _ensure_chain_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS pr_approval_chain (
            id            VARCHAR(36) PRIMARY KEY,
            pr_id         VARCHAR(36) NOT NULL,
            step          INTEGER NOT NULL,
            role          VARCHAR(50) NOT NULL,
            status        VARCHAR(20) DEFAULT 'pending',
            approver_id   VARCHAR(100),
            approver_name VARCHAR(200),
            comment       TEXT,
            decided_at    TIMESTAMP,
            created_at    TIMESTAMP NOT NULL
        )
    """))
    db.commit()

def _notify(pr_id, step, action, db):
    config = APPROVAL_STEPS.get(step, {})
    now    = _dt.utcnow()
    try:
        pr_row = db.execute(
            text("SELECT title, total_amount, requested_by FROM purchase_requests WHERE id = :id"),
            {"id": pr_id}
        ).fetchone()
        pr  = row_to_dict(pr_row) if pr_row else {}
        msg = (
            f"PR: {str(pr.get('title','?'))[:60]} | "
            f"Value: {_safe_float(pr.get('total_amount',0)):,.0f} EGP | "
            f"Step {step} - {config.get('title','?')}: {action.upper()}"
        )
        db.execute(text("""
            INSERT INTO platform_notifications
                (id, type, title, message, priority, entity_type, entity_id, created_at)
            VALUES (:id, :type, :title, :msg, :pri, 'purchase_request', :pr_id, :now)
        """), {
            "id":    str(uuid.uuid4()),
            "type":  f"pr_step_{step}_{action}",
            "title": f"PR {action.title()} - Step {step}",
            "msg":   msg,
            "pri":   "high" if step == 1 else "medium",
            "pr_id": pr_id, "now": now,
        })
        logger.info(f"APPROVAL: PR {pr_id[:8]} Step {step} {action}")
    except Exception:
        pass

@router.post("/init/{pr_id}", summary="Initialize 3-step approval chain")
def init_chain(pr_id: str, db: Session = Depends(get_db)):
    """Initialize Purchasing -> Finance -> Requester approval chain."""
    pr_row = db.execute(
        text("SELECT * FROM purchase_requests WHERE id = :id"), {"id": pr_id}
    ).fetchone()
    if not pr_row:
        raise HTTPException(404, "PR not found")

    _ensure_chain_table(db)
    now = _dt.utcnow()

    existing = db.execute(text(
        "SELECT count(*) as cnt FROM pr_approval_chain WHERE pr_id = :id"
    ), {"id": pr_id}).fetchone()
    if row_to_dict(existing).get("cnt", 0) > 0:
        return {"success": True, "message": "Chain already initialized", "pr_id": pr_id}

    for step, config in APPROVAL_STEPS.items():
        db.execute(text("""
            INSERT INTO pr_approval_chain (id, pr_id, step, role, status, created_at)
            VALUES (:id, :pr_id, :step, :role, :status, :now)
        """), {
            "id":     str(uuid.uuid4()),
            "pr_id":  pr_id,
            "step":   step,
            "role":   config["role"],
            "status": "pending" if step == 1 else "waiting",
            "now":    now,
        })

    _notify(pr_id, 1, "pending_approval", db)
    db.commit()

    return {
        "success":     True,
        "pr_id":       pr_id,
        "chain":       [{"step": s, "role": c["role"], "title": c["title"],
                         "status": "pending" if s == 1 else "waiting"}
                        for s, c in APPROVAL_STEPS.items()],
        "message":     "Chain initialized. Notification sent to Purchasing Manager.",
    }

@router.post("/approve/{pr_id}/{step}", summary="Approve a chain step")
def approve_step(pr_id: str, step: int, data: dict, db: Session = Depends(get_db)):
    """Approve step 1 (Purchasing), 2 (Finance), or 3 (Requester)."""
    _ensure_chain_table(db)
    if step not in APPROVAL_STEPS:
        raise HTTPException(400, f"Invalid step {step}")

    approver_name = data.get("approver_name", "User")
    approver_id   = data.get("approver_id",   "portal_user")
    comment       = data.get("comment",       "Approved")
    now           = _dt.utcnow()

    db.execute(text("""
        UPDATE pr_approval_chain
        SET status = 'approved', approver_id = :aid, approver_name = :aname,
            comment = :comment, decided_at = :now
        WHERE pr_id = :pr_id AND step = :step
    """), {
        "aid": approver_id, "aname": approver_name,
        "comment": comment, "now": now, "pr_id": pr_id, "step": step,
    })

    config    = APPROVAL_STEPS[step]
    next_step = config.get("next")

    if next_step:
        db.execute(text("""
            UPDATE pr_approval_chain SET status = 'pending'
            WHERE pr_id = :pr_id AND step = :ns
        """), {"pr_id": pr_id, "ns": next_step})
        db.execute(text("""
            UPDATE purchase_requests SET status = :s, updated_at = :now WHERE id = :id
        """), {"s": f"step_{next_step}_pending", "now": now, "id": pr_id})
        _notify(pr_id, next_step, "pending_approval", db)
        db.commit()
        return {
            "success":        True,
            "step_completed": step,
            "next_step":      next_step,
            "next_approver":  APPROVAL_STEPS[next_step]["title"],
            "chain_complete": False,
            "message":        f"Step {step} approved. Notification sent to {APPROVAL_STEPS[next_step]['title']}.",
        }
    else:
        db.execute(text("""
            UPDATE purchase_requests SET status = 'approved', updated_at = :now WHERE id = :id
        """), {"now": now, "id": pr_id})
        _notify(pr_id, step, "fully_approved", db)
        db.commit()
        return {
            "success":        True,
            "step_completed": step,
            "chain_complete": True,
            "next_endpoint":  f"/api/v1/approval-chain/generate-po/{pr_id}",
            "message":        "ALL APPROVALS COMPLETE - Ready to generate Purchase Order.",
        }

@router.post("/reject/{pr_id}/{step}", summary="Reject at any step")
def reject_step(pr_id: str, step: int, data: dict, db: Session = Depends(get_db)):
    """Reject PR at any step. Notifies requester."""
    _ensure_chain_table(db)
    rejector = data.get("rejector_name", "User")
    reason   = data.get("reason", "Rejected")
    now      = _dt.utcnow()

    db.execute(text("""
        UPDATE pr_approval_chain
        SET status = 'rejected', approver_name = :r, comment = :c, decided_at = :now
        WHERE pr_id = :pr_id AND step = :step
    """), {"r": rejector, "c": reason, "now": now, "pr_id": pr_id, "step": step})

    db.execute(text("""
        UPDATE pr_approval_chain SET status = 'cancelled'
        WHERE pr_id = :pr_id AND step > :step
    """), {"pr_id": pr_id, "step": step})

    db.execute(text("""
        UPDATE purchase_requests SET status = 'rejected', updated_at = :now WHERE id = :id
    """), {"now": now, "id": pr_id})

    _notify(pr_id, step, "rejected", db)
    db.commit()

    config = APPROVAL_STEPS.get(step, {})
    return {
        "success": True,
        "pr_id":   pr_id,
        "status":  "rejected",
        "message": f"Rejected at Step {step} ({config.get('title','?')}) by {rejector}. Reason: {reason}",
    }

@router.post("/generate-po/{pr_id}", summary="Auto-generate PO after full approval")
def generate_po(pr_id: str, data: dict, db: Session = Depends(get_db)):
    """Generate PO after all 3 approvals. Sends email to vendor."""
    pr_row = db.execute(
        text("SELECT * FROM purchase_requests WHERE id = :id"), {"id": pr_id}
    ).fetchone()
    if not pr_row:
        raise HTTPException(404, "PR not found")

    pr = row_to_dict(pr_row)
    if pr.get("status") != "approved":
        raise HTTPException(400, f"PR not fully approved. Status: {pr.get('status')}")

    now    = _dt.utcnow()
    po_id  = str(uuid.uuid4())
    po_num = f"PO-{now.strftime('%Y%m')}-{po_id[:6].upper()}"
    vendor_id   = data.get("vendor_id", "")
    vendor_name = data.get("vendor_name", "TBD")
    total       = _safe_float(data.get("total_amount") or pr.get("total_amount") or 0)

    try:
        db.execute(text("""
            INSERT INTO purchase_orders
                (id, hotel_id, po_number, vendor_id, title, status,
                 total_amount, currency, notes, expected_delivery_date, created_at, updated_at)
            VALUES
                (:id, :hid, :pnum, :vid, :title, 'sent',
                 :total, 'EGP', :notes, :delivery, :now, :now)
        """), {
            "id": po_id, "hid": pr.get("hotel_id"), "pnum": po_num,
            "vid": vendor_id or None,
            "title": f"PO for: {pr.get('title','?')[:150]}",
            "total": total,
            "notes": f"Auto-generated from PR {pr_id[:8]}",
            "delivery": now + datetime.timedelta(days=14),
            "now": now,
        })
        db.execute(text("""
            UPDATE purchase_requests SET status = 'po_created', updated_at = :now WHERE id = :id
        """), {"now": now, "id": pr_id})
        db.commit()
    except Exception as e:
        raise HTTPException(500, f"PO generation failed: {str(e)}")

    # Try to send email to vendor
    email_sent = False
    try:
        if vendor_id:
            v = db.execute(
                text("SELECT email, name FROM inventory_vendors WHERE id = :id"),
                {"id": vendor_id}
            ).fetchone()
            if v:
                vd = row_to_dict(v)
                from src.commercial.email_alert.router import _send_email
                import os
                if vd.get("email"):
                    subject = f"Purchase Order {po_num} - Triangle Black"
                    body = (
                        f"Dear {vd.get('name','Vendor')},\n\n"
                        f"Please find PO {po_num} attached.\n"
                        f"Items: {pr.get('title','?')[:100]}\n"
                        f"Value: {total:,.0f} EGP\n"
                        f"Delivery by: {(now + datetime.timedelta(days=14)).strftime('%Y-%m-%d')}\n\n"
                        f"Please confirm receipt.\n\nTriangle Black"
                    )
                    email_sent = _send_email(vd["email"], subject, body)
    except Exception:
        pass

    return {
        "success":              True,
        "po_id":                po_id,
        "po_number":            po_num,
        "pr_id":                pr_id,
        "vendor_name":          vendor_name,
        "total_egp":            total,
        "status":               "sent",
        "email_sent_to_vendor": email_sent,
        "expected_delivery":    (now + datetime.timedelta(days=14)).strftime("%Y-%m-%d"),
        "message":              f"PO {po_num} generated and sent to vendor.",
    }

@router.get("/chain-status/{pr_id}", summary="Full approval chain status")
def chain_status(pr_id: str, db: Session = Depends(get_db)):
    """View complete approval chain for a PR."""
    try:
        _ensure_chain_table(db)
    except Exception:
        pass
    try:
        steps = db.execute(text(
            "SELECT * FROM pr_approval_chain WHERE pr_id = :id ORDER BY step"
        ), {"id": pr_id}).fetchall()
    except Exception:
        steps = []
    pr_row  = db.execute(
        text("SELECT title, status, total_amount, requested_by FROM purchase_requests WHERE id = :id"),
        {"id": pr_id}
    ).fetchone()
    pr      = row_to_dict(pr_row) if pr_row else {}
    chain   = [row_to_dict(s) for s in steps]
    approved = sum(1 for s in chain if s.get("status") == "approved")

    return {
        "pr_id":          pr_id,
        "pr_title":       pr.get("title"),
        "pr_status":      pr.get("status"),
        "pr_value_egp":   _safe_float(pr.get("total_amount")),
        "chain":          chain,
        "approved_steps": approved,
        "total_steps":    len(APPROVAL_STEPS),
        "is_complete":    approved == len(APPROVAL_STEPS),
        "generated_at":   _dt.utcnow().isoformat(),
    }
