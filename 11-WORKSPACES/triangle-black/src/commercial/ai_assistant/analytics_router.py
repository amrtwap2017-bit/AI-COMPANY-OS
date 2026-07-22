from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from datetime import datetime

router = APIRouter(prefix="/ai", tags=["analytics-sla"])


@router.get("/analytics/sla", summary="SLA compliance metrics from work orders")
def get_sla_metrics(db: Session = Depends(get_db)):
    try:
        row = db.execute(text("""
            SELECT
                count(*) as total,
                count(*) FILTER (WHERE status='completed') as completed,
                count(*) FILTER (WHERE status='open') as open_count,
                count(*) FILTER (WHERE status='in_progress') as in_progress,
                count(*) FILTER (WHERE
                    due_date IS NOT NULL
                    AND due_date < NOW()
                    AND status != 'completed'
                ) as overdue,
                count(*) FILTER (WHERE type='hvac') as hvac_total,
                count(*) FILTER (WHERE type='hvac' AND status='completed') as hvac_done,
                count(*) FILTER (WHERE type='electrical') as elec_total,
                count(*) FILTER (WHERE type='electrical' AND status='completed') as elec_done,
                count(*) FILTER (WHERE type='plumbing') as plumb_total,
                count(*) FILTER (WHERE type='plumbing' AND status='completed') as plumb_done,
                count(*) FILTER (WHERE type='mechanical') as mech_total,
                count(*) FILTER (WHERE type='mechanical' AND status='completed') as mech_done
            FROM work_orders
        """)).fetchone()

        total = row.total or 1
        completed = row.completed or 0
        compliance_rate = round((completed / total) * 100, 1)
        sla_target = 95.0
        sla_status = "compliant" if compliance_rate >= sla_target else "at_risk"

        def type_rate(done, ttl):
            return round((done / ttl) * 100, 1) if ttl > 0 else 0.0

        return {
            "compliance_rate": compliance_rate,
            "sla_target": sla_target,
            "sla_status": sla_status,
            "total_work_orders": total,
            "completed": completed,
            "open": row.open_count or 0,
            "in_progress": row.in_progress or 0,
            "overdue": row.overdue or 0,
            "by_type": {
                "hvac": {
                    "total": row.hvac_total or 0,
                    "completed": row.hvac_done or 0,
                    "rate": type_rate(row.hvac_done or 0, row.hvac_total or 1)
                },
                "electrical": {
                    "total": row.elec_total or 0,
                    "completed": row.elec_done or 0,
                    "rate": type_rate(row.elec_done or 0, row.elec_total or 1)
                },
                "plumbing": {
                    "total": row.plumb_total or 0,
                    "completed": row.plumb_done or 0,
                    "rate": type_rate(row.plumb_done or 0, row.plumb_total or 1)
                },
                "mechanical": {
                    "total": row.mech_total or 0,
                    "completed": row.mech_done or 0,
                    "rate": type_rate(row.mech_done or 0, row.mech_total or 1)
                },
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "compliance_rate": 0,
            "sla_target": 95.0,
            "sla_status": "error",
            "error": str(e)
        }


@router.get("/analytics/kpis/live", summary="Live operational KPIs for executive dashboard")
def get_live_kpis(db: Session = Depends(get_db)):
    try:
        wo = db.execute(text(
            "SELECT count(*) as total, "
            "count(*) FILTER (WHERE status='open') as open_count, "
            "count(*) FILTER (WHERE status='in_progress') as active, "
            "count(*) FILTER (WHERE priority='critical' AND status='open') as critical "
            "FROM work_orders"
        )).fetchone()

        tech = db.execute(text(
            "SELECT count(*) as total, "
            "count(*) FILTER (WHERE is_active=true) as active, "
            "sum(current_work_orders) as assigned, "
            "sum(max_work_orders) as capacity "
            "FROM technicians"
        )).fetchone()

        inv = db.execute(text(
            "SELECT count(*) as total_items, "
            "count(*) FILTER (WHERE sb.qty_on_hand < ii.min_stock AND ii.min_stock > 0) as below_min "
            "FROM inventory_items ii "
            "LEFT JOIN stock_balances sb ON sb.item_id = ii.id"
        )).fetchone()

        po = db.execute(text(
            "SELECT count(*) as total, "
            "sum(total_amount) as total_value "
            "FROM purchase_orders WHERE status != 'cancelled'"
        )).fetchone()

        tech_cap = round(
            ((tech.assigned or 0) / max(tech.capacity or 1, 1)) * 100, 1
        )

        return {
            "work_orders": {
                "total": wo.total or 0,
                "open": wo.open_count or 0,
                "active": wo.active or 0,
                "critical_open": wo.critical or 0,
            },
            "technicians": {
                "total": tech.total or 0,
                "active": tech.active or 0,
                "utilization_pct": tech_cap,
            },
            "inventory": {
                "total_items": inv.total_items or 0,
                "below_minimum": inv.below_min or 0,
            },
            "procurement": {
                "total_pos": po.total or 0,
                "total_value_egp": float(po.total_value or 0),
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}
