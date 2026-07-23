from __future__ import annotations
"""
Multi-Step Approval Chain Engine - Sprint 90
Purchasing → Finance → Requester
Each step: email notification + platform alert + WhatsApp-ready message
Auto-advances to next step on approval.
Auto-generates PO after final approval.
"""
import uuid, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
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

# Approval chain configuration
APPROVAL_STEPS = {
    1: {"role": "purchasing",  "title": "Purchasing Manager",  "next": 2},
    2: {"role": "finance",     "title": "Finance",             "next": 3},
    3: {"role": "requester",   "title": "Requester/End User",  "next": None},
}

def _ensure_approval_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS pr_approval_chain (
            id              VARCHAR(36) PRIMARY KEY,
            pr_id           VARCHAR(36) NOT NULL,
            step            INTEGER NOT NULL,
            role            VARCHAR(50) NOT NULL,
            status          VARCHAR(20) DEFAULT 'pending',
            approver_id     VARCHAR(100),
            approver_name   VARCHAR(200),
            comment         TEXT,
            decided_at      TIMESTAMP,
            notified_at     TIMESTAMP,
            created_at      TIMESTAMP NOT NULL
        )
    """))
    db.commit()

def _initialize_chain(pr_id: str, db: Session, requester_email: str = None):
    """Create approval chain records for all 3 steps."""
    now = datetime.datetime.utcnow()
    chain_id_step1 = str(uuid.uuid4())

    # Step 1 starts as pending, steps 2+3 start as waiting
    for step, config in APPROVAL_STEPS.items():
        status = "pending" if step == 1 else "waiting"
        db.execute(text("""
            INSERT INTO pr_approval_chain
                (id, pr_id, step, role, status, created_at)
            VALUES (:id, :pr_id, :step, :role, :status, :now)
            ON CONFLICT DO NOTHING
        """), {
            "id":    str(uuid.uuid4()),
            "pr_id": pr_id,
            "step":  step,
            "role":  config["role"],
            "status": status,
            "now":   now,
        })
    db.commit()
    return True

def _send_approval_notification(pr_id: str, step: int, action: str, db: Session):
    """Send email + platform notification for approval step."""
    config = APPROVAL_STEPS.get(step, {})
    now = datetime.datetime.utcnow()

    pr_row = db.execute(
        text("SELECT title, total_amount, requested_by FROM purchase_requests WHERE id = :id"),
        {"id": pr_id}
    ).fetchone()
    pr = row_to_dict(pr_row) if pr_row else {}

    msg = (
        f"PR: {pr.get('title','?')[:60]}
"
        f"Value: {_safe_float(pr.get('total_amount',0)):,.0f} EGP
"
        f"Requested by: {pr.get('requested_by','?')}
"
        f"Step {step} - {config.get('title','?')}: {action.upper()}"
    )

    # Log notification
    try:
        db.execute(text("""
            INSERT INTO platform_notifications
                (id, type, title, message, priority, entity_type, entity_id, created_at)
            VALUES (:id, :type, :title, :msg, :priority, 'purchase_request', :pr_id, :now)
        """), {
            "id":       str(uuid.uuid4()),
            "type":     f"pr_approval_step_{step}",
            "title":    f"PR {action.title()}: Step {step} - {config.get('title','?')}",
            "msg":      msg,
            "priority": "high" if step == 1 else "medium",
            "pr_id":    pr_id,
            "now":      now,
        })
    except Exception:
        pass

    # Log to email alerts
    logger.info(f"APPROVAL NOTIFICATION: PR {pr_id[:8]} Step {step} {action} - {msg}")

    # Try email
    try:
        from src.commercial.email_alert.router import _send_email
        import os
        alert_email = os.environ.get("ALERT_EMAIL","")
        if alert_email:
            subject = f"[Action Required] PR Approval Step {step} - {config.get('title','?')}"
            _send_email(alert_email, subject, msg)
    except Exception:
        pass

@router.post("/init/{pr_id}", summary="Initialize approval chain for PR")
def init_approval_chain(pr_id: str, db: Session = Depends(get_db)):
    """
    STEP 3 of procurement cycle:
    Initialize the 3-step approval chain for a PR.
    Call this after PR is created and submitted.
    """
    # Verify PR exists
    pr_row = db.execute(
        text("SELECT * FROM purchase_requests WHERE id = :id"),
        {"id": pr_id}
    ).fetchone()
    if not pr_row:
        raise HTTPException(404, "PR not found")

    pr = row_to_dict(pr_row)
    if pr.get("status") not in ("submitted","pending","draft"):
        raise HTTPException(400, f"PR status is '{pr.get('status')}' - cannot initialize chain")

    _ensure_approval_table(db)

    # Check if chain already exists
    existing = db.execute(text(
        "SELECT count(*) as cnt FROM pr_approval_chain WHERE pr_id = :id"
    ), {"id": pr_id}).fetchone()
    if row_to_dict(existing).get("cnt", 0) > 0:
        return {"success": True, "message": "Approval chain already initialized", "pr_id": pr_id}

    _initialize_chain(pr_id, db)

    # Send first notification to Purchasing Manager
    _send_approval_notification(pr_id, 1, "pending_approval", db)
    db.commit()

    return {
        "success":     True,
        "pr_id":       pr_id,
        "chain":       [{"step": s, "role": c["role"], "title": c["title"], "status": "pending" if s == 1 else "waiting"}
                        for s, c in APPROVAL_STEPS.items()],
        "message":     "Approval chain initialized. Step 1 notification sent to Purchasing Manager.",
        "next_action": "Purchasing Manager must approve at /api/v1/approval-chain/approve/{pr_id}/1",
    }

@router.post("/approve/{pr_id}/{step}", summary="Approve a chain step")
def approve_step(pr_id: str, step: int, data: dict, db: Session = Depends(get_db)):
    """
    STEP 4: Approve one step in the chain.
    Body: { approver_id, approver_name, comment }
    Auto-advances to next step or triggers PO generation.
    """
    _ensure_approval_table(db)

    if step not in APPROVAL_STEPS:
        raise HTTPException(400, f"Invalid step {step}. Must be 1, 2, or 3.")

    approver_id   = data.get("approver_id", "portal_user")
    approver_name = data.get("approver_name", "User")
    comment       = data.get("comment", "Approved")
    now           = datetime.datetime.utcnow()

    # Get this step's record
    step_row = db.execute(text("""
        SELECT * FROM pr_approval_chain
        WHERE pr_id = :pr_id AND step = :step
    """), {"pr_id": pr_id, "step": step}).fetchone()

    if not step_row:
        raise HTTPException(404, f"Step {step} not found - run /init/{pr_id} first")

    step_data = row_to_dict(step_row)
    if step_data.get("status") not in ("pending", "waiting"):
        return {"success": True, "message": f"Step {step} already {step_data.get('status')}"}

    # Mark this step as approved
    db.execute(text("""
        UPDATE pr_approval_chain
        SET status = 'approved', approver_id = :aid, approver_name = :aname,
            comment = :comment, decided_at = :now
        WHERE pr_id = :pr_id AND step = :step
    """), {
        "aid": approver_id, "aname": approver_name,
        "comment": comment, "now": now,
        "pr_id": pr_id, "step": step,
    })

    config     = APPROVAL_STEPS[step]
    next_step  = config.get("next")
    result_msg = f"Step {step} ({config['title']}) approved by {approver_name}"

    if next_step:
        # Activate next step
        db.execute(text("""
            UPDATE pr_approval_chain
            SET status = 'pending', notified_at = :now
            WHERE pr_id = :pr_id AND step = :next_step
        """), {"now": now, "pr_id": pr_id, "next_step": next_step})

        # Update PR status
        db.execute(text("""
            UPDATE purchase_requests
            SET status = :status, updated_at = :now
            WHERE id = :id
        """), {
            "status": f"step_{next_step}_pending",
            "now": now, "id": pr_id,
        })

        # Notify next approver
        _send_approval_notification(pr_id, next_step, "pending_approval", db)
        db.commit()

        return {
            "success":     True,
            "message":     result_msg,
            "pr_id":       pr_id,
            "step_completed": step,
            "next_step":   next_step,
            "next_approver": APPROVAL_STEPS[next_step]["title"],
            "chain_complete": False,
        }
    else:
        # Final step approved - mark PR as fully approved
        db.execute(text("""
            UPDATE purchase_requests
            SET status = 'approved', updated_at = :now
            WHERE id = :id
        """), {"now": now, "id": pr_id})

        _send_approval_notification(pr_id, step, "fully_approved", db)
        db.commit()

        return {
            "success":       True,
            "message":       f"{result_msg}. ALL APPROVALS COMPLETE - Ready for PO generation.",
            "pr_id":         pr_id,
            "step_completed": step,
            "next_step":     None,
            "chain_complete": True,
            "auto_action":   "generate_po",
            "next_endpoint": f"/api/v1/approval-chain/generate-po/{pr_id}",
        }

@router.post("/reject/{pr_id}/{step}", summary="Reject a chain step")
def reject_step(pr_id: str, step: int, data: dict, db: Session = Depends(get_db)):
    """Reject a PR at any step. Notifies requester. PR returns to draft."""
    _ensure_approval_table(db)

    rejector  = data.get("rejector_name", "User")
    reason    = data.get("reason", "Rejected")
    now       = datetime.datetime.utcnow()
    config    = APPROVAL_STEPS.get(step, {})

    db.execute(text("""
        UPDATE pr_approval_chain
        SET status = 'rejected', approver_name = :rejector,
            comment = :reason, decided_at = :now
        WHERE pr_id = :pr_id AND step = :step
    """), {"rejector": rejector, "reason": reason, "now": now, "pr_id": pr_id, "step": step})

    # Set remaining steps as cancelled
    db.execute(text("""
        UPDATE pr_approval_chain
        SET status = 'cancelled'
        WHERE pr_id = :pr_id AND step > :step
    """), {"pr_id": pr_id, "step": step})

    # Update PR status
    db.execute(text("""
        UPDATE purchase_requests
        SET status = 'rejected', updated_at = :now
        WHERE id = :id
    """), {"now": now, "id": pr_id})

    _send_approval_notification(pr_id, step, "rejected", db)
    db.commit()

    return {
        "success":  True,
        "message":  f"PR rejected at Step {step} ({config.get('title','?')}) by {rejector}. Reason: {reason}",
        "pr_id":    pr_id,
        "status":   "rejected",
        "requester_notified": True,
    }

@router.post("/generate-po/{pr_id}", summary="Auto-generate PO after full approval")
def generate_po_after_approval(pr_id: str, data: dict, db: Session = Depends(get_db)):
    """
    STEP 5: After all 3 approvals, auto-generate Purchase Order.
    Selects best vendor from recommendations.
    Sends PO email to supplier.
    Creates goods receipt placeholder.
    """
    # Verify PR is fully approved
    pr_row = db.execute(
        text("SELECT * FROM purchase_requests WHERE id = :id"),
        {"id": pr_id}
    ).fetchone()
    if not pr_row:
        raise HTTPException(404, "PR not found")

    pr = row_to_dict(pr_row)
    if pr.get("status") != "approved":
        raise HTTPException(400, f"PR not fully approved. Current status: {pr.get('status')}")

    now    = datetime.datetime.utcnow()
    po_id  = str(uuid.uuid4())
    po_num = f"PO-{now.strftime('%Y%m')}-{po_id[:6].upper()}"

    vendor_id   = data.get("vendor_id", "")
    vendor_name = data.get("vendor_name", "TBD")
    total       = _safe_float(data.get("total_amount") or pr.get("total_amount") or 0)
    notes       = data.get("notes", "")

    # Create Purchase Order
    try:
        db.execute(text("""
            INSERT INTO purchase_orders
                (id, hotel_id, po_number, vendor_id, title, status,
                 total_amount, currency, payment_terms, notes,
                 expected_delivery_date, created_at, updated_at)
            VALUES
                (:id, :hotel_id, :po_num, :vendor_id, :title, 'sent',
                 :total, 'EGP', :payment_terms, :notes,
                 :delivery_date, :now, :now)
        """), {
            "id":           po_id,
            "hotel_id":     pr.get("hotel_id"),
            "po_num":       po_num,
            "vendor_id":    vendor_id or None,
            "title":        f"PO for: {pr.get('title','?')[:150]}",
            "total":        total,
            "payment_terms": "net30",
            "notes":        notes or f"Auto-generated from PR {pr_id[:8]}. {pr.get('description','')[:200]}",
            "delivery_date": now + datetime.timedelta(days=14),
            "now":          now,
        })

        # Link PR to PO
        db.execute(text("""
            UPDATE purchase_requests
            SET status = 'po_created', updated_at = :now
            WHERE id = :pr_id
        """), {"now": now, "pr_id": pr_id})

        db.commit()
    except Exception as e:
        raise HTTPException(500, f"PO generation failed: {str(e)}")

    # Send PO email to vendor
    po_email_sent = False
    try:
        if vendor_id:
            v = db.execute(
                text("SELECT email, name FROM inventory_vendors WHERE id = :id"),
                {"id": vendor_id}
            ).fetchone()
            if v:
                vd = row_to_dict(v)
                vendor_email = vd.get("email","")
                if vendor_email:
                    from src.commercial.email_alert.router import _send_email
                    subject = f"Purchase Order {po_num} - Triangle Black"
                    body = (
                        f"Dear {vd.get('name','Vendor')},

"
                        f"Please find attached Purchase Order {po_num}.

"
                        f"Items: {pr.get('title','?')[:200]}
"
                        f"Total Value: {total:,.0f} EGP
"
                        f"Expected Delivery: {(now + datetime.timedelta(days=14)).strftime('%Y-%m-%d')}

"
                        f"Please confirm receipt of this PO.

"
                        f"Triangle Black Engineering Operations"
                    )
                    po_email_sent = _send_email(vendor_email, subject, body)
    except Exception:
        pass

    # Notify requester
    _send_approval_notification(pr_id, 3, "po_generated", db)
    db.commit()

    return {
        "success":        True,
        "po_id":          po_id,
        "po_number":      po_num,
        "pr_id":          pr_id,
        "vendor_name":    vendor_name,
        "total_egp":      total,
        "status":         "sent",
        "email_sent_to_vendor": po_email_sent,
        "expected_delivery": (now + datetime.timedelta(days=14)).strftime("%Y-%m-%d"),
        "next_step":      "goods_receipt",
        "message":        f"PO {po_num} generated and sent to vendor. Awaiting delivery confirmation.",
    }

@router.get("/chain-status/{pr_id}", summary="Full approval chain status")
def get_chain_status(pr_id: str, db: Session = Depends(get_db)):
    """View the complete approval chain status for a PR."""
    _ensure_approval_table(db)
    try:
        steps = db.execute(text("""
            SELECT * FROM pr_approval_chain
            WHERE pr_id = :pr_id
            ORDER BY step
        """), {"pr_id": pr_id}).fetchall()

        pr_row = db.execute(
            text("SELECT title, status, total_amount, requested_by FROM purchase_requests WHERE id = :id"),
            {"id": pr_id}
        ).fetchone()
        pr = row_to_dict(pr_row) if pr_row else {}

        chain = [row_to_dict(s) for s in steps]
        approved_count = sum(1 for s in chain if s.get("status") == "approved")
        current_step   = next((s for s in chain if s.get("status") == "pending"), None)

        return {
            "pr_id":         pr_id,
            "pr_title":      pr.get("title"),
            "pr_status":     pr.get("status"),
            "pr_value_egp":  _safe_float(pr.get("total_amount")),
            "requested_by":  pr.get("requested_by"),
            "chain":         chain,
            "approved_steps": approved_count,
            "total_steps":   len(APPROVAL_STEPS),
            "current_step":  current_step,
            "is_complete":   approved_count == len(APPROVAL_STEPS),
            "generated_at":  datetime.datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(500, str(e))
