"""
Triangle Black — Business Logic Engine
Core revenue loop: capture → qualify → assign → quote → approve
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


# ─── QUALIFICATION ENGINE ────────────────────────────────────────────────────

QUALIFICATION_RULES = {
    # Source scoring
    "source": {"referral": 30, "direct": 20, "web": 10},
    # Priority scoring
    "priority": {"high": 30, "medium": 20, "low": 10},
    # Company name present
    "has_company": 20,
    # Phone present
    "has_phone": 10,
    # Notes present
    "has_notes": 10,
}


def qualify_lead(lead: Lead) -> dict:
    """
    Score a lead 0-100 based on business rules.
    Returns score, grade, reasoning.
    """
    score = 0
    reasoning = []

    # Source
    source_score = QUALIFICATION_RULES["source"].get(lead.source, 5)
    score += source_score
    reasoning.append(f"Source '{lead.source}': +{source_score}")

    # Priority
    priority_score = QUALIFICATION_RULES["priority"].get(lead.priority, 10)
    score += priority_score
    reasoning.append(f"Priority '{lead.priority}': +{priority_score}")

    # Company
    if lead.company:
        score += QUALIFICATION_RULES["has_company"]
        reasoning.append(f"Company provided: +{QUALIFICATION_RULES['has_company']}")

    # Phone
    if lead.phone:
        score += QUALIFICATION_RULES["has_phone"]
        reasoning.append(f"Phone provided: +{QUALIFICATION_RULES['has_phone']}")

    # Notes
    if lead.notes:
        score += QUALIFICATION_RULES["has_notes"]
        reasoning.append(f"Notes provided: +{QUALIFICATION_RULES['has_notes']}")

    score = min(score, 100)

    if score >= 70:
        grade = "qualified"
        status = "qualified"
    elif score >= 40:
        grade = "warm"
        status = "qualified"
    else:
        grade = "cold"
        status = "new"

    return {
        "score": score,
        "grade": grade,
        "status": status,
        "reasoning": reasoning,
    }


# ─── AGENT ASSIGNMENT ENGINE ──────────────────────────────────────────────────

def find_best_agent(db: Session) -> Optional[Agent]:
    """
    Round-robin assignment: pick active agent with most capacity.
    capacity = max_leads - current_leads
    """
    agents = (
        db.query(Agent)
        .filter(Agent.is_active == True)
        .order_by(
            (Agent.max_leads - Agent.current_leads).desc()
        )
        .all()
    )
    for agent in agents:
        if agent.current_leads < agent.max_leads:
            return agent
    return None


# ─── QUOTE GENERATOR ─────────────────────────────────────────────────────────

SERVICE_PRICING = {
    "hvac": {"name": "HVAC Maintenance", "unit_price": 3500.0, "unit": "month"},
    "electrical": {"name": "Electrical Systems", "unit_price": 2800.0, "unit": "month"},
    "plumbing": {"name": "Plumbing Systems", "unit_price": 2200.0, "unit": "month"},
    "fire": {"name": "Fire Fighting Systems", "unit_price": 1800.0, "unit": "month"},
    "general": {"name": "General Engineering", "unit_price": 4500.0, "unit": "month"},
    "procurement": {"name": "Procurement Services", "unit_price": 1500.0, "unit": "month"},
}

PRIORITY_MULTIPLIER = {"high": 1.2, "medium": 1.0, "low": 0.9}


def generate_quote_from_lead(lead: Lead, contract_months: int = 12) -> dict:
    """
    Auto-generate a draft quote from lead data.
    Detects service type from notes/company name.
    """
    notes_lower = (lead.notes or "").lower()
    company_lower = (lead.company or "").lower()
    combined = notes_lower + " " + company_lower

    # Detect services from text
    detected_services = []
    for key, service in SERVICE_PRICING.items():
        if key in combined:
            detected_services.append(key)

    # Default to general if nothing detected
    if not detected_services:
        detected_services = ["general"]

    multiplier = PRIORITY_MULTIPLIER.get(lead.priority, 1.0)
    items = []
    total = 0.0

    for key in detected_services:
        service = SERVICE_PRICING[key]
        unit_price = round(service["unit_price"] * multiplier, 2)
        line_total = round(unit_price * contract_months, 2)
        items.append({
            "service": service["name"],
            "unit": service["unit"],
            "qty": contract_months,
            "unit_price": unit_price,
            "total": line_total,
        })
        total += line_total

    validity_date = datetime.utcnow() + timedelta(days=30)

    return {
        "title": f"Engineering Services Contract — {lead.company or lead.name}",
        "description": (
            f"Annual engineering maintenance contract for {lead.company or lead.name}. "
            f"Contract duration: {contract_months} months. "
            f"Priority: {lead.priority}. Source: {lead.source}."
        ),
        "lead_id": lead.id,
        "items": items,
        "total": round(total, 2),
        "status": "draft",
        "validity_date": validity_date,
    }


# ─── PIPELINE AGGREGATOR ──────────────────────────────────────────────────────

def compute_pipeline(db: Session) -> dict:
    """Compute real pipeline metrics from DB."""
    leads = db.query(Lead).all()
    quotes = db.query(Quote).all()

    total_leads = len(leads)
    by_status = {}
    for lead in leads:
        by_status[lead.status] = by_status.get(lead.status, 0) + 1

    total_quote_value = sum(q.total for q in quotes)
    approved_value = sum(q.total for q in quotes if q.status == "approved")
    pending_value = sum(q.total for q in quotes if q.status in ("draft", "review", "sent"))

    converted = by_status.get("converted", 0)
    conversion_rate = round(converted / total_leads, 3) if total_leads > 0 else 0.0

    return {
        "total_leads": total_leads,
        "by_status": by_status,
        "total_quote_value": round(total_quote_value, 2),
        "approved_value": round(approved_value, 2),
        "pending_value": round(pending_value, 2),
        "conversion_rate": conversion_rate,
        "active_quotes": len([q for q in quotes if q.status not in ("rejected",)]),
    }


# ─── REPORT AGGREGATOR ────────────────────────────────────────────────────────

def compute_dashboard(db: Session) -> dict:
    """Full executive dashboard metrics."""
    leads = db.query(Lead).all()
    quotes = db.query(Quote).all()
    agents = db.query(Agent).all()

    now = datetime.utcnow()
    this_month = [l for l in leads if l.created_at.month == now.month]

    return {
        "period": now.strftime("%B %Y"),
        "leads": {
            "total": len(leads),
            "this_month": len(this_month),
            "by_status": {
                s: len([l for l in leads if l.status == s])
                for s in ["new", "qualified", "assigned", "converted", "lost"]
            },
            "by_source": {
                s: len([l for l in leads if l.source == s])
                for s in ["web", "referral", "direct"]
            },
            "by_priority": {
                p: len([l for l in leads if l.priority == p])
                for p in ["high", "medium", "low"]
            },
        },
        "quotes": {
            "total": len(quotes),
            "total_value": round(sum(q.total for q in quotes), 2),
            "approved_value": round(sum(q.total for q in quotes if q.status == "approved"), 2),
            "by_status": {
                s: len([q for q in quotes if q.status == s])
                for s in ["draft", "review", "sent", "approved", "rejected"]
            },
        },
        "agents": {
            "total": len(agents),
            "active": len([a for a in agents if a.is_active]),
            "capacity": {
                a.name: {
                    "current": a.current_leads,
                    "max": a.max_leads,
                    "available": a.max_leads - a.current_leads,
                }
                for a in agents
            },
        },
        "conversion_rate": round(
            len([l for l in leads if l.status == "converted"]) / len(leads), 3
        ) if leads else 0.0,
        "revenue_pipeline": round(
            sum(q.total for q in quotes if q.status not in ("rejected",)), 2
        ),
    }
