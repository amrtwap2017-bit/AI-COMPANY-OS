from __future__ import annotations
from src.core.auth import get_current_user
from src.commercial.auth.models import User
from fastapi import Depends
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from typing import Optional
import datetime
from datetime import datetime as _dt

def row_to_dict(row):
    if row is None: return None
    if hasattr(row, "_mapping"): d = dict(row._mapping)
    elif hasattr(row, "__dict__"): d = {k:v for k,v in row.__dict__.items() if not k.startswith("_")}
    else: return {}
    return {k: (v.isoformat() if hasattr(v,"isoformat") else v) for k,v in d.items()}

def rows(result): return [row_to_dict(r) for r in result]
router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/kpis", summary="Cross-center KPIs")
def analytics_kpis(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    total_leads       = db.execute(text("SELECT COUNT(*) FROM leads WHERE hotel_id=:hotel_id"), h).scalar() or 0
    won_leads         = db.execute(text("SELECT COUNT(*) FROM leads WHERE hotel_id=:hotel_id AND status='won'"), h).scalar() or 0
    total_wos         = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id"), h).scalar() or 0
    completed_wos     = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id AND status='completed'"), h).scalar() or 0
    active_contracts  = db.execute(text("SELECT COUNT(*) FROM contracts WHERE hotel_id=:hotel_id AND status='active'"), h).scalar() or 0
    total_inv_value   = db.execute(text("SELECT COALESCE(SUM(total_amount),0) FROM invoices WHERE hotel_id=:hotel_id AND status='paid'"), h).scalar() or 0
    active_techs      = db.execute(text("SELECT COUNT(*) FROM technicians WHERE hotel_id=:hotel_id AND is_active=true"), h).scalar() or 0
    conv_rate = round((won_leads / total_leads * 100), 1) if total_leads > 0 else 0
    comp_rate = round((completed_wos / total_wos * 100), 1) if total_wos > 0 else 0
    return {
        "commercial": {
            "total_leads":       total_leads,
            "won_leads":         won_leads,
            "conversion_rate":   conv_rate,
            "active_contracts":  active_contracts,
            "revenue_collected": float(total_inv_value),
        },
        "operations": {
            "total_work_orders":     total_wos,
            "completed_work_orders": completed_wos,
            "completion_rate":       comp_rate,
            "active_technicians":    active_techs,
        },
        "generated_at": _dt.utcnow().isoformat(),
    }

@router.get("/scorecards", summary="Enterprise scorecards")
def analytics_scorecards(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    kpi_rows = rows(db.execute(text("SELECT * FROM kpi_snapshots ORDER BY created_at DESC LIMIT 20")).fetchall())
    total_leads  = db.execute(text("SELECT COUNT(*) FROM leads WHERE hotel_id=:hotel_id"), h).scalar() or 0
    won_leads    = db.execute(text("SELECT COUNT(*) FROM leads WHERE hotel_id=:hotel_id AND status='won'"), h).scalar() or 0
    total_wos    = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id"), h).scalar() or 0
    done_wos     = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id AND status='completed'"), h).scalar() or 0
    scorecards = [
        {"domain":"Commercial","score": round((won_leads/total_leads*100),1) if total_leads else 0,"label":"Lead Conversion %","target":20},
        {"domain":"Operations","score": round((done_wos/total_wos*100),1) if total_wos else 0,"label":"WO Completion %","target":85},
    ]
    return {"scorecards": scorecards, "snapshots": kpi_rows[:10]}

@router.get("/sla", summary="SLA metrics")
def analytics_sla(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    total_wos     = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id"), h).scalar() or 1
    completed_wos = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id AND status='completed'"), h).scalar() or 0
    critical_open = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id AND priority='critical' AND status!='completed'"), h).scalar() or 0
    compliance = round((completed_wos / total_wos) * 100, 1)
    return {
        "compliance_rate":    compliance,
        "total_work_orders":  total_wos,
        "completed":          completed_wos,
        "critical_open":      critical_open,
        "sla_target":         95.0,
        "sla_status":         "compliant" if compliance >= 95 else "at_risk",
    }

@router.get("/trends", summary="Trend data for charts")
def analytics_trends(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    monthly_leads = rows(db.execute(text(
        "SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count"
        " FROM leads WHERE hotel_id=:hotel_id"
        " GROUP BY month ORDER BY month DESC LIMIT 6"
    ), h).fetchall())
    monthly_wos = rows(db.execute(text(
        "SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count"
        " FROM work_orders WHERE hotel_id=:hotel_id"
        " GROUP BY month ORDER BY month DESC LIMIT 6"
    ), h).fetchall())
    return {"leads_trend": monthly_leads, "work_orders_trend": monthly_wos}
