from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from src.commercial.crm.models import Lead, Agent, LeadActivity
from src.commercial.crm.schemas import LeadCreate, LeadUpdate, LeadStatusUpdate, QualificationResult, PipelineSummary

class QualificationEngine:
    RULES = {
        "has_phone": 15,
        "has_company": 10,
        "source_referral": 25,
        "source_direct": 15,
        "source_web": 10,
        "company_domain_email": 20,
    }

    @classmethod
    def score(cls, lead: Lead) -> QualificationResult:
        points = {}
        total = 0

        if lead.phone:
            points["has_phone"] = cls.RULES["has_phone"]
            total += cls.RULES["has_phone"]
        if lead.company:
            points["has_company"] = cls.RULES["has_company"]
            total += cls.RULES["has_company"]
        if lead.source == "referral":
            points["source_referral"] = cls.RULES["source_referral"]
            total += cls.RULES["source_referral"]
        elif lead.source == "direct":
            points["source_direct"] = cls.RULES["source_direct"]
            total += cls.RULES["source_direct"]
        else:
            points["source_web"] = cls.RULES["source_web"]
            total += cls.RULES["source_web"]

        if lead.email and lead.company:
            domain = lead.email.split("@")[-1].lower()
            company_clean = lead.company.lower().replace(" ", "").replace("-", "")[:10]
            if any(part in domain for part in company_clean.split()[:2]):
                points["company_domain_email"] = cls.RULES["company_domain_email"]
                total += cls.RULES["company_domain_email"]

        if total >= 70:
            grade = "qualified"
            recommendation = "High priority — assign to senior agent immediately"
        elif total >= 40:
            grade = "warm"
            recommendation = "Medium priority — nurture and follow up within 48h"
        else:
            grade = "cold"
            recommendation = "Low priority — add to newsletter sequence"

        return QualificationResult(lead_id=lead.id, score=total, grade=grade, breakdown=points, recommendation=recommendation)


class LeadService:
    def __init__(self, db: Session):
        self.db = db

    def _log(self, lead_id: str, activity_type: str, description: str, actor: str = "system"):
        self.db.add(LeadActivity(lead_id=lead_id, type=activity_type, description=description, actor=actor))

    def create(self, payload: LeadCreate, actor: str = "system") -> Lead:
        lead = Lead(**payload.model_dump())
        self.db.add(lead)
        self.db.flush()
        self._log(lead.id, "created", f"Lead created from {lead.source}", actor)
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def get(self, lead_id: str) -> Lead:
        lead = self.db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")
        return lead

    def list(self, status: str | None = None, source: str | None = None,
             agent_id: str | None = None, skip: int = 0, limit: int = 50) -> list[Lead]:
        q = self.db.query(Lead)
        if status:
            q = q.filter(Lead.status == status)
        if source:
            q = q.filter(Lead.source == source)
        if agent_id:
            q = q.filter(Lead.assigned_agent_id == agent_id)
        return q.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()

    def search(self, query: str) -> list[Lead]:
        term = f"%{query.lower()}%"
        return self.db.query(Lead).filter(
            (func.lower(Lead.name).like(term)) |
            (func.lower(Lead.email).like(term)) |
            (func.lower(Lead.company).like(term))
        ).limit(50).all()

    def update_status(self, lead_id: str, payload: LeadStatusUpdate, actor: str = "system") -> Lead:
        lead = self.get(lead_id)
        old = lead.status
        lead.status = payload.status
        self._log(lead_id, "status_change", f"Status changed: {old} → {payload.status}. {payload.note or ''}", actor)
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def qualify(self, lead_id: str, actor: str = "system") -> QualificationResult:
        lead = self.get(lead_id)
        result = QualificationEngine.score(lead)
        lead.score = result.score
        lead.grade = result.grade
        if result.grade == "qualified" and lead.status == "new":
            lead.status = "qualified"
        self._log(lead_id, "qualification", f"Qualified: score={result.score} grade={result.grade}", actor)
        self.db.commit()
        return result

    def assign(self, lead_id: str, agent_id: str | None = None, actor: str = "system") -> Lead:
        lead = self.get(lead_id)
        if agent_id:
            agent = self.db.query(Agent).filter(Agent.id == agent_id, Agent.is_active == "true").first()
            if not agent:
                raise HTTPException(status_code=404, detail="Agent not found or inactive")
            if agent.current_leads >= agent.max_leads:
                raise HTTPException(status_code=409, detail=f"Agent {agent.name} is at capacity ({agent.max_leads} leads)")
        else:
            agent = self.db.query(Agent).filter(
                Agent.is_active == "true",
                Agent.current_leads < Agent.max_leads
            ).order_by(Agent.current_leads.asc()).first()
            if not agent:
                raise HTTPException(status_code=409, detail="No available agents with capacity")

        if lead.assigned_agent_id:
            old_agent = self.db.query(Agent).filter(Agent.id == lead.assigned_agent_id).first()
            if old_agent:
                old_agent.current_leads = max(0, old_agent.current_leads - 1)

        lead.assigned_agent_id = agent.id
        lead.status = "assigned"
        agent.current_leads += 1
        self._log(lead_id, "assignment", f"Assigned to agent: {agent.name}", actor)
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def pipeline_summary(self) -> PipelineSummary:
        total = self.db.query(func.count(Lead.id)).scalar()
        by_status = dict(self.db.query(Lead.status, func.count(Lead.id)).group_by(Lead.status).all())
        by_source = dict(self.db.query(Lead.source, func.count(Lead.id)).group_by(Lead.source).all())
        converted = by_status.get("converted", 0)
        conversion_rate = round((converted / total * 100), 2) if total > 0 else 0.0
        avg_score_result = self.db.query(func.avg(Lead.score)).scalar()
        avg_score = round(float(avg_score_result or 0), 2)
        return PipelineSummary(total=total, by_status=by_status, by_source=by_source, conversion_rate=conversion_rate, avg_score=avg_score)
