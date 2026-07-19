from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import get_current_user
from src.commercial.auth.models import User

router = APIRouter(
    prefix="/executive-intelligence",
    tags=["executive-intelligence"],
)


@router.get("/ceo/dashboard")
def ceo_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    active_leads = db.execute(text("SELECT COUNT(*) FROM leads")).scalar() or 0
    open_work_orders = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE status = 'open'")).scalar() or 0
    active_contracts = db.execute(text("SELECT COUNT(*) FROM contracts WHERE status = 'active'")).scalar() or 0
    overdue_invoices = db.execute(text("SELECT COUNT(*) FROM invoices WHERE due_date < NOW()")).scalar() or 0
    pending_purchase_orders = db.execute(text("SELECT COUNT(*) FROM purchase_orders WHERE status = 'pending'")).scalar() or 0

    return {
        "kpis": {
            "active_leads": active_leads,
            "open_work_orders": open_work_orders,
            "active_contracts": active_contracts,
            "overdue_invoices": overdue_invoices,
            "pending_purchase_orders": pending_purchase_orders,
        },
        "health": "operational",
        "period": "current",
    }


@router.get("/alerts/predictive")
def predictive_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    overdue_invoices = db.execute(text("SELECT COUNT(*) FROM invoices WHERE due_date < NOW()")).scalar() or 0
    low_stock = db.execute(text("SELECT COUNT(*) FROM inventory_items WHERE min_stock > 0 AND reorder_qty > 0")).scalar() or 0
    open_work_orders = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE status = 'open'")).scalar() or 0

    alerts = []

    if overdue_invoices > 0:
        alerts.append({
            "id": "overdue-invoices",
            "type": "financial",
            "severity": "high",
            "title": "Overdue Invoices",
            "message": f"{overdue_invoices} invoices past due date",
            "count": overdue_invoices,
        })

    if low_stock > 0:
        alerts.append({
            "id": "low-stock",
            "type": "inventory",
            "severity": "medium",
            "title": "Low Stock Items",
            "message": f"{low_stock} items below minimum stock level",
            "count": low_stock,
        })

    if open_work_orders > 0:
        alerts.append({
            "id": "open-work-orders",
            "type": "operations",
            "severity": "low",
            "title": "Open Work Orders",
            "message": f"{open_work_orders} work orders pending",
            "count": open_work_orders,
        })

    return {
        "alerts": alerts,
        "total": len(alerts),
        "generated_at": "now",
    }