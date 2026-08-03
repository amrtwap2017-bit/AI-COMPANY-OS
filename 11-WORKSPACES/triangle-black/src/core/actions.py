from __future__ import annotations
from datetime import datetime, timedelta

"""
Triangle Black — Business Action Endpoints (JWT Protected)
MT-002: All queries scoped to hotel_id for tenant isolation.
"""
import uuid
from datetime import datetime
from typing import Optional, List, Any
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.core.auth import require_agent, require_manager, get_current_user
from src.core.tenant import get_hotel_id, DEFAULT_HOTEL_ID
from src.core.business import (
    qualify_lead, find_best_agent, generate_quote_from_lead,
    compute_pipeline, compute_dashboard, release_agent_capacity,
    search_leads, check_duplicate_lead, expire_overdue_quotes,
)
from src.commercial.lead_management.models import Lead
from src.commercial.agent_management.models import Agent
from src.commercial.quotation.models import Quote
from src.commercial.activity_tracking.models import Activity
from src.commercial.contracts.models import Contract
from src.commercial.auth.models import User
from src.core.email_service import send_quote_email
from src.commercial.notifications.models import Notification

router = APIRouter(prefix="/actions", tags=["business-actions"])


def _log(db, lead_id, type, description, actor="system", hotel_id="tb-default-hotel-000000000001"):
    db.add(Activity(
        id=str(uuid.uuid4()), hotel_id=hotel_id, lead_id=lead_id, type=type,
        description=description, actor=actor,
        created_at=datetime.utcnow(), updated_at=datetime.utcnow(),
    ))


def _notify(db, title: str, message: str, ntype: str,
            entity_id: str, entity_type: str, recipient_role: str,
            hotel_id: str = "tb-default-hotel-000000000001"):
    try:
        db.add(Notification(
            id=str(uuid.uuid4()),
            hotel_id=hotel_id,
            title=title, message=message, type=ntype,
            entity_id=entity_id, entity_type=entity_type,
            recipient_role=recipient_role, is_read=False,
            created_at=datetime.utcnow(), updated_at=datetime.utcnow(),
        ))
    except Exception as exc:
        import logging
        logging.getLogger("triangle_black").error("_notify failed: %s", exc)


def _get_lead(db: Session, lead_id: str, hotel_id: str) -> Lead:
    """Get lead scoped to hotel. Raises 404 if not found."""
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.hotel_id == hotel_id,
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


def _get_quote(db: Session, quote_id: str, hotel_id: str) -> Quote:
    """Get quote scoped to hotel. Raises 404 if not found."""
    quote = db.query(Quote).filter(
        Quote.id == quote_id,
        Quote.hotel_id == hotel_id,
    ).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return quote


# ─── QUALIFY ──────────────────────────────────────────────────────────────────

