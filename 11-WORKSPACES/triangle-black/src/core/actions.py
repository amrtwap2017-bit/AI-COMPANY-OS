"""
Triangle Black — Business Action Endpoints (JWT Protected)
"""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.core.auth import require_agent, require_manager, get_current_user
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


def _log(db, lead_id, type, description, actor="system"):
    db.add(Activity(
        id=str(uuid.uuid4()), lead_id=lead_id, type=type,
        description=description, actor=actor,
        created_at=datetime.utcnow(), updated_at=datetime.utcnow(),
    ))


def _notify(db, title: str, message: str, ntype: str,
            entity_id: str, entity_type: str, recipient_role: str):
    """Create a notification record. Never raises."""
    try:
        db.add(Notification(
            id=str(uuid.uuid4()),
            title=title,
            message=message,
            type=ntype,
            entity_id=entity_id,
            entity_type=entity_type,
            recipient_role=recipient_role,
            is_read=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        ))
    except Exception as exc:
        import logging
        logging.getLogger("triangle_black").error("_notify failed: %s", exc)


# ─── QUALIFY ─────────────────────────────────────────────────────────────────

@router.post("/leads/{lead_id}/qualify")
def qualify(lead_id: str, db: Session = Depends(get_db),
            current_user: User = Depends(require_agent)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    result = qualify_lead(lead)
    lead.score = result["score"]
    lead.status = result["status"]
    lead.updated_at = datetime.utcnow()
    _log(db, lead_id, "qualification",
         f"Lead qualified. Score: {result['score']}/100. Grade: {result['grade']}.",
         actor=current_user.email)
    db.commit()
    return {"ok": True, "lead_id": lead_id, **result}


# ─── ASSIGN ──────────────────────────────────────────────────────────────────

class AssignIn(BaseModel):
    agent_id: Optional[str] = None


@router.post("/leads/{lead_id}/assign")
def assign(lead_id: str, payload: AssignIn, db: Session = Depends(get_db),
           current_user: User = Depends(require_agent)):
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
            raise HTTPException(status_code=400, detail="Agent at full capacity")
    else:
        agent = find_best_agent(db)
        if not agent:
            raise HTTPException(status_code=400, detail="No available agents")
    lead.status = "assigned"
    lead.updated_at = datetime.utcnow()
    agent.current_leads += 1
    agent.updated_at = datetime.utcnow()
    _log(db, lead_id, "assignment",
         f"Lead assigned to {agent.name} ({agent.email}). "
         f"Capacity: {agent.current_leads}/{agent.max_leads}",
         actor=current_user.email)
    db.commit()
    return {"ok": True, "lead_id": lead_id, "agent_id": agent.id,
            "agent_name": agent.name, "agent_email": agent.email,
            "agent_capacity": f"{agent.current_leads}/{agent.max_leads}"}


# ─── GENERATE QUOTE ───────────────────────────────────────────────────────────

class QuoteFromLeadIn(BaseModel):
    contract_months: int = 12


@router.post("/leads/{lead_id}/quote")
def quote_from_lead(lead_id: str, payload: QuoteFromLeadIn,
                    db: Session = Depends(get_db),
                    current_user: User = Depends(require_agent)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    quote_data = generate_quote_from_lead(lead, payload.contract_months)
    quote = Quote(id=str(uuid.uuid4()), created_at=datetime.utcnow(),
                  updated_at=datetime.utcnow(), **quote_data)
    db.add(quote)
    _log(db, lead_id, "quote_generated",
         f"Quote generated: '{quote_data['title']}'. "
         f"Total: EGP {quote_data['total']:,.2f}",
         actor=current_user.email)
    db.commit()
    db.refresh(quote)
    return {"ok": True, "quote_id": quote.id, "title": quote.title,
            "total": quote.total, "status": quote.status, "items": quote.items,
            "validity_date": quote.validity_date.isoformat() if quote.validity_date else None}


# ─── QUOTE WORKFLOW ───────────────────────────────────────────────────────────

class QuoteActionIn(BaseModel):
    note: Optional[str] = None


@router.post("/quotes/{quote_id}/submit")
def submit_quote(quote_id: str, payload: QuoteActionIn,
                 db: Session = Depends(get_db),
                 current_user: User = Depends(require_agent)):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.status != "draft":
        raise HTTPException(status_code=400, detail=f"Quote is '{quote.status}'")
    quote.status = "review"
    quote.updated_at = datetime.utcnow()
    if quote.lead_id:
        _log(db, quote.lead_id, "quote_submitted",
             f"Quote '{quote.title}' submitted for review. EGP {quote.total:,.2f}",
             actor=current_user.email)
    db.commit()
    return {"ok": True, "quote_id": quote_id, "status": "review"}


@router.post("/quotes/{quote_id}/send")
def send_quote(quote_id: str, payload: QuoteActionIn,
               background_tasks: BackgroundTasks,
               db: Session = Depends(get_db),
               current_user: User = Depends(require_manager)):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.status != "review":
        raise HTTPException(status_code=400, detail=f"Quote is '{quote.status}'")
    quote.status = "sent"
    quote.updated_at = datetime.utcnow()

    # Fetch lead for email
    lead = None
    if quote.lead_id:
        lead = db.query(Lead).filter(Lead.id == quote.lead_id).first()
        _log(db, quote.lead_id, "quote_sent",
             f"Quote '{quote.title}' sent to client. EGP {quote.total:,.2f}",
             actor=current_user.email)

    db.commit()

    # Send PDF email in background (non-blocking, never fails the request)
    if lead and lead.email:
        def _send_email_task():
            try:
                from src.core.pdf.generator import generate_quote_pdf
                pdf_bytes = generate_quote_pdf(
                    quote_id=quote.id,
                    lead_name=lead.name,
                    lead_email=lead.email,
                    lead_company=lead.company or "",
                    lead_phone=lead.phone or "",
                    quote_title=quote.title,
                    quote_description=quote.description or "",
                    items=quote.items or [],
                    total=quote.total,
                    validity_date=str(quote.validity_date)[:10] if quote.validity_date else "",
                    generated_by=current_user.name if hasattr(current_user, "name") else current_user.email,
                )
                send_quote_email(
                    to_email=lead.email,
                    to_name=lead.name,
                    quote_title=quote.title,
                    quote_total=quote.total,
                    quote_id=quote.id,
                    pdf_bytes=pdf_bytes,
                )
            except Exception as exc:
                import logging
                logging.getLogger("triangle_black.email").error(
                    "Background email task failed: %s", exc
                )

        background_tasks.add_task(_send_email_task)

    _notify(db,
        title=f"Quote Sent: {quote.title}",
        message=f"Proposal sent to {lead.name if lead else 'client'} for EGP {quote.total:,.0f}. Awaiting approval.",
        ntype="quote_sent",
        entity_id=quote_id,
        entity_type="quote",
        recipient_role="manager",
    )
    db.commit()
    return {
        "ok": True,
        "quote_id": quote_id,
        "status": "sent",
        "email_queued": bool(lead and lead.email),
    }


@router.post("/quotes/{quote_id}/approve")
def approve_quote(quote_id: str, payload: QuoteActionIn,
                  db: Session = Depends(get_db),
                  current_user: User = Depends(require_manager)):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.status != "sent":
        raise HTTPException(status_code=400, detail=f"Quote is '{quote.status}'")

    quote.status = "approved"
    quote.updated_at = datetime.utcnow()

    # Convert lead
    lead = None
    if quote.lead_id:
        lead = db.query(Lead).filter(Lead.id == quote.lead_id).first()
        if lead:
            release_agent_capacity(db, lead)
            lead.status = "converted"
            lead.updated_at = datetime.utcnow()
        _log(db, quote.lead_id, "quote_approved",
             f"Quote '{quote.title}' APPROVED. EGP {quote.total:,.2f}. Lead converted.",
             actor=current_user.email)

    # Auto-create contract
    contract = Contract(
        id=str(uuid.uuid4()),
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
             actor="system")

    _notify(db,
        title=f"Quote Approved: {quote.title}",
        message=f"EGP {quote.total:,.0f} contract approved. Contract {contract.id[:8].upper()} created automatically.",
        ntype="quote_approved",
        entity_id=quote_id,
        entity_type="quote",
        recipient_role="all",
    )
    db.commit()
    return {
        "ok": True, "quote_id": quote_id, "status": "approved",
        "contract_id": contract.id,
        "message": "Quote approved — lead converted — contract created",
    }


@router.post("/quotes/{quote_id}/reject")
def reject_quote(quote_id: str, payload: QuoteActionIn,
                 db: Session = Depends(get_db),
                 current_user: User = Depends(require_manager)):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.status not in ("sent", "review"):
        raise HTTPException(status_code=400,
                            detail=f"Cannot reject quote in '{quote.status}'")
    quote.status = "rejected"
    quote.updated_at = datetime.utcnow()
    if quote.lead_id:
        lead = db.query(Lead).filter(Lead.id == quote.lead_id).first()
        if lead:
            release_agent_capacity(db, lead)
            lead.status = "lost"
            lead.updated_at = datetime.utcnow()
        _log(db, quote.lead_id, "quote_rejected",
             f"Quote '{quote.title}' rejected. "
             f"Note: {payload.note or 'No reason'}. Lead lost.",
             actor=current_user.email)
    db.commit()
    return {"ok": True, "quote_id": quote_id, "status": "rejected",
            "message": "Quote rejected — lead marked as lost"}


# ─── TIMELINE ────────────────────────────────────────────────────────────────

@router.get("/leads/{lead_id}/timeline")
def lead_timeline(lead_id: str, db: Session = Depends(get_db),
                  _: User = Depends(require_agent)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    activities = (db.query(Activity).filter(Activity.lead_id == lead_id)
                  .order_by(Activity.created_at.desc()).all())
    contract = db.query(Contract).filter(Contract.lead_id == lead_id).first()
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
def pipeline_summary(db: Session = Depends(get_db),
                     _: User = Depends(require_agent)):
    return compute_pipeline(db)


@router.get("/reports/dashboard")
def dashboard(db: Session = Depends(get_db),
              _: User = Depends(require_manager)):
    return compute_dashboard(db)


# ─── SEARCH ──────────────────────────────────────────────────────────────────

@router.get("/leads/search")
def lead_search(
    q: str = "", status: str = "", source: str = "",
    priority: str = "", limit: int = 50,
    db: Session = Depends(get_db), _: User = Depends(require_agent),
):
    results = search_leads(
        db, q=q, status=status or None,
        source=source or None, priority=priority or None, limit=limit,
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


# ─── DUPLICATE CHECK ─────────────────────────────────────────────────────────

@router.get("/leads/check-duplicate")
def check_duplicate(
    email: str, exclude_id: str = "",
    db: Session = Depends(get_db), _: User = Depends(require_agent),
):
    existing = check_duplicate_lead(db, email, exclude_id or None)
    return {
        "is_duplicate": existing is not None,
        "existing_lead": {
            "id": existing.id, "name": existing.name,
            "status": existing.status,
        } if existing else None,
    }


# ─── EXPIRE OVERDUE ───────────────────────────────────────────────────────────

@router.post("/quotes/expire-overdue")
def expire_overdue(db: Session = Depends(get_db),
                   _: User = Depends(require_manager)):
    count = expire_overdue_quotes(db)
    return {"ok": True, "expired_count": count}


# ─── AGENT LEADS + PERFORMANCE ────────────────────────────────────────────────

@router.get("/agents/{agent_id}/leads")
def agent_leads(agent_id: str, db: Session = Depends(get_db),
                _: User = Depends(require_manager)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    leads = db.query(Lead).filter(Lead.status == "assigned").all()
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
def agent_performance(agent_id: str, db: Session = Depends(get_db),
                      _: User = Depends(require_manager)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    all_leads = db.query(Lead).filter(
        Lead.status.in_(["assigned","converted","lost"])
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


# ─── USERS (admin) ────────────────────────────────────────────────────────────

@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    from src.commercial.auth.models import User as UserModel
    users = db.query(UserModel).order_by(UserModel.created_at.desc()).all()
    return [
        {
            "id": u.id, "name": u.name, "email": u.email,
            "role": u.role, "is_active": u.is_active,
            "created_at": u.created_at.isoformat(),
            "updated_at": u.updated_at.isoformat(),
        }
        for u in users
    ]


@router.post("/users")
def create_user(payload: dict, db: Session = Depends(get_db),
                _: User = Depends(require_manager)):
    import bcrypt as _bcrypt
    import uuid as _uuid
    from src.commercial.auth.models import User as UserModel
    existing = db.query(UserModel).filter(UserModel.email == payload["email"]).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    pw = payload.get("password", "")
    hashed = _bcrypt.hashpw(pw.encode(), _bcrypt.gensalt()).decode()
    user = UserModel(
        id=str(_uuid.uuid4()),
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
    return {
        "id": user.id, "name": user.name, "email": user.email,
        "role": user.role, "is_active": user.is_active,
        "created_at": user.created_at.isoformat(),
    }


# ─── PDF GENERATION ──────────────────────────────────────────────────────────

@router.get("/quotes/{quote_id}/pdf")
def download_quote_pdf(
    quote_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
):
    """Generate and download enterprise PDF quote."""
    from fastapi.responses import Response
    from src.core.pdf.generator import generate_quote_pdf

    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    lead = None
    if quote.lead_id:
        lead = db.query(Lead).filter(Lead.id == quote.lead_id).first()

    pdf_bytes = generate_quote_pdf(
        quote_id=quote.id,
        quote_title=quote.title,
        quote_description=quote.description or "",
        items=quote.items or [],
        total=quote.total,
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
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(pdf_bytes)),
        }
    )
