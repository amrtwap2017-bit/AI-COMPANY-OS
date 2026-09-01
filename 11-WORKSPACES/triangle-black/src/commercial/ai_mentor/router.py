from __future__ import annotations
"""
AI Mentor System - Sprint 90
Guides employees through best practices.
Learns from decisions and improves recommendations.
Context-aware guidance for procurement, maintenance, and operations.
"""
import datetime
from datetime import datetime as _dt
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db

router = APIRouter(prefix="/ai-mentor", tags=["ai-mentor"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _safe_int(v):
    try: return int(v or 0)
    except: return 0

def _safe_float(v):
    try: return float(v or 0)
    except: return 0.0

def _ensure_learning_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS ai_mentor_decisions (
            id              VARCHAR(36) PRIMARY KEY,
            context_type    VARCHAR(50) NOT NULL,
            context_id      VARCHAR(36),
            decision_made   TEXT NOT NULL,
            outcome         VARCHAR(20),
            outcome_notes   TEXT,
            hotel_id        VARCHAR(36),
            created_at      TIMESTAMP NOT NULL,
            outcome_at      TIMESTAMP
        )
    """))
    db.commit()

# Best practice knowledge base
BEST_PRACTICES = {
    "procurement": {
        "3_quote_rule": "Always get minimum 3 quotes for any purchase > 5,000 EGP",
        "vendor_verification": "Verify vendor tax registration and quality certifications before first order",
        "lead_time_buffer": "Add 50% buffer to vendor lead time for planning (vendor says 7 days → plan for 10-11 days)",
        "bulk_discount": "Orders > 10,000 EGP qualify for 5-10% bulk discount negotiation",
        "preferred_vendors": "Use preferred vendor list first - they have pre-negotiated prices and verified quality",
        "emergency_markup": "Emergency procurement (same-day) typically costs 15-25% more - plan ahead to avoid",
        "payment_terms": "Standard payment terms: NET-30. Push for NET-45 on orders > 50,000 EGP",
    },
    "inventory": {
        "safety_stock": "Minimum safety stock = 2x average weekly consumption",
        "critical_items": "Critical items (HVAC, electrical) should have 30-day safety stock",
        "expiry_management": "Chemicals and consumables: order max 3-month supply - check expiry dates on receipt",
        "fifo_rule": "Always use FIFO (First In, First Out) - older stock first",
        "stockout_cost": "A stockout costs 3x more than carrying extra stock - when in doubt, order",
        "category_consolidation": "Consolidate orders within same category - saves admin time and freight costs",
        "annual_contract": "High-usage items: negotiate annual supply contracts - 10-15% cost saving",
    },
    "maintenance": {
        "pm_priority": "Preventive maintenance always takes priority over reactive - 5x cheaper than breakdown",
        "critical_assets": "Critical assets (chillers, generators) must have spare parts on-site",
        "inspection_frequency": "HVAC: monthly. Electrical: quarterly. Plumbing: semi-annual",
        "warranty_protection": "Never skip PM visits - voids manufacturer warranty",
        "mttr_target": "Mean Time To Repair target: Critical = 2 hours, High = 4 hours, Medium = 24 hours",
        "documentation": "Document every repair with photos - required for warranty claims and insurance",
    },
    "vendor_management": {
        "scorecard_update": "Update vendor scorecards after every delivery - minimum quarterly review",
        "performance_kpis": "Track: on-time delivery, quality defects, invoice accuracy, responsiveness",
        "dual_sourcing": "Never rely on single vendor for critical items - maintain minimum 2 approved vendors",
        "relationship": "Annual vendor meeting: review performance, negotiate next year pricing",
        "blacklist": "3 strikes: late delivery + quality issues + poor response → vendor review board",
    },
}

@router.get("/guidance/{context_type}", summary="Get best practice guidance")
def get_guidance(
    context_type: str,
    action:       str = Query(default=None),
    hotel_id:     str = Query(default=None),
    db: Session = Depends(get_db)
):
    """
    Get AI mentor guidance for a specific context.
    Contexts: procurement | inventory | maintenance | vendor_management
    """
    now = _dt.utcnow()
    practices = BEST_PRACTICES.get(context_type, {})

    # Get relevant practice based on action
    relevant_tip = None
    all_tips = list(practices.items())

    if action:
        action_lower = action.lower()
        for key, tip in practices.items():
            if any(word in action_lower for word in key.split("_")):
                relevant_tip = {"rule": key, "guidance": tip}
                break

    # Get contextual data from DB to personalize guidance
    context_data = {}
    insights = []

    if context_type == "procurement" and hotel_id:
        try:
            # How many PRs this hotel has this month
            row = db.execute(text("""
                SELECT count(*) as cnt, avg(total_amount) as avg_value
                FROM purchase_requests
                WHERE hotel_id = :hid
                AND created_at >= DATE_TRUNC('month', NOW())
            """), {"hid": hotel_id}).fetchone()
            d = row_to_dict(row)
            count = _safe_int(d.get("cnt"))
            avg_val = _safe_float(d.get("avg_value"))
            if count > 10:
                insights.append(f"HIGH ACTIVITY: {count} PRs this month - consider bulk ordering to reduce admin overhead")
            if avg_val < 5000:
                insights.append(f"LOW-VALUE PRs detected (avg {avg_val:,.0f} EGP) - consolidate small orders to reduce processing cost")
        except Exception:
            pass

    elif context_type == "inventory" and hotel_id:
        try:
            row = db.execute(text("""
                SELECT count(*) as critical
                FROM inventory_items ii
                JOIN stock_balances sb ON sb.item_id = ii.id
                WHERE ii.hotel_id = :hid AND sb.quantity = 0
            """), {"hid": hotel_id}).fetchone()
            critical = _safe_int(row_to_dict(row).get("critical"))
            if critical > 0:
                insights.append(f"URGENT: {critical} items are completely out of stock - create PRs immediately")
        except Exception:
            pass

    elif context_type == "maintenance" and hotel_id:
        try:
            row = db.execute(text("""
                SELECT count(*) as overdue
                FROM maintenance_plans
                WHERE next_due_date < NOW() AND status = 'active'
            """)).fetchone()
            overdue = _safe_int(row_to_dict(row).get("overdue"))
            if overdue > 0:
                insights.append(f"MAINTENANCE RISK: {overdue} PM plans overdue - schedule immediately")
        except Exception:
            pass

    return {
        "context":        context_type,
        "action":         action,
        "relevant_tip":   relevant_tip,
        "all_practices":  [{"rule": k.replace("_"," ").title(), "guidance": v} for k, v in all_tips],
        "personalized_insights": insights,
        "quick_checklist": {
            "procurement": ["Got 3+ quotes?","Vendor verified?","Budget approved?","Lead time planned?"],
            "inventory":   ["Safety stock maintained?","Expiry checked?","FIFO applied?","Reorder triggered?"],
            "maintenance": ["PM schedule current?","Spare parts available?","Documentation complete?"],
            "vendor_management": ["Scorecard updated?","Performance KPIs tracked?","Dual source maintained?"],
        }.get(context_type, []),
        "generated_at": now.isoformat(),
    }

@router.post("/record-decision", summary="Record a procurement decision for learning")
def record_decision(data: dict, db: Session = Depends(get_db)):
    """
    Record a decision made in the system for AI learning.
    The system learns from outcomes to improve future recommendations.
    """
    _ensure_learning_table(db)
    now = _dt.utcnow()
    decision_id = str(uuid.uuid4())

    db.execute(text("""
        INSERT INTO ai_mentor_decisions
            (id, context_type, context_id, decision_made, hotel_id, created_at)
        VALUES (:id, :ctype, :cid, :decision, :hotel_id, :now)
    """), {
        "id":       decision_id,
        "ctype":    data.get("context_type", "general"),
        "cid":      data.get("context_id"),
        "decision": str(data.get("decision_made",""))[:500],
        "hotel_id": data.get("hotel_id"),
        "now":      now,
    })
    db.commit()

    return {
        "success":     True,
        "decision_id": decision_id,
        "message":     "Decision recorded for AI learning",
    }

@router.post("/record-outcome/{decision_id}", summary="Record decision outcome")
def record_outcome(decision_id: str, data: dict, db: Session = Depends(get_db)):
    """Record the outcome of a previous decision - feeds the learning engine."""
    _ensure_learning_table(db)
    now = _dt.utcnow()

    outcome = data.get("outcome", "neutral")  # positive | negative | neutral
    notes   = data.get("notes", "")

    db.execute(text("""
        UPDATE ai_mentor_decisions
        SET outcome = :outcome, outcome_notes = :notes, outcome_at = :now
        WHERE id = :id
    """), {"outcome": outcome, "notes": notes[:500], "now": now, "id": decision_id})
    db.commit()

    return {"success": True, "decision_id": decision_id, "outcome": outcome}

@router.get("/learning-insights", summary="AI learning insights from decisions")
def learning_insights(
    context_type: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """What the AI has learned from past decisions."""
    _ensure_learning_table(db)

    try:
        where = ""
        params = {}
        if context_type:
            where = "WHERE context_type = :ctype"
            params["ctype"] = context_type

        rows = db.execute(text(f"""
            SELECT context_type, outcome, count(*) as count
            FROM ai_mentor_decisions
            {where}
            GROUP BY context_type, outcome
            ORDER BY context_type, count(*) DESC
        """), params).fetchall()

        outcomes_by_type = {}
        for row in rows:
            r = row_to_dict(row)
            ct = r.get("context_type","?")
            if ct not in outcomes_by_type:
                outcomes_by_type[ct] = {"positive": 0, "negative": 0, "neutral": 0, "unknown": 0}
            out = r.get("outcome") or "unknown"
            outcomes_by_type[ct][out] = _safe_int(r.get("count"))

        total = sum(sum(v.values()) for v in outcomes_by_type.values())

        insights = []
        for ct, counts in outcomes_by_type.items():
            pos = counts.get("positive", 0)
            neg = counts.get("negative", 0)
            ttl = pos + neg + counts.get("neutral", 0)
            if ttl > 0 and pos + neg > 0:
                success_rate = round(pos / (pos + neg) * 100, 1) if (pos + neg) > 0 else 0
                insights.append({
                    "area": ct,
                    "total_decisions": ttl,
                    "success_rate": success_rate,
                    "learning": f"{success_rate}% positive outcomes in {ct} decisions",
                })

        return {
            "total_decisions_recorded": total,
            "outcomes_by_area":         outcomes_by_type,
            "insights":                 insights,
            "learning_status":          "active" if total > 0 else "gathering_data",
            "generated_at":             _dt.utcnow().isoformat(),
        }
    except Exception as e:
        return {"total_decisions_recorded": 0, "insights": [], "error": str(e)}