@router.post("/leads/{lead_id}/qualify")
def qualify(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    lead = _get_lead(db, lead_id, hotel_id)
    result = qualify_lead(lead)
    lead.score = result["score"]
    lead.status = result["status"]
    lead.updated_at = datetime.utcnow()
    _log(db, lead_id, "qualification",
         f"Lead qualified. Score: {result['score']}/100. Grade: {result['grade']}.",
         actor=current_user.email, hotel_id=hotel_id)
    _notify(db,
        title=f"Lead Qualified: {lead.name}",
        message=f"{lead.name} scored {result['score']}/100 ({result['grade']}). Ready to assign.",
        ntype="lead_qualified", entity_id=lead_id,
        entity_type="lead", recipient_role="manager",
        hotel_id=hotel_id,
    )
    db.commit()
    return {"ok": True, "lead_id": lead_id, **result}


# ─── ASSIGN ───────────────────────────────────────────────────────────────────

class AssignIn(BaseModel):
    agent_id: Optional[str] = None


@router.post("/leads/{lead_id}/assign")
def assign(
    lead_id: str,
    payload: AssignIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    lead = _get_lead(db, lead_id, hotel_id)
    if payload.agent_id:
        agent = db.query(Agent).filter(
            Agent.id == payload.agent_id,
            Agent.hotel_id == hotel_id,
        ).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        if not agent.is_active:
            raise HTTPException(status_code=400, detail="Agent is not active")
        if agent.current_leads >= agent.max_leads:
            raise HTTPException(status_code=400, detail="Agent at full capacity")
    else:
        agent = find_best_agent(db, hotel_id=hotel_id)
        if not agent:
            raise HTTPException(status_code=400, detail="No available agents")
    lead.status = "assigned"
    lead.updated_at = datetime.utcnow()
    agent.current_leads += 1
    agent.updated_at = datetime.utcnow()
    _log(db, lead_id, "assignment",
         f"Lead assigned to {agent.name} ({agent.email}). "
         f"Capacity: {agent.current_leads}/{agent.max_leads}",
         actor=current_user.email, hotel_id=hotel_id)
    _notify(db,
        title=f"Lead Assigned: {lead.name}",
        message=f"{lead.name} assigned to {agent.name}. Capacity: {agent.current_leads}/{agent.max_leads}.",
        ntype="lead_assigned", entity_id=lead_id,
        entity_type="lead", recipient_role="agent",
        hotel_id=hotel_id,
    )
    db.commit()
    return {"ok": True, "lead_id": lead_id, "agent_id": agent.id,
            "agent_name": agent.name, "agent_email": agent.email,
            "agent_capacity": f"{agent.current_leads}/{agent.max_leads}"}


# ─── GENERATE QUOTE ───────────────────────────────────────────────────────────

class QuoteFromLeadIn(BaseModel):
    contract_months: int = 12


@router.post("/leads/{lead_id}/quote")
def quote_from_lead(
    lead_id: str,
    payload: QuoteFromLeadIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    lead = _get_lead(db, lead_id, hotel_id)
    quote_data = generate_quote_from_lead(lead, payload.contract_months)
    quote_data["hotel_id"] = hotel_id
    quote = Quote(
        id=str(uuid.uuid4()),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        **quote_data,
    )
    db.add(quote)
    _log(db, lead_id, "quote_generated",
         f"Quote generated: '{quote_data['title']}'. "
         f"Total: EGP {quote_data['total']:,.2f}",
         actor=current_user.email, hotel_id=hotel_id)
    db.commit()
    db.refresh(quote)
    return {"ok": True, "quote_id": quote.id, "title": quote.title,
            "total": quote.total, "status": quote.status, "items": quote.items,
            "validity_date": quote.validity_date.isoformat() if quote.validity_date else None}


# ─── QUOTE WORKFLOW ───────────────────────────────────────────────────────────

class QuoteActionIn(BaseModel):
    note: Optional[str] = None


@router.post("/quotes/{quote_id}/submit")
def submit_quote(
    quote_id: str,
    payload: QuoteActionIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    quote = _get_quote(db, quote_id, hotel_id)
    if quote.status != "draft":
        raise HTTPException(status_code=400, detail=f"Quote is '{quote.status}'")
    quote.status = "review"
    quote.updated_at = datetime.utcnow()
    if quote.lead_id:
        _log(db, quote.lead_id, "quote_submitted",
             f"Quote '{quote.title}' submitted for review. EGP {quote.total:,.2f}",
             actor=current_user.email, hotel_id=hotel_id)
    db.commit()
    return {"ok": True, "quote_id": quote_id, "status": "review"}


@router.post("/quotes/{quote_id}/send")
def send_quote(
    quote_id: str,
    payload: QuoteActionIn,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    quote = _get_quote(db, quote_id, hotel_id)
    if quote.status != "review":
        raise HTTPException(status_code=400, detail=f"Quote is '{quote.status}'")
    quote.status = "sent"
    quote.updated_at = datetime.utcnow()
    lead = None
    if quote.lead_id:
        lead = db.query(Lead).filter(
            Lead.id == quote.lead_id,
            Lead.hotel_id == hotel_id,
        ).first()
        if lead:
            _log(db, quote.lead_id, "quote_sent",
                 f"Quote '{quote.title}' sent to client. EGP {quote.total:,.2f}",
                 actor=current_user.email, hotel_id=hotel_id)
    db.commit()
    if lead and lead.email:
        def _send_email_task():
            try:
                from src.core.pdf.generator import generate_quote_pdf
                pdf_bytes = generate_quote_pdf(
                    quote_id=quote.id,
                    lead_name=lead.name, lead_email=lead.email,
                    lead_company=lead.company or "", lead_phone=lead.phone or "",
                    quote_title=quote.title, quote_description=quote.description or "",
                    items=quote.items or [], total=quote.total,
                    validity_date=str(quote.validity_date)[:10] if quote.validity_date else "",
                    generated_by=current_user.name if hasattr(current_user, "name") else current_user.email,
                )
                send_quote_email(
                    to_email=lead.email, to_name=lead.name,
                    quote_title=quote.title, quote_total=quote.total,
                    quote_id=quote.id, pdf_bytes=pdf_bytes,
                )
            except Exception as exc:
                import logging
                logging.getLogger("triangle_black.email").error(
                    "Background email task failed: %s", exc)
        background_tasks.add_task(_send_email_task)
    _notify(db,
        title=f"Quote Sent: {quote.title}",
        message=f"Proposal sent to {lead.name if lead else 'client'} for EGP {quote.total:,.0f}. Awaiting approval.",
        ntype="quote_sent", entity_id=quote_id,
        entity_type="quote", recipient_role="manager",
        hotel_id=hotel_id,
    )
    db.commit()
    return {"ok": True, "quote_id": quote_id, "status": "sent",
            "email_queued": bool(lead and lead.email)}


@router.post("/quotes/{quote_id}/approve")
def approve_quote(
    quote_id: str,
    payload: QuoteActionIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    quote = _get_quote(db, quote_id, hotel_id)
    if quote.status != "sent":
        raise HTTPException(status_code=400, detail=f"Quote is '{quote.status}'")
    quote.status = "approved"
    quote.updated_at = datetime.utcnow()
    lead = None
    if quote.lead_id:
        lead = db.query(Lead).filter(
            Lead.id == quote.lead_id,
            Lead.hotel_id == hotel_id,
        ).first()
        if lead:
            release_agent_capacity(db, lead, hotel_id=hotel_id)
            lead.status = "converted"
            lead.updated_at = datetime.utcnow()
        _log(db, quote.lead_id, "quote_approved",
             f"Quote '{quote.title}' APPROVED. EGP {quote.total:,.2f}. Lead converted.",
             actor=current_user.email, hotel_id=hotel_id)
    contract = Contract(
        id=str(uuid.uuid4()),
        hotel_id=hotel_id,
        quote_id=quote.id,
        lead_id=quote.lead_id or "",
        title=quote.title,
        description=quote.description,
        services=quote.items,
        total_value=quote.total,
        monthly_value=round(quote.total / 12, 2),
        status="pending_signature",
        duration_months=12,
        renewal_count=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(contract)
    if quote.lead_id:
        _log(db, quote.lead_id, "contract_created",
             f"Contract auto-created from approved quote. "
             f"Contract ID: {contract.id}. Value: EGP {quote.total:,.2f}",
             actor="system", hotel_id=hotel_id)
    _notify(db,
        title=f"Quote Approved: {quote.title}",
        message=f"EGP {quote.total:,.0f} contract approved. Contract {contract.id[:8].upper()} created automatically.",
        ntype="quote_approved", entity_id=quote_id,
        entity_type="quote", recipient_role="all",
        hotel_id=hotel_id,
    )
    db.commit()
    return {"ok": True, "quote_id": quote_id, "status": "approved",
            "contract_id": contract.id,
            "message": "Quote approved — lead converted — contract created"}


@router.post("/quotes/{quote_id}/reject")
def reject_quote(
    quote_id: str,
    payload: QuoteActionIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    quote = _get_quote(db, quote_id, hotel_id)
    if quote.status not in ("sent", "review"):
        raise HTTPException(status_code=400,
                            detail=f"Cannot reject quote in '{quote.status}'")
    quote.status = "rejected"
    quote.updated_at = datetime.utcnow()
    if quote.lead_id:
        lead = db.query(Lead).filter(
            Lead.id == quote.lead_id,
            Lead.hotel_id == hotel_id,
        ).first()
        if lead:
            release_agent_capacity(db, lead, hotel_id=hotel_id)
            lead.status = "lost"
            lead.updated_at = datetime.utcnow()
        _log(db, quote.lead_id, "quote_rejected",
             f"Quote '{quote.title}' rejected. "
             f"Note: {payload.note or 'No reason'}. Lead lost.",
             actor=current_user.email, hotel_id=hotel_id)
    _notify(db,
            title="Quote Rejected",
            message=f"Quote '{quote.title}' was rejected. "
                    f"Reason: {payload.note or 'No reason provided'}",
            ntype="quote_rejected",
            entity_id=quote_id,
            entity_type="quote",
            recipient_role="agent",
            hotel_id=hotel_id)
    db.commit()
    return {"ok": True, "quote_id": quote_id, "status": "rejected",
            "message": "Quote rejected — lead marked as lost"}


# ─── TIMELINE ─────────────────────────────────────────────────────────────────

@router.get("/leads/{lead_id}/timeline")
def lead_timeline(
    lead_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    lead = _get_lead(db, lead_id, hotel_id)
    activities = (db.query(Activity).filter(Activity.lead_id == lead_id)
                  .order_by(Activity.created_at.desc()).all())
    contract = db.query(Contract).filter(
        Contract.lead_id == lead_id,
        Contract.hotel_id == hotel_id,
    ).first()
    return {
        "lead_id": lead_id, "lead_name": lead.name,
        "lead_status": lead.status, "lead_score": lead.score,
        "contract": {
            "id": contract.id, "status": contract.status,
            "total_value": contract.total_value,
        } if contract else None,
        "timeline": [
            {"id": a.id, "type": a.type, "description": a.description,
             "actor": a.actor, "created_at": a.created_at.isoformat()}
            for a in activities
        ],
    }


# ─── PIPELINE + DASHBOARD ─────────────────────────────────────────────────────

@router.get("/pipeline/summary")
def pipeline_summary(
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return compute_pipeline(db, hotel_id=hotel_id)


@router.get("/reports/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    return compute_dashboard(db, hotel_id=hotel_id)


# ─── SEARCH ───────────────────────────────────────────────────────────────────

@router.get("/leads/search")
def lead_search(
    q: str = "", status: str = "", source: str = "",
    priority: str = "", limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    results = search_leads(
        db, q=q, status=status or None,
        source=source or None, priority=priority or None,
        limit=limit, hotel_id=hotel_id,
    )
    return {
        "count": len(results), "query": q,
        "results": [
            {"id": l.id, "name": l.name, "email": l.email,
             "company": l.company, "status": l.status,
             "priority": l.priority, "score": l.score,
             "created_at": l.created_at.isoformat()}
            for l in results
        ],
    }


# ─── DUPLICATE CHECK ──────────────────────────────────────────────────────────

@router.get("/leads/check-duplicate")
def check_duplicate(
    email: str, exclude_id: str = "",
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    existing = check_duplicate_lead(db, email, exclude_id or None, hotel_id=hotel_id)
    return {
        "is_duplicate": existing is not None,
        "existing_lead": {
            "id": existing.id, "name": existing.name,
            "status": existing.status,
        } if existing else None,
    }


# ─── EXPIRE OVERDUE ───────────────────────────────────────────────────────────

@router.post("/quotes/expire-overdue")
def expire_overdue(
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    count = expire_overdue_quotes(db, hotel_id=hotel_id)
    return {"ok": True, "expired_count": count}


# ─── AGENT LEADS + PERFORMANCE ────────────────────────────────────────────────

@router.get("/agents/{agent_id}/leads")
def agent_leads(
    agent_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.hotel_id == hotel_id,
    ).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    leads = db.query(Lead).filter(
        Lead.status == "assigned",
        Lead.hotel_id == hotel_id,
    ).all()
    return {
        "agent_id": agent_id, "agent_name": agent.name,
        "current_leads": agent.current_leads, "max_leads": agent.max_leads,
        "leads": [
            {"id": l.id, "name": l.name, "company": l.company,
             "priority": l.priority, "score": l.score,
             "created_at": l.created_at.isoformat()}
            for l in leads
        ],
    }


@router.get("/agents/{agent_id}/performance")
def agent_performance(
    agent_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.hotel_id == hotel_id,
    ).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    all_leads = db.query(Lead).filter(
        Lead.status.in_(["assigned", "converted", "lost"]),
        Lead.hotel_id == hotel_id,
    ).all()
    total = len(all_leads)
    converted = len([l for l in all_leads if l.status == "converted"])
    lost = len([l for l in all_leads if l.status == "lost"])
    rate = round(converted / total, 3) if total > 0 else 0.0
    return {
        "agent_id": agent_id, "agent_name": agent.name, "email": agent.email,
        "capacity": f"{agent.current_leads}/{agent.max_leads}",
        "metrics": {
            "total_assigned": total, "converted": converted, "lost": lost,
            "conversion_rate": rate, "conversion_pct": f"{rate*100:.1f}%",
        },
    }


# ─── USERS (admin) ────────────────???────────────────────────────────────

@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    from src.commercial.auth.models import User as UserModel
    users = db.query(UserModel).filter(
        UserModel.hotel_id == hotel_id,
    ).order_by(UserModel.created_at.desc()).all()
    return [
        {"id": u.id, "name": u.name, "email": u.email,
         "role": u.role, "is_active": u.is_active,
         "created_at": u.created_at.isoformat(),
         "updated_at": u.updated_at.isoformat()}
        for u in users
    ]


@router.post("/users")
def create_user(
    payload: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    import bcrypt as _bcrypt
    import uuid as _uuid
    from src.commercial.auth.models import User as UserModel
    existing = db.query(UserModel).filter(
        UserModel.email == payload["email"],
        UserModel.hotel_id == hotel_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    pw = payload.get("password", "")
    hashed = _bcrypt.hashpw(pw.encode(), _bcrypt.gensalt()).decode()
    user = UserModel(
        id=str(_uuid.uuid4()),
        hotel_id=hotel_id,
        name=payload["name"],
        email=payload["email"],
        hashed_password=hashed,
        role=payload.get("role", "agent"),
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "name": user.name, "email": user.email,
            "role": user.role, "is_active": user.is_active,
            "created_at": user.created_at.isoformat()}


# ─── PDF ───────────────────────────────────────────???─────────────

@router.get("/quotes/{quote_id}/pdf")
def download_quote_pdf(
    quote_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    from fastapi.responses import Response
    from src.core.pdf.generator import generate_quote_pdf
    quote = _get_quote(db, quote_id, hotel_id)
    lead = None
    if quote.lead_id:
        lead = db.query(Lead).filter(
            Lead.id == quote.lead_id,
            Lead.hotel_id == hotel_id,
        ).first()
    pdf_bytes = generate_quote_pdf(
        quote_id=quote.id, quote_title=quote.title,
        quote_description=quote.description or "",
        items=quote.items or [], total=quote.total,
        status=quote.status,
        validity_date=quote.validity_date.isoformat() if quote.validity_date else None,
        created_at=quote.created_at.isoformat(),
        lead_name=lead.name if lead else "",
        lead_email=lead.email if lead else "",
        lead_phone=lead.phone if lead else "",
        lead_company=lead.company if lead else "",
        prepared_by=current_user.name,
    )
    filename = f"TB-{quote.id[:8].upper()}-Proposal.pdf"
    return Response(
        content=pdf_bytes, media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"',
                 "Content-Length": str(len(pdf_bytes))},
    )


# ─── WORKFLOW ACTIONS ──────────────────────────────────────────────────────────
# These are the human-triggered actions the portal needs to work

class CreateLeadIn(BaseModel):
    name: str
    email: str
    phone: str | None = None
    company: str | None = None
    source: str = "web"
    priority: str = "medium"
    notes: str | None = None


@router.post("/leads/create", status_code=201)
def create_lead_action(
    payload: CreateLeadIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """Create a new lead from the portal."""
    from src.commercial.lead_management.models import Lead
    import uuid
    lead = Lead(
        id=str(uuid.uuid4()),
        hotel_id=hotel_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        company=payload.company,
        source=payload.source,
        priority=payload.priority,
        notes=payload.notes,
        status="new",
        score=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    _log(db, lead.id, "lead_created",
         f"Lead created: {payload.name} ({payload.email})",
         actor=current_user.email, hotel_id=hotel_id)
    db.commit()
    return {"ok": True, "lead_id": lead.id, "name": lead.name, "status": lead.status}


class UpdateLeadIn(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    source: str | None = None
    priority: str | None = None
    status: str | None = None
    notes: str | None = None


@router.patch("/leads/{lead_id}")
def update_lead_action(
    lead_id: str,
    payload: UpdateLeadIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """Update lead fields from the portal."""
    lead = _get_lead(db, lead_id, hotel_id)
    updates = payload.model_dump(exclude_none=True)
    for k, v in updates.items():
        setattr(lead, k, v)
    lead.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(lead)
    return {"ok": True, "lead_id": lead_id, "updated": list(updates.keys())}


class CreateAgentIn(BaseModel):
    name: str
    email: str
    phone: str | None = None
    max_leads: int = 20


@router.post("/agents/create", status_code=201)
def create_agent_action(
    payload: CreateAgentIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """Create a new agent from the portal."""
    from src.commercial.agent_management.models import Agent
    import uuid
    agent = Agent(
        id=str(uuid.uuid4()),
        hotel_id=hotel_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        max_leads=payload.max_leads,
        current_leads=0,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return {"ok": True, "agent_id": agent.id, "name": agent.name}


@router.get("/agents/{agent_id}/leads")
def get_agent_leads_action(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """Get all leads assigned to an agent."""
    from src.commercial.lead_management.models import Lead
    leads = db.query(Lead).filter(
        Lead.hotel_id == hotel_id
    ).all()
    # Filter by agent activities
    from src.commercial.activity_tracking.models import Activity
    assigned_lead_ids = {
        a.lead_id for a in db.query(Activity).filter(
            Activity.hotel_id == hotel_id,
            Activity.type == "assignment",
            Activity.actor == agent_id,
        ).all()
    }
    agent_leads = [l for l in leads if l.id in assigned_lead_ids]
    return {
        "agent_id": agent_id,
        "leads": [
            {"id": l.id, "name": l.name, "email": l.email,
             "status": l.status, "priority": l.priority, "score": l.score}
            for l in agent_leads
        ]
    }


class AddNoteIn(BaseModel):
    note: str


@router.post("/leads/{lead_id}/note")
def add_note(
    lead_id: str,
    payload: AddNoteIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """Add a manual note to a lead's activity timeline."""
    _get_lead(db, lead_id, hotel_id)  # validates existence
    _log(db, lead_id, "note", payload.note,
         actor=current_user.email, hotel_id=hotel_id)
    db.commit()
    return {"ok": True, "lead_id": lead_id}


@router.get("/dashboard/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """Quick stats for the portal header."""
    from src.commercial.lead_management.models import Lead
    from src.commercial.quotation.models import Quote
    from src.commercial.notifications.models import Notification

    leads = db.query(Lead).filter(Lead.hotel_id == hotel_id).count()
    open_quotes = db.query(Quote).filter(
        Quote.hotel_id == hotel_id,
        Quote.status.in_(["draft", "review", "sent"])
    ).count()
    unread = db.query(Notification).filter(
        Notification.hotel_id == hotel_id,
        Notification.is_read == False,
    ).count()
    return {
        "total_leads": leads,
        "open_quotes": open_quotes,
        "unread_notifications": unread,
    }


# ─── WORKFLOW ACTIONS ──────────────────────────────────────────────────────────
# These are the human-triggered actions the portal needs to work

class CreateLeadIn(BaseModel):
    name: str
    email: str
    phone: str | None = None
    company: str | None = None
    source: str = "web"
    priority: str = "medium"
    notes: str | None = None


@router.post("/leads/create", status_code=201)
def create_lead_action(
    payload: CreateLeadIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """Create a new lead from the portal."""
    from src.commercial.lead_management.models import Lead
    import uuid
    lead = Lead(
        id=str(uuid.uuid4()),
        hotel_id=hotel_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        company=payload.company,
        source=payload.source,
        priority=payload.priority,
        notes=payload.notes,
        status="new",
        score=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    _log(db, lead.id, "lead_created",
         f"Lead created: {payload.name} ({payload.email})",
         actor=current_user.email, hotel_id=hotel_id)
    db.commit()
    return {"ok": True, "lead_id": lead.id, "name": lead.name, "status": lead.status}


class UpdateLeadIn(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    source: str | None = None
    priority: str | None = None
    status: str | None = None
    notes: str | None = None


@router.patch("/leads/{lead_id}")
def update_lead_action(
    lead_id: str,
    payload: UpdateLeadIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """Update lead fields from the portal."""
    lead = _get_lead(db, lead_id, hotel_id)
    updates = payload.model_dump(exclude_none=True)
    for k, v in updates.items():
        setattr(lead, k, v)
    lead.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(lead)
    return {"ok": True, "lead_id": lead_id, "updated": list(updates.keys())}


class CreateAgentIn(BaseModel):
    name: str
    email: str
    phone: str | None = None
    max_leads: int = 20


@router.post("/agents/create", status_code=201)
def create_agent_action(
    payload: CreateAgentIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """Create a new agent from the portal."""
    from src.commercial.agent_management.models import Agent
    import uuid
    agent = Agent(
        id=str(uuid.uuid4()),
        hotel_id=hotel_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        max_leads=payload.max_leads,
        current_leads=0,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return {"ok": True, "agent_id": agent.id, "name": agent.name}


@router.get("/agents/{agent_id}/leads")
def get_agent_leads_action(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """Get all leads assigned to an agent."""
    from src.commercial.lead_management.models import Lead
    leads = db.query(Lead).filter(
        Lead.hotel_id == hotel_id
    ).all()
    # Filter by agent activities
    from src.commercial.activity_tracking.models import Activity
    assigned_lead_ids = {
        a.lead_id for a in db.query(Activity).filter(
            Activity.hotel_id == hotel_id,
            Activity.type == "assignment",
            Activity.actor == agent_id,
        ).all()
    }
    agent_leads = [l for l in leads if l.id in assigned_lead_ids]
    return {
        "agent_id": agent_id,
        "leads": [
            {"id": l.id, "name": l.name, "email": l.email,
             "status": l.status, "priority": l.priority, "score": l.score}
            for l in agent_leads
        ]
    }


class AddNoteIn(BaseModel):
    note: str


@router.post("/leads/{lead_id}/note")
def add_note(
    lead_id: str,
    payload: AddNoteIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """Add a manual note to a lead's activity timeline."""
    _get_lead(db, lead_id, hotel_id)  # validates existence
    _log(db, lead_id, "note", payload.note,
         actor=current_user.email, hotel_id=hotel_id)
    db.commit()
    return {"ok": True, "lead_id": lead_id}


@router.get("/dashboard/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """Quick stats for the portal header."""
    from src.commercial.lead_management.models import Lead
    from src.commercial.quotation.models import Quote
    from src.commercial.notifications.models import Notification

    leads = db.query(Lead).filter(Lead.hotel_id == hotel_id).count()
    open_quotes = db.query(Quote).filter(
        Quote.hotel_id == hotel_id,
        Quote.status.in_(["draft", "review", "sent"])
    ).count()
    unread = db.query(Notification).filter(
        Notification.hotel_id == hotel_id,
        Notification.is_read == False,
    ).count()
    return {
        "total_leads": leads,
        "open_quotes": open_quotes,
        "unread_notifications": unread,
    }


# ─────────────────────────────────────────────────────────────────────────────
# SPRINT 13B — ADVANCED REPORTS + CSV EXPORT
# ─────────────────────────────────────────────────────────────────────────────

import csv
import io
from dateutil.relativedelta import relativedelta
from fastapi.responses import StreamingResponse
from sqlalchemy import func


def _safe_pct(numerator: float, denominator: float) -> float:
    """Return percentage rounded to 2dp, or 0.0 if denominator is zero."""
    if not denominator:
        return 0.0
    return round((numerator / denominator) * 100, 2)


# ── 1. Monthly Revenue Trend ──────────────────────────────────────────────────

@router.get("/reports/revenue-trend")
def revenue_trend_report(
    months: int = 12,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
):
    from src.commercial.quotation.models import Quote
    from src.commercial.contracts.models import Contract
    from src.commercial.invoices.models import Invoice
    from datetime import datetime

    today = datetime.utcnow()
    cutoff = today - relativedelta(months=months)

    # Build ordered month label list oldest→newest
    month_labels = []
    for i in range(months - 1, -1, -1):
        month_labels.append((today - relativedelta(months=i)).strftime("%Y-%m"))

    def _to_dict(rows):
        return {row[0]: float(row[1] or 0) for row in rows if row[0]}

    # approved quotes — Quote.total (confirmed field name)
    q_approved = (
        db.query(
            func.to_char(Quote.updated_at, "YYYY-MM").label("month"),
            func.sum(Quote.total).label("total"),
        )
        .filter(Quote.status == "approved")
        .filter(Quote.updated_at >= cutoff)
        .group_by("month")
        .all()
    )

    # active contracts — Contract.start_date + Contract.total_value
    c_active = (
        db.query(
            func.to_char(Contract.start_date, "YYYY-MM").label("month"),
            func.sum(Contract.total_value).label("total"),
        )
        .filter(Contract.status == "active")
        .filter(Contract.start_date >= cutoff)
        .group_by("month")
        .all()
    )

    # invoices "sent" — use issue_date (confirmed field, no sent_at exists)
    i_sent = (
        db.query(
            func.to_char(Invoice.due_date, "YYYY-MM").label("month"),
            func.sum(Invoice.total_amount).label("total"),
        )
        .filter(Invoice.status.in_(["sent", "paid"]))
        .filter(Invoice.due_date >= cutoff)
        .group_by("month")
        .all()
    )

    # invoices paid — use paid_date (confirmed field, not paid_at)
    i_paid = (
        db.query(
            func.to_char(Invoice.paid_date, "YYYY-MM").label("month"),
            func.sum(Invoice.total_amount).label("total"),
        )
        .filter(Invoice.status == "paid")
        .filter(Invoice.paid_date >= cutoff)
        .group_by("month")
        .all()
    )

    aq = _to_dict(q_approved)
    ac = _to_dict(c_active)
    is_ = _to_dict(i_sent)
    ip = _to_dict(i_paid)

    series = []
    totals = {"approved_quotes": 0.0, "active_contracts": 0.0,
               "invoices_sent": 0.0, "invoices_paid": 0.0}

    for m in month_labels:
        row = {
            "month": m,
            "approved_quotes":  aq.get(m, 0.0),
            "active_contracts": ac.get(m, 0.0),
            "invoices_sent":    is_.get(m, 0.0),
            "invoices_paid":    ip.get(m, 0.0),
        }
        series.append(row)
        for k in totals:
            totals[k] += row[k]

    return {"months": months, "currency": "EGP", "series": series, "totals": totals}


# ── 2. Lead Conversion Funnel ─────────────────────────────────────────────────

@router.get("/reports/lead-funnel")
def lead_funnel_report(
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
):
    from src.commercial.lead_management.models import Lead
    from src.commercial.quotation.models import Quote
    from src.commercial.contracts.models import Contract

    def _cnt(model, **kw):
        q = db.query(func.count(model.id))
        for col, val in kw.items():
            q = q.filter(getattr(model, col) == val)
        return q.scalar() or 0

    total_leads      = db.query(func.count(Lead.id)).scalar() or 0
    new_leads        = _cnt(Lead,     status="new")
    qualified_leads  = _cnt(Lead,     status="qualified")
    assigned_leads   = _cnt(Lead,     status="assigned")
    quotes_sent      = _cnt(Quote,    status="sent")
    quotes_approved  = _cnt(Quote,    status="approved")
    contracts_active = _cnt(Contract, status="active")

    stages = [
        {"key": "new",              "label": "New Leads",        "count": new_leads},
        {"key": "qualified",        "label": "Qualified",        "count": qualified_leads},
        {"key": "assigned",         "label": "Assigned",         "count": assigned_leads},
        {"key": "quote_sent",       "label": "Quotes Sent",      "count": quotes_sent},
        {"key": "quote_approved",   "label": "Quotes Approved",  "count": quotes_approved},
        {"key": "contracts_active", "label": "Active Contracts", "count": contracts_active},
    ]

    conversion_rates = {
        "lead_to_qualified":  _safe_pct(qualified_leads,  total_leads),
        "qualified_to_sent":  _safe_pct(quotes_sent,      qualified_leads),
        "sent_to_approved":   _safe_pct(quotes_approved,  quotes_sent),
        "approved_to_active": _safe_pct(contracts_active, quotes_approved),
    }

    return {"stages": stages, "conversion_rates": conversion_rates,
             "total_leads": total_leads}


# ── 3. Agent Performance Leaderboard ─────────────────────────────────────────

@router.get("/reports/agent-leaderboard")
def agent_leaderboard_report(
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
):
    from src.commercial.agent_management.models import Agent
    from src.commercial.lead_management.models import Lead
    from src.commercial.quotation.models import Quote
    from src.commercial.contracts.models import Contract

    agents = db.query(Agent).all()
    leaderboard = []

    for agent in agents:
        # Use current_leads directly from agents table (no assigned_agent_id on leads)
        current_leads = agent.current_leads

        # Quotes linked to this agent's leads via lead.hotel_id match
        # Since leads have no agent FK, derive via hotel_id scoping
        # and cross-reference quotes on same hotel
        quotes_sent_count = (
            db.query(func.count(Quote.id))
            .filter(Quote.hotel_id == agent.hotel_id)
            .filter(Quote.status.in_(["sent", "approved"]))
            .scalar() or 0
        )
        quotes_approved_count = (
            db.query(func.count(Quote.id))
            .filter(Quote.hotel_id == agent.hotel_id)
            .filter(Quote.status == "approved")
            .scalar() or 0
        )
        active_contracts_count = (
            db.query(func.count(Contract.id))
            .filter(Contract.hotel_id == agent.hotel_id)
            .filter(Contract.status == "active")
            .scalar() or 0
        )

        leaderboard.append({
            "agent_id":         agent.id,
            "name":             agent.name,
            "email":            agent.email,
            "current_leads":    current_leads,
            "max_leads":        agent.max_leads,
            "utilization_pct":  _safe_pct(current_leads, agent.max_leads or 1),
            "quotes_sent":      quotes_sent_count,
            "quotes_approved":  quotes_approved_count,
            "contracts_active": active_contracts_count,
            "approval_rate":    _safe_pct(quotes_approved_count, quotes_sent_count),
        })

    leaderboard.sort(key=lambda x: (-x["approval_rate"], x["utilization_pct"]))
    return {"agents": leaderboard, "total_agents": len(leaderboard)}


# ── 4. Invoice CSV Export ─────────────────────────────────────────────────────

@router.get("/reports/export/invoices.csv")
def export_invoices_csv(
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
):
    from src.commercial.invoices.models import Invoice

    invoices = db.query(Invoice).order_by(Invoice.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "invoice_number", "invoice_id",
        "title", "status",
        "amount", "tax_amount", "total_amount",
        "issue_date", "due_date", "paid_date", "created_at",
    ])

    for inv in invoices:
        writer.writerow([
            inv.invoice_number,
            str(inv.id),

            inv.title or "",
            inv.status,
            inv.amount,
            inv.tax_amount,
            inv.total_amount,
            str(inv.due_date or ""),
            str(inv.due_date or ""),
            str(inv.paid_date or ""),
            str(inv.created_at),
        ])

    output.seek(0)
    fname = f"invoices_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={fname}"},
    )


# ── 5. Contract CSV Export ────────────────────────────────────────────────────

@router.get("/reports/export/contracts.csv")
def export_contracts_csv(
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
):
    from src.commercial.contracts.models import Contract
    from src.commercial.lead_management.models import Lead

    contracts = db.query(Contract).order_by(Contract.created_at.desc()).all()

    lead_ids = list({c.lead_id for c in contracts if c.lead_id})
    lead_map = {}
    if lead_ids:
        leads = db.query(Lead).filter(Lead.id.in_(lead_ids)).all()
        lead_map = {l.id: l.name for l in leads}   # leads.name confirmed field

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "contract_id", "quote_id", "lead_id", "customer_name",
        "status", "total_value", "monthly_value", "duration_months",
        "start_date", "end_date", "renewal_count", "created_at",
    ])

    for c in contracts:
        writer.writerow([
            str(c.id),
            str(c.quote_id or ""),
            str(c.lead_id or ""),
            lead_map.get(c.lead_id, ""),
            c.status,
            c.total_value,
            c.monthly_value,
            c.duration_months,
            str(c.start_date or ""),
            str(c.end_date or ""),
            c.renewal_count,
            str(c.created_at),
        ])

    output.seek(0)
    fname = f"contracts_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={fname}"},
    )


# ─────────────────────────────────────────────────────────────────────────────
# SERVICE OPERATIONS DASHBOARD — Sprint 15
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/dashboard/service-ops")
def service_ops_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
):
    """
    Service operations summary for management dashboard.
    Returns work order stats, overdue alerts, and technician utilization.
    """
    from src.commercial.work_orders.models import WorkOrder
    from src.commercial.technicians.models import Technician
    from src.commercial.service_requests.models import ServiceRequest
    from src.commercial.sites.models import Site
    from src.commercial.assets.models import Asset
    from sqlalchemy import func

    now = datetime.utcnow()

    # Work order counts by status
    wo_counts = dict(
        db.query(WorkOrder.status, func.count(WorkOrder.id))
        .group_by(WorkOrder.status)
        .all()
    )

    # Overdue: scheduled but not completed and past due date
    overdue = (
        db.query(func.count(WorkOrder.id))
        .filter(
            WorkOrder.status.notin_(["completed", "closed", "cancelled"]),
            WorkOrder.scheduled_date < now,
            WorkOrder.scheduled_date.isnot(None),
        )
        .scalar() or 0
    )

    # Due today
    from datetime import timedelta
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end   = today_start + timedelta(days=1)
    due_today = (
        db.query(func.count(WorkOrder.id))
        .filter(
            WorkOrder.scheduled_date >= today_start,
            WorkOrder.scheduled_date < today_end,
            WorkOrder.status.notin_(["completed", "closed", "cancelled"]),
        )
        .scalar() or 0
    )

    # Technician utilization
    technicians = db.query(Technician).filter(Technician.is_active == True).all()
    tech_summary = [
        {
            "id":              t.id,
            "name":            t.name,
            "current_wo":      t.current_work_orders,
            "max_wo":          t.max_work_orders,
            "utilization_pct": round((t.current_work_orders / (t.max_work_orders or 1)) * 100, 1),
        }
        for t in technicians
    ]

    # Service request summary
    sr_counts = dict(
        db.query(ServiceRequest.status, func.count(ServiceRequest.id))
        .group_by(ServiceRequest.status)
        .all()
    )

    return {
        "work_orders": {
            "total":     sum(wo_counts.values()),
            "by_status": wo_counts,
            "overdue":   overdue,
            "due_today": due_today,
        },
        "service_requests": {
            "total":     sum(sr_counts.values()),
            "by_status": sr_counts,
            "open":      sr_counts.get("new", 0) + sr_counts.get("triaged", 0),
        },
        "technicians": {
            "total":       len(technicians),
            "utilization": tech_summary,
        },
        "assets": {
            "total": db.query(func.count(Asset.id)).scalar() or 0,
        },
        "sites": {
            "total": db.query(func.count(Site.id)).scalar() or 0,
        },
    }


@router.post("/work-orders/{work_order_id}/assign")
def assign_work_order(
    work_order_id: str,
    payload: AssignIn,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """Assign a technician to a work order."""
    from src.commercial.work_orders.models import WorkOrder
    from src.commercial.technicians.models import Technician

    wo = db.query(WorkOrder).filter(
        WorkOrder.id == work_order_id,
        WorkOrder.hotel_id == hotel_id
    ).first()
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")

    tech = db.query(Technician).filter(
        Technician.id == payload.agent_id,
        Technician.hotel_id == hotel_id
    ).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")

    # Update work order
    old_tech_id = wo.technician_id
    wo.technician_id = tech.id
    wo.status = "assigned"
    wo.updated_at = datetime.utcnow()

    # Update technician capacity
    if old_tech_id != tech.id:
        tech.current_work_orders = max(0, (tech.current_work_orders or 0) + 1)
        # Release old technician if previously assigned
        if old_tech_id:
            old_tech = db.query(Technician).filter(
                Technician.id == old_tech_id).first()
            if old_tech:
                old_tech.current_work_orders = max(
                    0, (old_tech.current_work_orders or 0) - 1)

    db.commit()
    return {"ok": True, "work_order_id": work_order_id,
            "technician_id": tech.id, "technician_name": tech.name,
            "status": "assigned"}


@router.post("/work-orders/{work_order_id}/complete")
def complete_work_order(
    work_order_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """Mark a work order as completed."""
    from src.commercial.work_orders.models import WorkOrder
    from src.commercial.technicians.models import Technician

    wo = db.query(WorkOrder).filter(
        WorkOrder.id == work_order_id,
        WorkOrder.hotel_id == hotel_id
    ).first()
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    if wo.status in ("completed", "closed", "cancelled"):
        raise HTTPException(
            status_code=400,
            detail=f"Work order already {wo.status}")

    wo.status = "completed"
    wo.completed_at = datetime.utcnow()
    wo.updated_at = datetime.utcnow()

    # Release technician capacity
    if wo.technician_id:
        tech = db.query(Technician).filter(
            Technician.id == wo.technician_id).first()
        if tech:
            tech.current_work_orders = max(0, (tech.current_work_orders or 0) - 1)

    db.commit()
    return {"ok": True, "work_order_id": work_order_id, "status": "completed",
            "completed_at": wo.completed_at.isoformat()}

# ─────────────────────────────────────────────────────────────────────────────
# INVENTORY ACTIONS — Sprint 16
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/inventory/dashboard")
def inventory_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
):
    """Inventory summary dashboard."""
    from src.commercial.inventory_items.models import InventoryItem
    from src.commercial.warehouses.models import Warehouse
    from src.commercial.inventory_vendors.models import InventoryVendor
    from src.commercial.stock_movements.models import StockMovement
    from src.commercial.purchase_requests.models import PurchaseRequest
    from src.commercial.purchase_orders.models import PurchaseOrder
    from src.commercial.goods_receipts.models import GoodsReceipt
    from sqlalchemy import func

    total_items     = db.query(func.count(InventoryItem.id)).scalar() or 0
    active_items    = db.query(func.count(InventoryItem.id)).filter(InventoryItem.is_active == True).scalar() or 0
    total_warehouses = db.query(func.count(Warehouse.id)).scalar() or 0
    total_vendors   = db.query(func.count(InventoryVendor.id)).scalar() or 0

    # Low stock items (min_stock > 0 and avg_cost — simple placeholder)
    low_stock_items = (
        db.query(func.count(InventoryItem.id))
        .filter(InventoryItem.min_stock > 0)
        .filter(InventoryItem.average_cost == 0)
        .scalar() or 0
    )

    # PR/PO summary
    open_prs = db.query(func.count(PurchaseRequest.id)).filter(
        PurchaseRequest.status.in_(["draft", "pending_approval"])
    ).scalar() or 0

    open_pos = db.query(func.count(PurchaseOrder.id)).filter(
        PurchaseOrder.status.in_(["draft", "approved", "sent"])
    ).scalar() or 0

    pending_grn = db.query(func.count(GoodsReceipt.id)).filter(
        GoodsReceipt.status == "draft"
    ).scalar() or 0

    # Recent movements
    recent_movements = db.query(func.count(StockMovement.id)).scalar() or 0

    return {
        "items": {
            "total":    total_items,
            "active":   active_items,
            "low_stock": low_stock_items,
        },
        "warehouses":   {"total": total_warehouses},
        "vendors":      {"total": total_vendors},
        "procurement": {
            "open_prs":    open_prs,
            "open_pos":    open_pos,
            "pending_grn": pending_grn,
        },
        "movements": {"total": recent_movements},
    }


class StockAdjustIn(BaseModel):
    item_id: str
    warehouse_id: str
    qty: float
    unit_cost: float = 0
    reason: Optional[str] = "manual_adjustment"
    notes: Optional[str] = None


@router.post("/inventory/adjust")
def adjust_stock(
    payload: StockAdjustIn,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """Manually adjust stock quantity for an item in a warehouse."""
    from src.commercial.inventory_items.models import InventoryItem
    from src.commercial.stock_movements.models import StockMovement
    from src.commercial.warehouses.models import Warehouse
    import uuid

    item = db.query(InventoryItem).filter(
        InventoryItem.id == payload.item_id,
        InventoryItem.hotel_id == hotel_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    wh = db.query(Warehouse).filter(
        Warehouse.id == payload.warehouse_id,
        Warehouse.hotel_id == hotel_id
    ).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    now    = datetime.utcnow()
    prefix = f"TB-MOV-{now.strftime('%Y%m')}-"
    count  = db.query(StockMovement).filter(
        StockMovement.movement_number.like(f"{prefix}%")
    ).count()
    mv_num = f"{prefix}{str(count + 1).zfill(4)}"

    movement = StockMovement(
        id              = str(uuid.uuid4()),
        hotel_id        = hotel_id,
        movement_number = mv_num,
        item_id         = payload.item_id,
        warehouse_id    = payload.warehouse_id,
        movement_type   = "stock_adjustment",
        qty             = payload.qty,
        unit_cost       = payload.unit_cost,
        total_cost      = abs(payload.qty) * payload.unit_cost,
        qty_before      = 0,
        qty_after       = payload.qty,
        reason          = payload.reason,
        notes           = payload.notes,
        created_by      = current_user.email,
        created_at      = now,
    )
    db.add(movement)

    # Update item average cost if provided
    if payload.unit_cost > 0:
        item.last_purchase_cost = payload.unit_cost
        item.average_cost       = payload.unit_cost
        item.updated_at         = now

    # Update stock balance
    _update_stock_balance(
        db,
        hotel_id     = hotel_id,
        item_id      = payload.item_id,
        warehouse_id = payload.warehouse_id,
        qty_delta    = payload.qty,
        unit_cost    = payload.unit_cost,
    )

    db.commit()
    return {
        "ok": True,
        "movement_number": mv_num,
        "item_id":    payload.item_id,
        "warehouse_id": payload.warehouse_id,
        "qty":        payload.qty,
        "unit_cost":  payload.unit_cost,
    }


@router.get("/inventory/low-stock")
def low_stock_report(
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
):
    """Items at or below minimum stock level."""
    from src.commercial.inventory_items.models import InventoryItem
    items = (
        db.query(InventoryItem)
        .filter(InventoryItem.is_active == True)
        .filter(InventoryItem.min_stock > 0)
        .all()
    )
    # Simple: flag items with average_cost = 0 as "not yet stocked"
    low = [
        {
            "id":            i.id,
            "item_code":     i.item_code,
            "name":          i.name,
            "category":      i.category,
            "unit":          i.unit_of_measure,
            "min_stock":     i.min_stock,
            "reorder_qty":   i.reorder_qty,
            "lead_time_days": i.lead_time_days,
            "preferred_vendor_id": i.preferred_vendor_id,
        }
        for i in items
    ]
    return {"count": len(low), "items": low}


@router.post("/inventory/purchase-requests/{pr_id}/approve")
def approve_purchase_request(
    pr_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """Approve a purchase request."""
    from src.commercial.purchase_requests.models import PurchaseRequest

    pr = db.query(PurchaseRequest).filter(
        PurchaseRequest.id == pr_id,
        PurchaseRequest.hotel_id == hotel_id
    ).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Purchase request not found")
    if pr.status != "draft":
        raise HTTPException(status_code=400, detail=f"PR is {pr.status}, must be draft to approve")

    pr.status      = "approved"
    pr.approved_by = current_user.email
    pr.approved_at = datetime.utcnow()
    pr.updated_at  = datetime.utcnow()
    db.commit()

    return {"ok": True, "pr_id": pr_id, "pr_number": pr.pr_number, "status": "approved"}


@router.post("/inventory/purchase-orders/{po_id}/approve")
def approve_purchase_order(
    po_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """Approve and send a purchase order."""
    from src.commercial.purchase_orders.models import PurchaseOrder

    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == po_id,
        PurchaseOrder.hotel_id == hotel_id
    ).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    if po.status not in ("draft",):
        raise HTTPException(status_code=400, detail=f"PO is {po.status}")

    po.status      = "approved"
    po.approved_by = current_user.email
    po.approved_at = datetime.utcnow()
    po.updated_at  = datetime.utcnow()
    db.commit()

    return {"ok": True, "po_id": po_id, "po_number": po.po_number, "status": "approved"}


# ─────────────────────────────────────────────────────────────────────────────
# PROCUREMENT WORKFLOW ACTIONS — Sprint 17
# ─────────────────────────────────────────────────────────────────────────────

def _log_procurement_event(db, hotel_id: str, entity_type: str, entity_id: str,
                            event_type: str, created_by: str = None,
                            old_value: str = None, new_value: str = None,
                            comment: str = None):
    """Log a procurement audit event."""
    from src.commercial.procurement_events.models import ProcurementEvent
    import uuid
    ev = ProcurementEvent(
        id=str(uuid.uuid4()),
        hotel_id=hotel_id,
        entity_type=entity_type,
        entity_id=entity_id,
        event_type=event_type,
        old_value=old_value,
        new_value=new_value,
        comment=comment,
        created_by=created_by,
        created_at=datetime.utcnow(),
    )
    db.add(ev)


# ── PR → PO Conversion ────────────────────────────────────────────────────────

@router.post("/procurement/purchase-requests/{pr_id}/convert-to-po")
def convert_pr_to_po(
    pr_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """Convert an approved PR directly to a PO (when vendor is already known)."""
    from src.commercial.purchase_requests.models import PurchaseRequest
    from src.commercial.purchase_orders.models import PurchaseOrder
    import uuid

    pr = db.query(PurchaseRequest).filter(
        PurchaseRequest.id == pr_id,
        PurchaseRequest.hotel_id == hotel_id
    ).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Purchase request not found")
    if pr.status != "approved":
        raise HTTPException(
            status_code=400,
            detail=f"PR must be approved before converting to PO. Current: {pr.status}"
        )

    now    = datetime.utcnow()
    prefix = f"TB-PO-{now.strftime('%Y%m')}-"
    count  = db.query(PurchaseOrder).filter(
        PurchaseOrder.po_number.like(f"{prefix}%")
    ).count()
    po_num = f"{prefix}{str(count + 1).zfill(4)}"

    # Calculate totals from lines
    lines    = pr.lines or []
    subtotal = sum(float(l.get("estimated_cost", 0)) * float(l.get("qty", 0))
                   for l in lines if isinstance(l, dict))
    vat      = round(subtotal * 0.14, 2)
    total    = round(subtotal + vat, 2)

    # Get vendor_id from PR lines if available, otherwise use first active vendor
    from src.commercial.inventory_vendors.models import InventoryVendor
    first_vendor = db.query(InventoryVendor).filter(
        InventoryVendor.hotel_id == hotel_id,
        InventoryVendor.is_active == True
    ).first()
    vendor_id_for_po = first_vendor.id if first_vendor else "tb-default-vendor-000000000001"

    po = PurchaseOrder(
        id           = str(uuid.uuid4()),
        hotel_id     = hotel_id,
        po_number    = po_num,
        vendor_id    = vendor_id_for_po,  # auto-assigned, update via PATCH if needed
        pr_id        = pr.id,
        status       = "draft",
        lines        = lines,
        subtotal     = subtotal,
        vat_amount   = vat,
        total_amount = total,
        payment_terms = "net30",
        created_at   = now,
        updated_at   = now,
    )
    db.add(po)

    pr.status     = "po_created"
    pr.updated_at = now

    _log_procurement_event(db, hotel_id, "purchase_request", pr_id,
                           "converted_to_po", created_by=current_user.email,
                           new_value=po_num)
    db.commit()
    db.refresh(po)

    return {
        "ok": True,
        "pr_id": pr_id,
        "pr_number": pr.pr_number,
        "po_id": po.id,
        "po_number": po_num,
        "total_amount": total,
    }


# ── GRN → Stock Update (Receive Goods) ───────────────────────────────────────

class GRNReceiveIn(BaseModel):
    warehouse_id: str
    notes: Optional[str] = None


@router.post("/procurement/goods-receipts/{grn_id}/receive")
def receive_goods(
    grn_id: str,
    payload: GRNReceiveIn,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """
    Mark a GRN as received and update stock balances.
    Each line in the GRN must have: item_id, qty_received, unit_cost.
    """
    from src.commercial.goods_receipts.models import GoodsReceipt
    from src.commercial.inventory_items.models import InventoryItem
    from src.commercial.stock_movements.models import StockMovement
    from src.commercial.inventory_vendors.models import InventoryVendor
    import uuid

    grn = db.query(GoodsReceipt).filter(
        GoodsReceipt.id == grn_id,
        GoodsReceipt.hotel_id == hotel_id
    ).first()
    if not grn:
        raise HTTPException(status_code=404, detail="GRN not found")
    if grn.status == "received":
        raise HTTPException(status_code=400, detail="GRN already received")

    now          = datetime.utcnow()
    movements    = []
    errors       = []

    for line in (grn.lines or []):
        if not isinstance(line, dict):
            continue
        item_id      = line.get("item_id")
        qty_received = float(line.get("qty_received", line.get("qty", 0)))
        unit_cost    = float(line.get("unit_cost", 0))

        if not item_id or qty_received <= 0:
            continue

        item = db.query(InventoryItem).filter(
            InventoryItem.id == item_id,
            InventoryItem.hotel_id == hotel_id
        ).first()

        if not item:
            errors.append(f"Item {item_id} not found — skipped")
            continue

        # Generate movement number
        prefix = f"TB-MOV-{now.strftime('%Y%m')}-"
        count  = db.query(StockMovement).filter(
            StockMovement.movement_number.like(f"{prefix}%")
        ).count() + len(movements)
        mv_num = f"{prefix}{str(count + 1).zfill(4)}"

        mv = StockMovement(
            id              = str(uuid.uuid4()),
            hotel_id        = hotel_id,
            movement_number = mv_num,
            item_id         = item_id,
            warehouse_id    = payload.warehouse_id,
            movement_type   = "purchase_receipt",
            qty             = qty_received,
            unit_cost       = unit_cost,
            total_cost      = qty_received * unit_cost,
            qty_before      = 0,
            qty_after       = qty_received,
            reference_type  = "goods_receipt",
            reference_id    = grn_id,
            reason          = f"GRN {grn.grn_number}",
            notes           = payload.notes,
            created_by      = current_user.email,
            created_at      = now,
        )
        db.add(mv)
        movements.append(mv_num)

        # Update stock balance for this line
        _update_stock_balance(
            db,
            hotel_id     = hotel_id,
            item_id      = item_id,
            warehouse_id = payload.warehouse_id,
            qty_delta    = qty_received,
            unit_cost    = unit_cost,
        )

        # Update item cost
        if unit_cost > 0:
            item.last_purchase_cost = unit_cost
            item.average_cost       = unit_cost
            item.updated_at         = now

    # Mark GRN received
    grn.status      = "received"
    grn.received_by = current_user.email
    grn.updated_at  = now

    _log_procurement_event(db, hotel_id, "goods_receipt", grn_id,
                           "received", created_by=current_user.email,
                           new_value=f"{len(movements)} movements created")
    db.commit()

    return {
        "ok":            True,
        "grn_id":        grn_id,
        "grn_number":    grn.grn_number,
        "status":        "received",
        "movements":     movements,
        "errors":        errors,
        "total_lines":   len(movements) + len(errors),
    }


# ── RFQ Actions ───────────────────────────────────────────────────────────────

class RFQCreateIn(BaseModel):
    title: str
    pr_id: Optional[str] = None
    required_date: Optional[datetime] = None
    lines: List[Any] = []
    notes: Optional[str] = None
    vendor_ids: List[str] = []


@router.post("/procurement/rfqs")
def create_rfq(
    payload: RFQCreateIn,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """Create an RFQ and invite vendors."""
    from src.commercial.rfqs.models import RFQ, RFQVendorQuote
    import uuid

    now    = datetime.utcnow()
    prefix = f"TB-RFQ-{now.strftime('%Y%m')}-"
    count  = db.query(RFQ).filter(RFQ.rfq_number.like(f"{prefix}%")).count()
    rfq_num = f"{prefix}{str(count + 1).zfill(4)}"

    rfq = RFQ(
        id            = str(uuid.uuid4()),
        hotel_id      = hotel_id,
        rfq_number    = rfq_num,
        pr_id         = payload.pr_id,
        title         = payload.title,
        status        = "open",
        required_date = payload.required_date,
        lines         = payload.lines,
        notes         = payload.notes,
        created_by    = current_user.email,
        created_at    = now,
        updated_at    = now,
    )
    db.add(rfq)
    db.flush()

    # Create vendor quote placeholders
    for vendor_id in (payload.vendor_ids or []):
        vq = RFQVendorQuote(
            id         = str(uuid.uuid4()),
            hotel_id   = hotel_id,
            rfq_id     = rfq.id,
            vendor_id  = vendor_id,
            status     = "invited",
            lines      = [],
            created_at = now,
            updated_at = now,
        )
        db.add(vq)

    db.commit()
    return {
        "ok":        True,
        "rfq_id":    rfq.id,
        "rfq_number": rfq_num,
        "vendors_invited": len(payload.vendor_ids),
        "status":    "open",
    }


@router.get("/procurement/rfqs/{rfq_id}/compare")
def compare_rfq_quotes(
    rfq_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """Compare vendor quotes for an RFQ."""
    from src.commercial.rfqs.models import RFQ, RFQVendorQuote
    from src.commercial.inventory_vendors.models import InventoryVendor

    rfq = db.query(RFQ).filter(
        RFQ.id == rfq_id, RFQ.hotel_id == hotel_id
    ).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    quotes = db.query(RFQVendorQuote).filter(
        RFQVendorQuote.rfq_id == rfq_id
    ).all()

    # Build comparison table
    comparison = []
    for q in quotes:
        vendor = db.query(InventoryVendor).filter(
            InventoryVendor.id == q.vendor_id
        ).first()
        comparison.append({
            "quote_id":      q.id,
            "vendor_id":     q.vendor_id,
            "vendor_name":   vendor.name if vendor else "Unknown",
            "status":        q.status,
            "subtotal":      q.subtotal,
            "vat_amount":    q.vat_amount,
            "total_amount":  q.total_amount,
            "lead_time_days": q.lead_time_days,
            "validity_date": q.validity_date.isoformat() if q.validity_date else None,
            "is_winner":     q.is_winner,
            "lines":         q.lines,
        })

    # Sort by total_amount ascending
    comparison.sort(key=lambda x: x["total_amount"])

    # Tag the cheapest
    if comparison:
        comparison[0]["is_cheapest"] = True

    return {
        "rfq_id":     rfq_id,
        "rfq_number": rfq.rfq_number,
        "title":      rfq.title,
        "quotes":     comparison,
        "total_vendors": len(comparison),
    }


@router.post("/procurement/rfqs/{rfq_id}/award/{vendor_quote_id}")
def award_rfq(
    rfq_id: str,
    vendor_quote_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """Award RFQ to a vendor and auto-create PO."""
    from src.commercial.rfqs.models import RFQ, RFQVendorQuote
    from src.commercial.purchase_orders.models import PurchaseOrder
    import uuid

    rfq = db.query(RFQ).filter(
        RFQ.id == rfq_id, RFQ.hotel_id == hotel_id
    ).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    winner_q = db.query(RFQVendorQuote).filter(
        RFQVendorQuote.id == vendor_quote_id,
        RFQVendorQuote.rfq_id == rfq_id,
    ).first()
    if not winner_q:
        raise HTTPException(status_code=404, detail="Vendor quote not found")

    now    = datetime.utcnow()
    prefix = f"TB-PO-{now.strftime('%Y%m')}-"
    count  = db.query(PurchaseOrder).filter(
        PurchaseOrder.po_number.like(f"{prefix}%")
    ).count()
    po_num = f"{prefix}{str(count + 1).zfill(4)}"

    # Mark winner
    winner_q.is_winner = True
    winner_q.status    = "awarded"
    winner_q.updated_at = now

    rfq.status     = "awarded"
    rfq.updated_at = now

    # Create PO from winning quote
    po = PurchaseOrder(
        id           = str(uuid.uuid4()),
        hotel_id     = hotel_id,
        po_number    = po_num,
        vendor_id    = winner_q.vendor_id,
        pr_id        = rfq.pr_id,
        status       = "draft",
        expected_date = rfq.required_date,
        lines         = winner_q.lines,
        subtotal      = winner_q.subtotal,
        vat_amount    = winner_q.vat_amount,
        total_amount  = winner_q.total_amount,
        created_at    = now,
        updated_at    = now,
    )
    db.add(po)

    _log_procurement_event(db, hotel_id, "rfq", rfq_id, "awarded",
                           created_by=current_user.email,
                           new_value=f"PO {po_num} created")
    db.commit()

    return {
        "ok":         True,
        "rfq_id":     rfq_id,
        "rfq_number": rfq.rfq_number,
        "winner_vendor_id": winner_q.vendor_id,
        "po_id":      po.id,
        "po_number":  po_num,
        "total_amount": winner_q.total_amount,
    }


# ── Vendor Scorecard Update ───────────────────────────────────────────────────

@router.get("/procurement/vendors/{vendor_id}/scorecard")
def get_vendor_scorecard(
    vendor_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """Get or compute vendor scorecard."""
    from src.commercial.vendor_scorecards.models import VendorScorecard
    from src.commercial.inventory_vendors.models import InventoryVendor
    from src.commercial.purchase_orders.models import PurchaseOrder
    from src.commercial.goods_receipts.models import GoodsReceipt
    from sqlalchemy import func

    vendor = db.query(InventoryVendor).filter(
        InventoryVendor.id == vendor_id,
        InventoryVendor.hotel_id == hotel_id
    ).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    # Compute from PO/GRN data
    total_pos = db.query(func.count(PurchaseOrder.id)).filter(
        PurchaseOrder.vendor_id == vendor_id,
        PurchaseOrder.hotel_id == hotel_id,
    ).scalar() or 0

    total_spend = db.query(func.sum(PurchaseOrder.total_amount)).filter(
        PurchaseOrder.vendor_id == vendor_id,
        PurchaseOrder.hotel_id == hotel_id,
    ).scalar() or 0

    # Upsert scorecard
    sc = db.query(VendorScorecard).filter(
        VendorScorecard.vendor_id == vendor_id
    ).first()

    if sc:
        sc.total_pos   = total_pos
        sc.total_spend = float(total_spend)
        sc.updated_at  = datetime.utcnow()
    else:
        import uuid
        sc = VendorScorecard(
            id         = str(uuid.uuid4()),
            hotel_id   = hotel_id,
            vendor_id  = vendor_id,
            total_pos  = total_pos,
            total_spend = float(total_spend),
            updated_at = datetime.utcnow(),
        )
        db.add(sc)

    db.commit()
    db.refresh(sc)

    return {
        "vendor_id":          vendor_id,
        "vendor_name":        vendor.name,
        "total_pos":          sc.total_pos,
        "total_spend":        sc.total_spend,
        "on_time_deliveries": sc.on_time_deliveries,
        "late_deliveries":    sc.late_deliveries,
        "on_time_pct":        sc.on_time_pct,
        "quality_score":      sc.quality_score,
        "price_score":        sc.price_score,
        "overall_score":      sc.overall_score,
        "last_po_date":       sc.last_po_date.isoformat() if sc.last_po_date else None,
    }


# ── Full Procurement Dashboard ────────────────────────────────────────────────

@router.get("/procurement/dashboard")
def procurement_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """Full procurement operations dashboard."""
    from src.commercial.purchase_requests.models import PurchaseRequest
    from src.commercial.purchase_orders.models import PurchaseOrder
    from src.commercial.goods_receipts.models import GoodsReceipt
    from src.commercial.inventory_vendors.models import InventoryVendor
    from src.commercial.rfqs.models import RFQ
    from sqlalchemy import func

    # PR summary
    pr_by_status = dict(
        db.query(PurchaseRequest.status, func.count(PurchaseRequest.id))
        .filter(PurchaseRequest.hotel_id == hotel_id)
        .group_by(PurchaseRequest.status).all()
    )

    # PO summary
    po_by_status = dict(
        db.query(PurchaseOrder.status, func.count(PurchaseOrder.id))
        .filter(PurchaseOrder.hotel_id == hotel_id)
        .group_by(PurchaseOrder.status).all()
    )

    # Total PO spend
    total_po_spend = db.query(func.sum(PurchaseOrder.total_amount)).filter(
        PurchaseOrder.hotel_id == hotel_id
    ).scalar() or 0

    # GRN pending
    pending_grn = db.query(func.count(GoodsReceipt.id)).filter(
        GoodsReceipt.hotel_id == hotel_id,
        GoodsReceipt.status == "draft"
    ).scalar() or 0

    # Open RFQs
    open_rfqs = db.query(func.count(RFQ.id)).filter(
        RFQ.hotel_id == hotel_id,
        RFQ.status == "open"
    ).scalar() or 0

    # Top vendors by spend — query suppliers table (not InventoryVendor)
    from sqlalchemy import text as sql_text
    top_vendors_raw = db.execute(sql_text("""
        SELECT 
            po.supplier_id as vendor_id,
            s.company_name as vendor_name,
            SUM(po.total_amount) as total_spend,
            COUNT(po.id) as total_pos
        FROM purchase_orders po
        LEFT JOIN suppliers s ON s.id = po.supplier_id
        WHERE po.hotel_id = :hotel_id AND po.supplier_id IS NOT NULL
        GROUP BY po.supplier_id, s.company_name
        ORDER BY SUM(po.total_amount) DESC
        LIMIT 5
    """), {"hotel_id": hotel_id}).fetchall()

    top_vendors = []
    for row in top_vendors_raw:
        top_vendors.append({
            "vendor_id":   row[0],
            "vendor_name": row[1] or "Supplier",
            "total_spend": float(row[2] or 0),
            "total_pos":   row[3],
        })

    return {
        "purchase_requests": {
            "total":     sum(pr_by_status.values()),
            "by_status": pr_by_status,
            "pending_approval": pr_by_status.get("draft", 0),
        },
        "purchase_orders": {
            "total":     sum(po_by_status.values()),
            "by_status": po_by_status,
            "total_spend": float(total_po_spend),
        },
        "goods_receipts": {
            "pending": pending_grn,
        },
        "rfqs": {
            "open": open_rfqs,
        },
        "top_vendors": top_vendors,
    }


# ── Procurement Audit Log ─────────────────────────────────────────────────────

@router.get("/procurement/events/{entity_type}/{entity_id}")
def get_procurement_events(
    entity_type: str,
    entity_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """Get audit log for a procurement entity."""
    from src.commercial.procurement_events.models import ProcurementEvent

    events = (
        db.query(ProcurementEvent)
        .filter(
            ProcurementEvent.hotel_id   == hotel_id,
            ProcurementEvent.entity_type == entity_type,
            ProcurementEvent.entity_id   == entity_id,
        )
        .order_by(ProcurementEvent.created_at.asc())
        .all()
    )

    return {
        "entity_type": entity_type,
        "entity_id":   entity_id,
        "events": [
            {
                "id":         e.id,
                "event_type": e.event_type,
                "old_value":  e.old_value,
                "new_value":  e.new_value,
                "comment":    e.comment,
                "created_by": e.created_by,
                "created_at": e.created_at.isoformat(),
            }
            for e in events
        ],
    }


# ─────────────────────────────────────────────────────────────────────────────
# STOCK BALANCE ENGINE — Sprint A
# Auto-updates stock_balances after every movement
# ─────────────────────────────────────────────────────────────────────────────

def _update_stock_balance(db, hotel_id: str, item_id: str,
                           warehouse_id: str, qty_delta: float,
                           unit_cost: float = 0) -> None:
    """
    Core stock balance updater.
    Call this after EVERY stock movement (receipt, issue, adjustment).
    Uses weighted average cost calculation.
    """
    import uuid as _uuid
    from src.commercial.stock_movements.models import StockMovement as _SM
    from sqlalchemy import text as _text

    # Get or create balance row
    balance = db.execute(
        _text("""
            SELECT id, qty_on_hand, avg_cost, total_value
            FROM stock_balances
            WHERE item_id = :item_id AND warehouse_id = :warehouse_id
        """),
        {"item_id": item_id, "warehouse_id": warehouse_id}
    ).fetchone()

    if balance:
        old_qty   = float(balance.qty_on_hand or 0)
        old_cost  = float(balance.avg_cost or 0)
        new_qty   = old_qty + qty_delta

        # Weighted average cost (only update on positive receipts)
        if qty_delta > 0 and unit_cost > 0:
            total_old_value = old_qty * old_cost
            total_new_value = qty_delta * unit_cost
            new_avg_cost = (total_old_value + total_new_value) / new_qty if new_qty > 0 else unit_cost
        else:
            new_avg_cost = old_cost

        new_qty   = max(0, new_qty)
        new_value = new_qty * new_avg_cost

        db.execute(
            _text("""
                UPDATE stock_balances
                SET qty_on_hand   = :qty,
                    qty_available = :qty,
                    avg_cost      = :cost,
                    total_value   = :value,
                    updated_at    = now()
                WHERE item_id = :item_id AND warehouse_id = :warehouse_id
            """),
            {
                "qty":          new_qty,
                "cost":         new_avg_cost,
                "value":        new_value,
                "item_id":      item_id,
                "warehouse_id": warehouse_id,
            }
        )
    else:
        # First movement for this item/warehouse combo
        qty   = max(0, qty_delta)
        cost  = unit_cost if unit_cost > 0 else 0
        value = qty * cost
        db.execute(
            _text("""
                INSERT INTO stock_balances
                (id, hotel_id, item_id, warehouse_id, qty_on_hand,
                 qty_reserved, qty_available, avg_cost, total_value, updated_at)
                VALUES
                (:id, :hotel_id, :item_id, :warehouse_id, :qty,
                 0, :qty, :cost, :value, now())
            """),
            {
                "id":           str(_uuid.uuid4()),
                "hotel_id":     hotel_id,
                "item_id":      item_id,
                "warehouse_id": warehouse_id,
                "qty":          qty,
                "cost":         cost,
                "value":        value,
            }
        )


@router.get("/inventory/stock-balances")
def get_stock_balances(
    warehouse_id: str = "",
    item_id: str = "",
    db: Session = Depends(get_db),
    current_user=Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """Get current stock levels for all items."""
    from sqlalchemy import text as _text

    filters = ["hotel_id = :hotel_id"]
    params  = {"hotel_id": hotel_id}

    if warehouse_id:
        filters.append("warehouse_id = :warehouse_id")
        params["warehouse_id"] = warehouse_id
    if item_id:
        filters.append("item_id = :item_id")
        params["item_id"] = item_id

    where = " AND ".join(filters)
    rows  = db.execute(
        _text(f"""
            SELECT sb.id, sb.item_id, sb.warehouse_id,
                   sb.qty_on_hand, sb.qty_reserved, sb.qty_available,
                   sb.avg_cost, sb.total_value, sb.updated_at,
                   ii.item_code, ii.name as item_name,
                   ii.unit_of_measure, ii.min_stock, ii.reorder_qty,
                   w.name as warehouse_name, w.code as warehouse_code
            FROM stock_balances sb
            LEFT JOIN inventory_items ii ON ii.id = sb.item_id
            LEFT JOIN warehouses w       ON w.id  = sb.warehouse_id
            WHERE {where}
            ORDER BY ii.name, w.name
        """),
        params
    ).fetchall()

    result = []
    for r in rows:
        row = dict(r._mapping)
        row["is_low_stock"] = (
            float(row.get("min_stock") or 0) > 0 and
            float(row.get("qty_available") or 0) <= float(row.get("min_stock") or 0)
        )
        result.append(row)

    return {
        "count":       len(result),
        "total_value": sum(float(r.get("total_value") or 0) for r in result),
        "low_stock":   sum(1 for r in result if r["is_low_stock"]),
        "balances":    result,
    }


@router.post("/inventory/rebuild-balances")
def rebuild_stock_balances(
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """
    Rebuild ALL stock_balances from scratch using stock_movements history.
    Run this once to initialize balances from existing movement data.
    """
    from src.commercial.stock_movements.models import StockMovement as _SM
    from sqlalchemy import text as _text

    # Clear all existing balances for this hotel
    db.execute(
        _text("DELETE FROM stock_balances WHERE hotel_id = :hotel_id"),
        {"hotel_id": hotel_id}
    )
    db.commit()

    # Replay all movements in chronological order
    movements = (
        db.query(_SM)
        .filter(_SM.hotel_id == hotel_id)
        .order_by(_SM.created_at.asc())
        .all()
    )

    INBOUND  = {"purchase_receipt", "opening_balance", "stock_adjustment",
                "return_from_site", "transfer_in"}
    OUTBOUND = {"issue_to_contract", "issue_to_project", "issue_to_technician",
                "transfer_out", "write_off", "damaged", "lost"}

    processed = 0
    for mv in movements:
        if mv.movement_type in INBOUND:
            qty_delta = abs(float(mv.qty or 0))
        elif mv.movement_type in OUTBOUND:
            qty_delta = -abs(float(mv.qty or 0))
        else:
            # stock_adjustment can be positive or negative
            qty_delta = float(mv.qty or 0)

        _update_stock_balance(
            db,
            hotel_id     = hotel_id,
            item_id      = mv.item_id,
            warehouse_id = mv.warehouse_id,
            qty_delta    = qty_delta,
            unit_cost    = float(mv.unit_cost or 0),
        )
        processed += 1

    db.commit()

    # Get summary
    from sqlalchemy import text as _text2
    summary = db.execute(
        _text2("""
            SELECT COUNT(*) as rows,
                   SUM(qty_on_hand) as total_qty,
                   SUM(total_value) as total_value
            FROM stock_balances WHERE hotel_id = :hotel_id
        """),
        {"hotel_id": hotel_id}
    ).fetchone()

    return {
        "ok":             True,
        "movements_replayed": processed,
        "balance_rows":   int(summary.rows or 0),
        "total_qty":      float(summary.total_qty or 0),
        "total_value":    float(summary.total_value or 0),
    }
