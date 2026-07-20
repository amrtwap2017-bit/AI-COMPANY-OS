from __future__ import annotations
from src.core.auth import get_current_user
from src.commercial.auth.models import User
from fastapi import Depends
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from typing import Optional
import datetime

def row_to_dict(row):
    if row is None: return None
    if hasattr(row, "_mapping"): d = dict(row._mapping)
    elif hasattr(row, "__dict__"): d = {k:v for k,v in row.__dict__.items() if not k.startswith("_")}
    else: return {}
    return {k: (v.isoformat() if hasattr(v,"isoformat") else v) for k,v in d.items()}

def rows(result): return [row_to_dict(r) for r in result]
router = APIRouter(prefix="/actions/executive", tags=["executive-intelligence"])

@router.get("/dashboard", summary="Executive dashboard")
def executive_dashboard(hotel_id: Optional[str] = None, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    active_leads      = db.execute(text("SELECT COUNT(*) FROM leads WHERE hotel_id=:hotel_id"), h).scalar() or 0
    won_leads         = db.execute(text("SELECT COUNT(*) FROM leads WHERE hotel_id=:hotel_id AND status='won'"), h).scalar() or 0
    open_wos          = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id AND status='open'"), h).scalar() or 0
    active_contracts  = db.execute(text("SELECT COUNT(*) FROM contracts WHERE hotel_id=:hotel_id AND status='active'"), h).scalar() or 0
    total_quotes      = db.execute(text("SELECT COUNT(*) FROM quotes WHERE hotel_id=:hotel_id"), h).scalar() or 0
    pending_pos       = db.execute(text("SELECT COUNT(*) FROM purchase_orders WHERE hotel_id=:hotel_id AND status IN ('pending','approved')"), h).scalar() or 0
    open_invoices     = db.execute(text("SELECT COUNT(*) FROM invoices WHERE hotel_id=:hotel_id AND status IN ('draft','sent')"), h).scalar() or 0
    total_inv_value   = db.execute(text("SELECT COALESCE(SUM(total_amount),0) FROM invoices WHERE hotel_id=:hotel_id AND status='paid'"), h).scalar() or 0
    return {
        "kpis": {
            "active_leads":      active_leads,
            "won_leads":         won_leads,
            "open_work_orders":  open_wos,
            "active_contracts":  active_contracts,
            "total_quotes":      total_quotes,
            "pending_pos":       pending_pos,
            "open_invoices":     open_invoices,
            "revenue_collected": float(total_inv_value),
        },
        "health": "operational",
        "period": "current",
        "generated_at": datetime.datetime.utcnow().isoformat(),
    }

@router.get("/intelligence", summary="Executive intelligence summary")
def executive_intelligence(hotel_id: Optional[str] = None, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    hot_leads = rows(db.execute(text(
        "SELECT * FROM leads WHERE hotel_id=:hotel_id AND status='negotiation' ORDER BY updated_at DESC LIMIT 5"
    ), h).fetchall())
    overdue_inv = db.execute(text(
        "SELECT COUNT(*) FROM invoices WHERE hotel_id=:hotel_id AND due_date < NOW() AND status!='paid'"
    ), h).scalar() or 0
    critical_wos = db.execute(text(
        "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id AND priority='critical' AND status!='completed'"
    ), h).scalar() or 0
    return {
        "hot_deals":       hot_leads,
        "overdue_invoices": overdue_inv,
        "critical_ops":    critical_wos,
        "signals": [
            {"type":"deal","message": f"{len(hot_leads)} deals in negotiation stage"},
            {"type":"financial","message": f"{overdue_inv} invoices overdue"},
            {"type":"operations","message": f"{critical_wos} critical work orders open"},
        ],
    }

@router.get("/portfolio", summary="Portfolio overview")
def executive_portfolio(hotel_id: Optional[str] = None, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    contracts = rows(db.execute(text(
        "SELECT * FROM contracts WHERE hotel_id=:hotel_id ORDER BY created_at DESC LIMIT 20"
    ), h).fetchall())
    total_value = sum(float(c.get("total_value",0) or 0) for c in contracts)
    active      = [c for c in contracts if c.get("status") == "active"]
    return {
        "contracts":        contracts,
        "total_contracts":  len(contracts),
        "active_contracts": len(active),
        "total_value":      total_value,
        "currency":         "EGP",
    }

@router.get("/risks", summary="Enterprise risk signals")
def executive_risks(hotel_id: Optional[str] = None, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    risks = []
    overdue = db.execute(text("SELECT COUNT(*) FROM invoices WHERE hotel_id=:hotel_id AND due_date < NOW() AND status!='paid'"), h).scalar() or 0
    if overdue:  risks.append({"id":"fin-001","type":"financial","level":"high","title":"Overdue Invoices","count":overdue})
    critical = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id AND priority='critical' AND status!='completed'"), h).scalar() or 0
    if critical: risks.append({"id":"ops-001","type":"operational","level":"critical","title":"Critical Work Orders","count":critical})
    return {"risks": risks, "total_risks": len(risks), "risk_score": len(risks) * 25}

@router.get("/exceptions", summary="Exception items requiring leadership attention")
def executive_exceptions(hotel_id: Optional[str] = None, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    pending_quotes = db.execute(text("SELECT COUNT(*) FROM quotes WHERE hotel_id=:hotel_id AND status='review'"), h).scalar() or 0
    stale_leads    = db.execute(text("SELECT COUNT(*) FROM leads WHERE hotel_id=:hotel_id AND status='new' AND updated_at < NOW() - INTERVAL '7 days'"), h).scalar() or 0
    return {
        "exceptions": [
            {"type":"quote_review","count":pending_quotes,"action":"Approve pending quotes"},
            {"type":"stale_leads","count":stale_leads,"action":"Follow up on cold leads"},
        ],
        "total": pending_quotes + stale_leads,
    }

@router.get("/daily-review", summary="Executive daily review")
def executive_daily_review(hotel_id: Optional[str] = None, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    today_wos = rows(db.execute(text(
        "SELECT * FROM work_orders WHERE hotel_id=:hotel_id AND DATE(created_at)=CURRENT_DATE"
    ), h).fetchall())
    today_leads = rows(db.execute(text(
        "SELECT * FROM leads WHERE hotel_id=:hotel_id AND DATE(created_at)=CURRENT_DATE"
    ), h).fetchall())
    return {
        "date":        datetime.date.today().isoformat(),
        "new_leads":   today_leads,
        "new_wos":     today_wos,
        "summary": {
            "leads_today":      len(today_leads),
            "work_orders_today":len(today_wos),
        },
    }

@router.get("/alerts/predictive", summary="Predictive alerts")
def predictive_alerts(hotel_id: Optional[str] = None, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    overdue_inv  = db.execute(text("SELECT COUNT(*) FROM invoices WHERE hotel_id=:hotel_id AND due_date < NOW()"), h).scalar() or 0
    low_stock    = db.execute(text("SELECT COUNT(*) FROM inventory_items WHERE hotel_id=:hotel_id AND min_stock > 0 AND reorder_qty > 0"), h).scalar() or 0
    open_wos     = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id AND status='open'"), h).scalar() or 0
    alerts = []
    if overdue_inv: alerts.append({"id":"overdue-inv","type":"financial","severity":"high","title":"Overdue Invoices","message":f"{overdue_inv} invoices past due","count":overdue_inv})
    if low_stock:   alerts.append({"id":"low-stock","type":"inventory","severity":"medium","title":"Low Stock","message":f"{low_stock} items below minimum","count":low_stock})
    if open_wos:    alerts.append({"id":"open-wos","type":"operations","severity":"low","title":"Open Work Orders","message":f"{open_wos} work orders pending","count":open_wos})
    return {"alerts": alerts, "total": len(alerts), "generated_at": datetime.datetime.utcnow().isoformat()}
