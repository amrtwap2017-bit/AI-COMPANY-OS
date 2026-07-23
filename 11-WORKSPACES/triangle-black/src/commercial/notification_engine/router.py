from __future__ import annotations
import uuid, datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db

router = APIRouter(prefix="/notifications/live", tags=["notification-engine"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _ensure_notif_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS platform_notifications (
            id          VARCHAR(36) PRIMARY KEY,
            hotel_id    VARCHAR(36),
            user_id     VARCHAR(36),
            type        VARCHAR(50) NOT NULL,
            title       VARCHAR(200) NOT NULL,
            message     TEXT,
            priority    VARCHAR(20) DEFAULT 'medium',
            is_read     BOOLEAN DEFAULT FALSE,
            entity_type VARCHAR(50),
            entity_id   VARCHAR(36),
            action_url  TEXT,
            created_at  TIMESTAMP NOT NULL
        )
    """))
    db.commit()

def _generate_live_notifications(db):
    """Generate real-time notifications from operational data."""
    notifications = []
    now = datetime.datetime.utcnow()

    # Critical open WOs unassigned > 2 hours
    try:
        rows = db.execute(text("""
            SELECT id, title, created_at FROM work_orders
            WHERE priority = 'critical'
              AND status = 'open'
              AND technician_id IS NULL
              AND created_at < NOW() - INTERVAL '2 hours'
            LIMIT 5
        """)).fetchall()
        for row in rows:
            r = row_to_dict(row)
            notifications.append({
                "id":       str(uuid.uuid4()),
                "type":     "critical_wo_unassigned",
                "title":    "Critical WO Unassigned",
                "message":  f"Work order '{r.get('title','?')}' is critical and unassigned for >2 hours",
                "priority": "critical",
                "entity_type": "work_order",
                "entity_id":   r.get("id"),
                "action_url":  f"/operations/work-orders/{r.get('id')}",
                "created_at":  now.isoformat(),
            })
    except Exception:
        pass

    # Overdue maintenance plans
    try:
        rows = db.execute(text("""
            SELECT id, title, next_due_date FROM maintenance_plans
            WHERE next_due_date < CURRENT_DATE
              AND status = 'active'
            LIMIT 5
        """)).fetchall()
        for row in rows:
            r = row_to_dict(row)
            notifications.append({
                "id":       str(uuid.uuid4()),
                "type":     "pm_overdue",
                "title":    "Maintenance Plan Overdue",
                "message":  f"PM '{r.get('title','?')}' is past due",
                "priority": "high",
                "entity_type": "maintenance_plan",
                "entity_id":   r.get("id"),
                "action_url":  "/maintenance/schedule",
                "created_at":  now.isoformat(),
            })
    except Exception:
        pass

    # Stock below minimum
    try:
        rows = db.execute(text("""
            SELECT ii.id, ii.name, ii.min_stock, sb.quantity
            FROM inventory_items ii
            JOIN stock_balances sb ON sb.item_id = ii.id
            WHERE sb.quantity <= ii.min_stock
            LIMIT 3
        """)).fetchall()
        for row in rows:
            r = row_to_dict(row)
            notifications.append({
                "id":       str(uuid.uuid4()),
                "type":     "low_stock",
                "title":    "Low Stock Alert",
                "message":  f"'{r.get('name','?')}' at {r.get('quantity',0)} units (min: {r.get('min_stock',0)})",
                "priority": "high",
                "entity_type": "inventory_item",
                "entity_id":   r.get("id"),
                "action_url":  "/supply-chain/inventory",
                "created_at":  now.isoformat(),
            })
    except Exception:
        pass

    # Contracts expiring in 30 days
    try:
        rows = db.execute(text("""
            SELECT id, title, end_date FROM contracts
            WHERE end_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
              AND status = 'active'
            LIMIT 3
        """)).fetchall()
        for row in rows:
            r = row_to_dict(row)
            notifications.append({
                "id":       str(uuid.uuid4()),
                "type":     "contract_expiring",
                "title":    "Contract Expiring Soon",
                "message":  f"Contract '{r.get('title','?')}' expires on {str(r.get('end_date','?'))[:10]}",
                "priority": "medium",
                "entity_type": "contract",
                "entity_id":   r.get("id"),
                "action_url":  "/customers/success",
                "created_at":  now.isoformat(),
            })
    except Exception:
        pass

    # Overdue invoices
    try:
        rows = db.execute(text("""
            SELECT id, total_amount FROM invoices
            WHERE status IN ('unpaid','overdue')
              AND due_date < NOW()
            LIMIT 3
        """)).fetchall()
        for row in rows:
            r = row_to_dict(row)
            notifications.append({
                "id":       str(uuid.uuid4()),
                "type":     "invoice_overdue",
                "title":    "Invoice Overdue",
                "message":  f"Invoice of {float(r.get('total_amount',0)):,.0f} EGP is past due",
                "priority": "high",
                "entity_type": "invoice",
                "entity_id":   r.get("id"),
                "action_url":  "/supply-chain/invoices",
                "created_at":  now.isoformat(),
            })
    except Exception:
        pass

    return notifications

@router.get("/", summary="Live platform notifications")
def get_live_notifications(
    hotel_id: str = Query(default=None),
    limit: int = Query(default=20, le=50),
    db: Session = Depends(get_db),
):
    """Returns live operational notifications generated from real DB data."""
    _ensure_notif_table(db)
    notifications = _generate_live_notifications(db)

    # Sort by priority
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    notifications.sort(key=lambda n: priority_order.get(n.get("priority","medium"), 2))

    critical = sum(1 for n in notifications if n.get("priority") == "critical")
    high     = sum(1 for n in notifications if n.get("priority") == "high")

    return {
        "total":        len(notifications),
        "critical":     critical,
        "high":         high,
        "notifications": notifications[:limit],
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "refresh_interval_seconds": 30,
    }

@router.post("/mark-read/{notification_id}", summary="Mark notification read")
def mark_read(notification_id: str, db: Session = Depends(get_db)):
    """Mark a stored notification as read."""
    _ensure_notif_table(db)
    try:
        db.execute(text(
            "UPDATE platform_notifications SET is_read = TRUE WHERE id = :id"
        ), {"id": notification_id})
        db.commit()
    except Exception:
        pass
    return {"success": True, "notification_id": notification_id}

@router.get("/count", summary="Unread notification count")
def notification_count(db: Session = Depends(get_db)):
    """Quick count for notification badge in UI."""
    notifications = _generate_live_notifications(db)
    critical = sum(1 for n in notifications if n.get("priority") == "critical")
    high     = sum(1 for n in notifications if n.get("priority") == "high")
    return {
        "total":    len(notifications),
        "critical": critical,
        "high":     high,
        "badge":    critical + high,
    }
