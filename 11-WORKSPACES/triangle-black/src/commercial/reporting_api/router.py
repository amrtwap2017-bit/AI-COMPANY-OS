"""Reporting API Router — extracted from main.py A-007 batch 6"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/reports-v2", tags=["reports"])

@router.get("/maintenance")
def maintenance_report(hotel_id: str = Depends(get_hotel_id),
                        db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("""
            SELECT
                a.category,
                COUNT(wo.id) AS total_work_orders,
                COUNT(wo.id) FILTER (WHERE LOWER(wo.status) IN ('completed','closed')) AS completed,
                COUNT(wo.id) FILTER (WHERE LOWER(wo.type) = 'preventive') AS preventive,
                COUNT(wo.id) FILTER (WHERE LOWER(wo.type) = 'corrective') AS corrective,
                COALESCE(SUM(inv.amount), 0) AS total_cost
            FROM assets a
            LEFT JOIN work_orders wo ON wo.asset_id = a.id AND wo.hotel_id = :hid AND wo.deleted_at IS NULL
            LEFT JOIN invoices inv ON inv.work_order_id = wo.id AND inv.deleted_at IS NULL
            WHERE a.hotel_id = :hid AND a.deleted_at IS NULL
            GROUP BY a.category
            ORDER BY total_cost DESC
        """), {"hid": hotel_id}).fetchall()
        return {"hotel_id": hotel_id, "report_type": "MAINTENANCE",
                "by_category": [dict(r._mapping) for r in rows]}
    except Exception as e:
        return {"hotel_id": hotel_id, "error": str(e)[:100]}

@router.get("/procurement")
def procurement_report(hotel_id: str = Depends(get_hotel_id),
                        db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("""
            SELECT
                s.company_name AS supplier,
                s.category,
                COUNT(po.id) AS purchase_orders,
                COALESCE(SUM(po.total_amount), 0) AS total_spend,
                ROUND(AVG(po.total_amount)::numeric, 2) AS avg_order_value
            FROM suppliers s
            LEFT JOIN purchase_orders po ON po.supplier_id = s.id AND po.hotel_id = :hid
            WHERE s.hotel_id = :hid
            GROUP BY s.company_name, s.category
            ORDER BY total_spend DESC
            LIMIT 20
        """), {"hid": hotel_id}).fetchall()
        return {"hotel_id": hotel_id, "report_type": "PROCUREMENT",
                "by_supplier": [dict(r._mapping) for r in rows]}
    except Exception as e:
        return {"hotel_id": hotel_id, "error": str(e)[:100]}

@router.get("/executive-brief")
def executive_brief(hotel_id: str = Depends(get_hotel_id),
                     db: Session = Depends(get_db)):
    """One-page executive briefing report."""
    try:
        wo_row = db.execute(text("""
            SELECT COUNT(*) AS total,
                   COUNT(*) FILTER (WHERE status='open') AS open,
                   COUNT(*) FILTER (WHERE status IN ('completed','closed')) AS done
            FROM work_orders WHERE hotel_id=:hid AND deleted_at IS NULL
        """), {"hid": hotel_id}).fetchone()
        inv_row = db.execute(text("""
            SELECT COALESCE(SUM(amount),0) AS total,
                   COALESCE(SUM(amount) FILTER (WHERE LOWER(status)='paid'),0) AS paid
            FROM invoices WHERE hotel_id=:hid AND deleted_at IS NULL
        """), {"hid": hotel_id}).fetchone()
        asset_row = db.execute(text(
            "SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE criticality='critical') AS critical "
            "FROM assets WHERE hotel_id=:hid AND deleted_at IS NULL"
        ), {"hid": hotel_id}).fetchone()

        return {
            "hotel_id": hotel_id,
            "report_type": "EXECUTIVE_BRIEF",
            "work_orders": dict(wo_row._mapping) if wo_row else {},
            "financials": dict(inv_row._mapping) if inv_row else {},
            "assets": dict(asset_row._mapping) if asset_row else {},
        }
    except Exception as e:
        return {"hotel_id": hotel_id, "error": str(e)[:100]}
