"""Executive API Router — extracted from main.py A-007 batch 7"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from datetime import datetime

router = APIRouter(prefix="/executive-v2", tags=["executive"])

@router.get("/kpi")
def get_executive_kpi(hotel_id: str = Depends(get_hotel_id),
                       db: Session = Depends(get_db)):
    """Real-time executive KPI dashboard."""
    try:
        assets = db.execute(text(
            "SELECT COUNT(*) FROM assets WHERE hotel_id=:hid AND deleted_at IS NULL"
        ), {"hid": hotel_id}).scalar() or 0
        critical = db.execute(text(
            "SELECT COUNT(*) FROM assets WHERE hotel_id=:hid AND criticality='critical' AND deleted_at IS NULL"
        ), {"hid": hotel_id}).scalar() or 0
        open_wo = db.execute(text(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND status='open' AND deleted_at IS NULL"
        ), {"hid": hotel_id}).scalar() or 0
        completed_wo = db.execute(text(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND status IN ('completed','closed') AND deleted_at IS NULL"
        ), {"hid": hotel_id}).scalar() or 0
        total_spend = db.execute(text(
            "SELECT COALESCE(SUM(amount),0) FROM invoices WHERE hotel_id=:hid AND deleted_at IS NULL"
        ), {"hid": hotel_id}).scalar() or 0
        suppliers = db.execute(text(
            "SELECT COUNT(*) FROM suppliers WHERE hotel_id=:hid"
        ), {"hid": hotel_id}).scalar() or 0

        total_wo = open_wo + completed_wo
        completion_rate = round(completed_wo / max(total_wo, 1) * 100, 1)
        asset_health = round((assets - critical) / max(assets, 1) * 100, 1)

        return {
            "hotel_id": hotel_id,
            "generated_at": datetime.utcnow().isoformat(),
            "assets": {"total": assets, "critical": critical, "health_pct": asset_health},
            "work_orders": {"open": open_wo, "completed": completed_wo,
                           "total": total_wo, "completion_rate_pct": completion_rate},
            "financials": {"total_spend_usd": float(total_spend)},
            "procurement": {"active_suppliers": suppliers},
            "overall_health_grade": "A" if asset_health >= 90 and completion_rate >= 85 else
                                    "B" if asset_health >= 75 else "C"
        }
    except Exception as e:
        return {"hotel_id": hotel_id, "error": str(e)[:100]}

@router.get("/alerts")
def get_executive_alerts(hotel_id: str = Depends(get_hotel_id),
                          db: Session = Depends(get_db)):
    """Critical alerts requiring executive attention."""
    alerts = []
    try:
        critical_open = db.execute(text(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND priority='critical' "
            "AND status='open' AND deleted_at IS NULL"
        ), {"hid": hotel_id}).scalar() or 0
        if critical_open > 0:
            alerts.append({"level": "CRITICAL", "category": "WORK_ORDERS",
                           "message": f"{critical_open} critical priority work orders open",
                           "action": "Review and assign immediately"})

        overdue = db.execute(text(
            "SELECT COUNT(*) FROM invoices WHERE hotel_id=:hid AND LOWER(status)='overdue' "
            "AND deleted_at IS NULL"
        ), {"hid": hotel_id}).scalar() or 0
        if overdue > 0:
            alerts.append({"level": "HIGH", "category": "FINANCE",
                           "message": f"{overdue} invoices overdue",
                           "action": "Review payment status"})

        failed = db.execute(text(
            "SELECT COUNT(*) FROM assets WHERE hotel_id=:hid AND LOWER(status)='failed' "
            "AND deleted_at IS NULL"
        ), {"hid": hotel_id}).scalar() or 0
        if failed > 0:
            alerts.append({"level": "CRITICAL", "category": "ASSETS",
                           "message": f"{failed} assets in failed status",
                           "action": "Emergency maintenance required"})

        if not alerts:
            alerts.append({"level": "INFO", "category": "SYSTEM",
                           "message": "All systems operating normally",
                           "action": "Continue standard monitoring"})

        return {"hotel_id": hotel_id, "alert_count": len(alerts), "alerts": alerts}
    except Exception as e:
        return {"hotel_id": hotel_id, "alert_count": 0, "alerts": [], "error": str(e)[:100]}

@router.get("/daily-brief")
def get_daily_brief(hotel_id: str = Depends(get_hotel_id),
                     db: Session = Depends(get_db)):
    """Daily operational briefing for executives."""
    try:
        today_wo = db.execute(text(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND deleted_at IS NULL "
            "AND created_at::date = CURRENT_DATE"
        ), {"hid": hotel_id}).scalar() or 0
        completed_today = db.execute(text(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND deleted_at IS NULL "
            "AND status IN ('completed','closed') AND updated_at::date = CURRENT_DATE"
        ), {"hid": hotel_id}).scalar() or 0
        new_suppliers = db.execute(text(
            "SELECT COUNT(*) FROM suppliers WHERE hotel_id=:hid "
            "AND created_at::date >= CURRENT_DATE - 7"
        ), {"hid": hotel_id}).scalar() or 0

        return {
            "hotel_id": hotel_id,
            "date": datetime.utcnow().date().isoformat(),
            "today": {
                "new_work_orders": today_wo,
                "completed_work_orders": completed_today,
                "new_suppliers_7d": new_suppliers,
            },
            "briefing_type": "DAILY_EXECUTIVE"
        }
    except Exception as e:
        return {"hotel_id": hotel_id, "error": str(e)[:100]}
