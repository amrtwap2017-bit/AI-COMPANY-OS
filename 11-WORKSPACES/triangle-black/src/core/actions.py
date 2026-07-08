"""
Triangle Black — Business Action Endpoints
The core revenue loop as HTTP endpoints.
"""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.core.business import (
    qualify_lead, find_best_agent, generate_quote_from_lead,
    compute_pipeline, compute_dashboard,
)
from src.commercial.lead_management.models import Lead
from src.commercial.agent_management.models import Agent
from src.commercial.quotation.models import Quote
from src.commercial.activity_tracking.models import Activity

router = APIRouter(prefix="/actions", tags=["business-actions"])


def _log_activity(db: Session, lead_id: str, type: str, description: str, actor: str = "system"):
    """Auto-log every business action as an activity."""
    db.add(Activity(
        id=str(uuid.uuid4()),
        lead_id=lead_id,
        type=type,
        description=description,
        actor=actor,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    ))


# ─── QUALIFY ─────────────────────────────────────────────────────────────────

@router.post("/leads/{lead_id}/qualify")
def qualify(lead_id: str, db: Session = Depends(get_db)):
    """Score a lead 0-100 and update its status."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    result = qualify_lead(lead)
    lead.score = result["score"]
    lead.status = result["status"]
    lead.updated_at = datetime.utcnow()

    _log_activity(
        db, lead_id, "qualification",
        f"Lead qualified. Score: {result['score']}/100. Grade: {result['grade']}. "
        f"Reasoning: {'; '.join(result['reasoning'])}",
    )
    db.commit()

    return {
        "ok": True,
        "lead_id": lead_id,
        "score": result["score"],
        "grade": result["grade"],
        "status": result["status"],
        "reasoning": result["reasoning"],
    }


# ─── ASSIGN ──────────────────────────────────────────────────────────────────

class AssignIn(BaseModel):
    agent_id: Optional[str] = None  # if None → auto-assign


@router.post("/leads/{lead_id}/assign")
def assign(lead_id: str, payload: AssignIn, db: Session = Depends(get_db)):
    """Assign a lead to an agent. Auto-assigns to best available if no agent_id."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if payload.agent_id:
        agent = db.query(Agent).filter(Agent.id == payload.agent_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        if not agent.is_active:
            raise HTTPException(status_code=400, detail="Agent is not active")
        if agent.current_leads >= agent.max_leads:
            raise HTTPException(status_code=400, detail="Agent is at full capacity")
    else:
        agent = find_best_agent(db)
        if not agent:
            raise HTTPException(status_code=400, detail="No available agents")

    # Unassign from previous agent if any
    if lead.status == "assigned":
        prev_agents = db.query(Agent).filter(
            Agent.current_leads > 0
        ).all()
        # decrement is handled by tracking assigned_agent_id
        # For now just update lead

    lead.status = "assigned"
    lead.updated_at = datetime.utcnow()
    agent.current_leads += 1
    agent.updated_at = datetime.utcnow()

    _log_activity(
        db, lead_id, "assignment",
        f"Lead assigned to agent: {agent.name} ({agent.email}). "
        f"Agent capacity: {agent.current_leads}/{agent.max_leads}",
    )
    db.commit()

    return {
        "ok": True,
        "lead_id": lead_id,
        "agent_id": agent.id,
        "agent_name": agent.name,
        "agent_email": agent.email,
        "agent_capacity": f"{agent.current_leads}/{agent.max_leads}",
    }


# ─── GENERATE QUOTE ───────────────────────────────────────────────────────────

class QuoteFromLeadIn(BaseModel):
    contract_months: int = 12


@router.post("/leads/{lead_id}/quote")
def quote_from_lead(lead_id: str, payload: QuoteFromLeadIn, db: Session = Depends(get_db)):
    """Auto-generate a draft quote from lead data."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    quote_data = generate_quote_from_lead(lead, payload.contract_months)
    quote = Quote(
        id=str(uuid.uuid4()),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        **quote_data,
    )
    db.add(quote)

    _log_activity(
        db, lead_id, "quote_generated",
        f"Quote auto-generated: '{quote_data['title']}'. "
        f"Total: EGP {quote_data['total']:,.2f}. "
        f"Duration: {payload.contract_months} months.",
    )
    db.commit()
    db.refresh(quote)

    return {
        "ok": True,
        "quote_id": quote.id,
        "title": quote.title,
        "total": quote.total,
        "status": quote.status,
        "items": quote.items,
        "validity_date": quote.validity_date.isoformat() if quote.validity_date else None,
    }


# ─── QUOTE WORKFLOW ───────────────────────────────────────────────────────────

class QuoteActionIn(BaseModel):
    actor: str = "system"
    note: Optional[str] = None


@router.post("/quotes/{quote_id}/submit")
def submit_quote(quote_id: str, payload: QuoteActionIn, db: Session = Depends(get_db)):
    """Submit a draft quote for review (draft → review)."""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.status != "draft":
        raise HTTPException(status_code=400, detail=f"Quote is '{quote.status}', must be 'draft'")

    quote.status = "review"
    quote.updated_at = datetime.utcnow()

    if quote.lead_id:
        _log_activity(
            db, quote.lead_id, "quote_submitted",
            f"Quote '{quote.title}' submitted for review by {payload.actor}. "
            f"Value: EGP {quote.total:,.2f}",
            actor=payload.actor,
        )
    db.commit()

    return {"ok": True, "quote_id": quote_id, "status": "review",
            "message": "Quote submitted for review"}


@router.post("/quotes/{quote_id}/send")
def send_quote(quote_id: str, payload: QuoteActionIn, db: Session = Depends(get_db)):
    """Send a reviewed quote to client (review → sent)."""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.status != "review":
        raise HTTPException(status_code=400, detail=f"Quote is '{quote.status}', must be 'review'")

    quote.status = "sent"
    quote.updated_at = datetime.utcnow()

    if quote.lead_id:
        _log_activity(
            db, quote.lead_id, "quote_sent",
            f"Quote '{quote.title}' sent to client by {payload.actor}. "
            f"Value: EGP {quote.total:,.2f}",
            actor=payload.actor,
        )
    db.commit()

    return {"ok": True, "quote_id": quote_id, "status": "sent",
            "message": "Quote sent to client"}


@router.post("/quotes/{quote_id}/approve")
def approve_quote(quote_id: str, payload: QuoteActionIn, db: Session = Depends(get_db)):
    """Approve a sent quote (sent → approved). Converts the lead."""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.status != "sent":
        raise HTTPException(status_code=400, detail=f"Quote is '{quote.status}', must be 'sent'")

    quote.status = "approved"
    quote.updated_at = datetime.utcnow()

    # Auto-convert the lead
    if quote.lead_id:
        lead = db.query(Lead).filter(Lead.id == quote.lead_id).first()
        if lead:
            lead.status = "converted"
            lead.updated_at = datetime.utcnow()
        _log_activity(
            db, quote.lead_id, "quote_approved",
            f"Quote '{quote.title}' APPROVED by {payload.actor}. "
            f"Contract value: EGP {quote.total:,.2f}. Lead converted.",
            actor=payload.actor,
        )
    db.commit()

    return {"ok": True, "quote_id": quote_id, "status": "approved",
            "message": "Quote approved — lead converted to client"}


@router.post("/quotes/{quote_id}/reject")
def reject_quote(quote_id: str, payload: QuoteActionIn, db: Session = Depends(get_db)):
    """Reject a sent quote (sent → rejected). Marks lead as lost."""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.status not in ("sent", "review"):
        raise HTTPException(status_code=400, detail=f"Cannot reject quote in status '{quote.status}'")

    quote.status = "rejected"
    quote.updated_at = datetime.utcnow()

    if quote.lead_id:
        lead = db.query(Lead).filter(Lead.id == quote.lead_id).first()
        if lead:
            lead.status = "lost"
            lead.updated_at = datetime.utcnow()
        _log_activity(
            db, quote.lead_id, "quote_rejected",
            f"Quote '{quote.title}' rejected by {payload.actor}. "
            f"Note: {payload.note or 'No reason provided'}. Lead marked as lost.",
            actor=payload.actor,
        )
    db.commit()

    return {"ok": True, "quote_id": quote_id, "status": "rejected",
            "message": "Quote rejected — lead marked as lost"}


# ─── PIPELINE SUMMARY ─────────────────────────────────────────────────────────

@router.get("/pipeline/summary")
def pipeline_summary(db: Session = Depends(get_db)):
    """Real computed pipeline metrics."""
    return compute_pipeline(db)


# ─── EXECUTIVE DASHBOARD ──────────────────────────────────────────────────────

@router.get("/reports/dashboard")
def dashboard(db: Session = Depends(get_db)):
    """Full executive dashboard with real aggregated data."""
    return compute_dashboard(db)


# ─── LEAD ACTIVITY TIMELINE ───────────────────────────────────────────────────

@router.get("/leads/{lead_id}/timeline")
def lead_timeline(lead_id: str, db: Session = Depends(get_db)):
    """Full activity timeline for a lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    activities = (
        db.query(Activity)
        .filter(Activity.lead_id == lead_id)
        .order_by(Activity.created_at.desc())
        .all()
    )

    return {
        "lead_id": lead_id,
        "lead_name": lead.name,
        "lead_status": lead.status,
        "lead_score": lead.score,
        "timeline": [
            {
                "id": a.id,
                "type": a.type,
                "description": a.description,
                "actor": a.actor,
                "created_at": a.created_at.isoformat(),
            }
            for a in activities
        ],
    }
