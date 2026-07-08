"""
Triangle Black — Business Logic Engine
MT-002: All queries accept hotel_id for tenant isolation.
"""
from __future__ import annotations
import uuid
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from src.commercial.lead_management.models import Lead
from src.commercial.agent_management.models import Agent
from src.commercial.quotation.models import Quote
from src.commercial.activity_tracking.models import Activity

DEFAULT_HOTEL_ID = "tb-default-hotel-000000000001"


# ─── QUALIFICATION ENGINE ─────────────────────────────────────────────────────

QUALIFICATION_RULES = {
    "source":     {"referral": 30, "direct": 20, "web": 10},
    "priority":   {"high": 30, "medium": 20, "low": 10},
    "has_company": 20,
    "has_phone":   10,
    "has_notes":   10,
}


def qualify_lead(lead: Lead) -> dict:
    score = 0
    reasoning = []
    source_score = QUALIFICATION_RULES["source"].get(lead.source, 5)
    score += source_score
    reasoning.append(f"Source '{lead.source}': +{source_score}")
    priority_score = QUALIFICATION_RULES["priority"].get(lead.priority, 10)
    score += priority_score
    reasoning.append(f"Priority '{lead.priority}': +{priority_score}")
    if lead.company:
        score += QUALIFICATION_RULES["has_company"]
        reasoning.append(f"Company provided: +{QUALIFICATION_RULES['has_company']}")
    if lead.phone:
        score += QUALIFICATION_RULES["has_phone"]
        reasoning.append(f"Phone provided: +{QUALIFICATION_RULES['has_phone']}")
    if lead.notes:
        score += QUALIFICATION_RULES["has_notes"]
        reasoning.append(f"Notes provided: +{QUALIFICATION_RULES['has_notes']}")
    score = min(score, 100)
    grade = "qualified" if score >= 70 else "warm" if score >= 40 else "cold"
    status = "qualified" if score >= 40 else "new"
    return {"score": score, "grade": grade, "status": status, "reasoning": reasoning}


# ─── AGENT ASSIGNMENT ─────────────────────────────────────────────────────────

def find_best_agent(
    db: Session,
    hotel_id: str = DEFAULT_HOTEL_ID,
) -> Optional[Agent]:
    agents = (
        db.query(Agent)
        .filter(Agent.is_active == True, Agent.hotel_id == hotel_id)
        .order_by((Agent.max_leads - Agent.current_leads).desc())
        .all()
    )
    for agent in agents:
        if agent.current_leads < agent.max_leads:
            return agent
    return None


def release_agent_capacity(
    db: Session,
    lead: Lead,
    hotel_id: str = DEFAULT_HOTEL_ID,
) -> None:
    if lead.status == "assigned":
        agents = db.query(Agent).filter(
            Agent.current_leads > 0,
            Agent.is_active == True,
            Agent.hotel_id == hotel_id,
        ).all()
        if agents:
            agent = agents[0]
            agent.current_leads = max(0, agent.current_leads - 1)
            agent.updated_at = datetime.utcnow()


# ─── QUOTE GENERATOR ─────────────────────────────────────────────────────────

SERVICE_PRICING = {
    "hvac":        {"name": "HVAC Maintenance",      "unit_price": 3500.0, "unit": "month"},
    "electrical":  {"name": "Electrical Systems",    "unit_price": 2800.0, "unit": "month"},
    "plumbing":    {"name": "Plumbing Systems",      "unit_price": 2200.0, "unit": "month"},
    "fire":        {"name": "Fire Fighting Systems", "unit_price": 1800.0, "unit": "month"},
    "general":     {"name": "General Engineering",   "unit_price": 4500.0, "unit": "month"},
    "procurement": {"name": "Procurement Services",  "unit_price": 1500.0, "unit": "month"},
    "kitchen":     {"name": "Kitchen Equipment",     "unit_price": 3000.0, "unit": "month"},
    "laundry":     {"name": "Laundry Systems",       "unit_price": 2500.0, "unit": "month"},
    "pool":        {"name": "Pool Systems",           "unit_price": 2000.0, "unit": "month"},
}
PRIORITY_MULTIPLIER = {"high": 1.2, "medium": 1.0, "low": 0.9}


def generate_quote_from_lead(lead: Lead, contract_months: int = 12) -> dict:
    notes_lower = (lead.notes or "").lower()
    company_lower = (lead.company or "").lower()
    combined = notes_lower + " " + company_lower
    detected = [k for k in SERVICE_PRICING if k in combined]
    if not detected:
        detected = ["general"]
    multiplier = PRIORITY_MULTIPLIER.get(lead.priority, 1.0)
    items = []
    total = 0.0
    for key in detected:
        s = SERVICE_PRICING[key]
        unit_price = round(s["unit_price"] * multiplier, 2)
        line_total = round(unit_price * contract_months, 2)
        items.append({
            "service": s["name"], "unit": s["unit"],
            "qty": contract_months, "unit_price": unit_price, "total": line_total,
        })
        total += line_total
    return {
        "title": f"Engineering Services Contract — {lead.company or lead.name}",
        "description": (
            f"Annual engineering maintenance contract for {lead.company or lead.name}. "
            f"Duration: {contract_months} months. Priority: {lead.priority}."
        ),
        "lead_id": lead.id,
        "items": items,
        "total": round(total, 2),
        "status": "draft",
        "validity_date": datetime.utcnow() + timedelta(days=30),
    }


# ─── DUPLICATE DETECTION ─────────────────────────────────────────────────────

def check_duplicate_lead(
    db: Session,
    email: str,
    exclude_id: str = None,
    hotel_id: str = DEFAULT_HOTEL_ID,
) -> Optional[Lead]:
    q = db.query(Lead).filter(
        Lead.email == email,
        Lead.hotel_id == hotel_id,
    )
    if exclude_id:
        q = q.filter(Lead.id != exclude_id)
    return q.first()


# ─── QUOTE EXPIRY ─────────────────────────────────────────────────────────────

def expire_overdue_quotes(
    db: Session,
    hotel_id: str = DEFAULT_HOTEL_ID,
) -> int:
    now = datetime.utcnow()
    expired = (
        db.query(Quote)
        .filter(
            Quote.status == "sent",
            Quote.validity_date < now,
            Quote.hotel_id == hotel_id,
        )
        .all()
    )
    for q in expired:
        q.status = "rejected"
        q.updated_at = now
    db.commit()
    return len(expired)


# ─── LEAD SEARCH ─────────────────────────────────────────────────────────────

def search_leads(
    db: Session, q: str,
    status: str = None, source: str = None,
    priority: str = None, limit: int = 50,
    hotel_id: str = DEFAULT_HOTEL_ID,
) -> list[Lead]:
    from sqlalchemy import or_
    query = db.query(Lead).filter(Lead.hotel_id == hotel_id)
    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(Lead.name.ilike(search), Lead.email.ilike(search),
                Lead.company.ilike(search), Lead.notes.ilike(search))
        )
    if status:
        query = query.filter(Lead.status == status)
    if source:
        query = query.filter(Lead.source == source)
    if priority:
        query = query.filter(Lead.priority == priority)
    return query.order_by(Lead.created_at.desc()).limit(limit).all()


# ─── PIPELINE AGGREGATOR ─────────────────────────────────────────────────────

def compute_pipeline(
    db: Session,
    hotel_id: str = DEFAULT_HOTEL_ID,
) -> dict:
    leads = db.query(Lead).filter(Lead.hotel_id == hotel_id).all()
    quotes = db.query(Quote).filter(Quote.hotel_id == hotel_id).all()
    total_leads = len(leads)
    by_status = {}
    for lead in leads:
        by_status[lead.status] = by_status.get(lead.status, 0) + 1
    total_quote_value = sum(q.total for q in quotes)
    approved_value = sum(q.total for q in quotes if q.status == "approved")
    pending_value = sum(q.total for q in quotes
                        if q.status in ("draft", "review", "sent"))
    converted = by_status.get("converted", 0)
    conversion_rate = round(converted / total_leads, 3) if total_leads > 0 else 0.0
    return {
        "total_leads": total_leads,
        "by_status": by_status,
        "total_quote_value": round(total_quote_value, 2),
        "approved_value": round(approved_value, 2),
        "pending_value": round(pending_value, 2),
        "conversion_rate": conversion_rate,
        "active_quotes": len([q for q in quotes if q.status != "rejected"]),
    }


# ─── DASHBOARD ───────────────────────────────────────────────────────────────

def compute_dashboard(
    db: Session,
    hotel_id: str = DEFAULT_HOTEL_ID,
) -> dict:
    leads  = db.query(Lead).filter(Lead.hotel_id == hotel_id).all()
    quotes = db.query(Quote).filter(Quote.hotel_id == hotel_id).all()
    agents = db.query(Agent).filter(Agent.hotel_id == hotel_id).all()
    now = datetime.utcnow()
    this_month = [l for l in leads if l.created_at.month == now.month]
    return {
        "period": now.strftime("%B %Y"),
        "leads": {
            "total": len(leads),
            "this_month": len(this_month),
            "by_status": {s: len([l for l in leads if l.status == s])
                          for s in ["new","qualified","assigned","converted","lost"]},
            "by_source": {s: len([l for l in leads if l.source == s])
                          for s in ["web","referral","direct"]},
            "by_priority": {p: len([l for l in leads if l.priority == p])
                            for p in ["high","medium","low"]},
        },
        "quotes": {
            "total": len(quotes),
            "total_value": round(sum(q.total for q in quotes), 2),
            "approved_value": round(sum(q.total for q in quotes
                                        if q.status == "approved"), 2),
            "by_status": {s: len([q for q in quotes if q.status == s])
                          for s in ["draft","review","sent","approved","rejected"]},
        },
        "agents": {
            "total": len(agents),
            "active": len([a for a in agents if a.is_active]),
            "capacity": {
                a.name: {"current": a.current_leads, "max": a.max_leads,
                          "available": a.max_leads - a.current_leads}
                for a in agents
            },
        },
        "conversion_rate": round(
            len([l for l in leads if l.status == "converted"]) / len(leads), 3
        ) if leads else 0.0,
        "revenue_pipeline": round(
            sum(q.total for q in quotes if q.status != "rejected"), 2
        ),
    }
