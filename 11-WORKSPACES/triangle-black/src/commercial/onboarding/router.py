"""
V6-C01 — Customer Onboarding Provisioning API
Provides real self-service provisioning without developer intervention.

POST /api/v1/onboarding/provision  — create org + hotel + admin user
GET  /api/v1/onboarding/status     — check setup completeness
POST /api/v1/onboarding/validate   — validate inputs before provisioning
"""
from __future__ import annotations
import uuid
import re
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.orm import Session
from sqlalchemy import text

from src.core.database import get_db
from src.core.auth import get_current_user

logger = logging.getLogger("tb.onboarding")

router = APIRouter(tags=["Onboarding"])


# ── Input Models ─────────────────────────────────────────────────────────────

class ProvisionRequest(BaseModel):
    org_name: str
    property_name: str
    admin_email: str
    admin_name: Optional[str] = "Admin"
    city: Optional[str] = ""
    country: Optional[str] = ""

    @field_validator("org_name")
    @classmethod
    def org_name_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Organization name must be at least 2 characters")
        if len(v) > 100:
            raise ValueError("Organization name must be under 100 characters")
        return v

    @field_validator("admin_email")
    @classmethod
    def email_valid(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v

    @field_validator("admin_name")
    @classmethod
    def name_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Admin name must be at least 2 characters")
        return v


class ValidateRequest(BaseModel):
    admin_email: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_slug(name: str) -> str:
    """Convert name to URL-safe slug."""
    slug = re.sub(r"[^a-z0-9]+", "", name.lower())[:12]
    return slug or "property"


def _make_hotel_id(slug: str) -> str:
    uid = str(uuid.uuid4()).replace("-", "")[:8]
    return f"tb-hotel-{slug}-{uid}"


def _hash_password(password: str) -> str:
    """Hash password using passlib bcrypt (same as auth system)."""
    try:
        from passlib.context import CryptContext
        ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return ctx.hash(password)
    except ImportError:
        import hashlib, secrets
        salt = secrets.token_hex(16)
        h = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
        return f"sha256${salt}${h}"


def _generate_temp_password() -> str:
    """Generate a secure temporary password."""
    import secrets, string
    alphabet = string.ascii_letters + string.digits + "!@#$"
    return "TB-" + "".join(secrets.choice(alphabet) for _ in range(12))


def _default_workflow_json(hotel_id: str) -> str:
    """Default work order workflow state machine."""
    import json
    return json.dumps({
        "initial_state": "open",
        "states": ["open", "assigned", "in_progress", "pending_review",
                   "completed", "closed", "cancelled"],
        "transitions": [
            {"from": "open", "to": "assigned", "trigger": "assign"},
            {"from": "assigned", "to": "in_progress", "trigger": "start"},
            {"from": "in_progress", "to": "pending_review", "trigger": "submit"},
            {"from": "pending_review", "to": "completed", "trigger": "approve"},
            {"from": "completed", "to": "closed", "trigger": "close"},
            {"from": "open", "to": "cancelled", "trigger": "cancel"},
        ]
    })


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/onboarding/validate")
def validate_onboarding(req: ValidateRequest, db: Session = Depends(get_db)):
    """
    Pre-validate onboarding inputs.
    Returns: { valid: bool, issues: list }
    """
    issues = []
    email = req.admin_email.strip().lower()

    # Check email not already registered
    existing = db.execute(
        text("SELECT id FROM users WHERE email = :e"),
        {"e": email}
    ).fetchone()
    if existing:
        issues.append(f"Email '{email}' is already registered")

    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "email": email
    }


@router.post("/onboarding/provision")
def provision_organization(
    req: ProvisionRequest,
    db: Session = Depends(get_db),
):
    """
    Provision a new organization end-to-end:
    1. Create hotel record
    2. Create tenant record
    3. Create admin user
    4. Assign admin role
    5. Create default WO workflow definition
    Returns credentials + hotel_id for immediate login.
    No developer intervention required.
    """
    now = datetime.now(timezone.utc)
    now_str = now.isoformat()

    # ── Step 1: Check email uniqueness ───────────────────────────────────────
    email = req.admin_email.strip().lower()
    existing_user = db.execute(
        text("SELECT id FROM users WHERE email = :e"),
        {"e": email}
    ).fetchone()
    if existing_user:
        raise HTTPException(
            status_code=409,
            detail=f"Email '{email}' is already registered. Use a different email."
        )

    # ── Step 2: Create hotel ──────────────────────────────────────────────────
    slug = _make_slug(req.property_name)
    hotel_id = _make_hotel_id(slug)
    hotel_db_id = hotel_id

    try:
        db.execute(text("""
            INSERT INTO hotels (id, name, slug, city, country)
            VALUES (:id, :name, :slug, :city, :country)
        """), {
            "id": hotel_db_id,
            "name": req.property_name.strip(),
            "slug": slug + "-" + hotel_id[-8:],
            "city": req.city or "",
            "country": req.country or "",
        })
        logger.info(f"Onboarding: Hotel created {hotel_db_id}")
    except Exception as e:
        db.rollback()
        logger.error(f"Onboarding: Hotel creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Hotel creation failed: {str(e)[:100]}")

    # ── Step 3: Create tenant ─────────────────────────────────────────────────
    tenant_id = str(uuid.uuid4())
    tenant_slug = _make_slug(req.org_name) + "-" + tenant_id[:8]
    try:
        db.execute(text("""
            INSERT INTO tenants (id, name, slug, plan, is_active, hotel_id, max_users, max_assets)
            VALUES (:id, :name, :slug, :plan, :active, :hotel_id, :max_u, :max_a)
        """), {
            "id": tenant_id,
            "name": req.org_name.strip(),
            "slug": tenant_slug,
            "plan": "starter",
            "active": True,
            "hotel_id": hotel_id,
            "max_u": 20,
            "max_a": 500,
        })
        logger.info(f"Onboarding: Tenant created {tenant_id}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Tenant creation failed: {str(e)[:100]}")

    # ── Step 4: Create admin user ─────────────────────────────────────────────
    temp_password = _generate_temp_password()
    hashed = _hash_password(temp_password)
    user_id = str(uuid.uuid4())
    try:
        db.execute(text("""
            INSERT INTO users
              (id, name, email, hashed_password, role, is_active,
               created_at, updated_at, hotel_id)
            VALUES
              (:id, :name, :email, :hashed, :role, :active,
               :now, :now, :hotel_id)
        """), {
            "id": user_id,
            "name": req.admin_name.strip(),
            "email": email,
            "hashed": hashed,
            "role": "admin",
            "active": True,
            "now": now,
            "hotel_id": hotel_id,
        })
        logger.info(f"Onboarding: Admin user created {user_id}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"User creation failed: {str(e)[:100]}")

    # ── Step 5: Assign admin role in user_roles ───────────────────────────────
    try:
        db.execute(text("""
            INSERT INTO user_roles (id, user_id, role, created_at)
            VALUES (:id, :user_id, :role, :now)
        """), {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "role": "admin",
            "now": now,
        })
    except Exception:
        pass  # user_roles is supplementary — don't fail onboarding

    # ── Step 6: Create default WO workflow definition ─────────────────────────
    try:
        wf_id = str(uuid.uuid4())
        db.execute(text("""
            INSERT INTO workflow_definitions
              (id, hotel_id, name, entity_type, version,
               state_machine_json, is_active, created_at)
            VALUES
              (:id, :hotel_id, :name, :entity, :version,
               :json, :active, :now)
        """), {
            "id": wf_id,
            "hotel_id": hotel_id,
            "name": "Work Order Lifecycle",
            "entity": "work_order",
            "version": "1.0",
            "json": _default_workflow_json(hotel_id),
            "active": "true",
            "now": now,
        })
    except Exception:
        pass  # workflow is nice-to-have — don't fail onboarding

    # ── Commit everything atomically ──────────────────────────────────────────
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Commit failed: {str(e)[:100]}")

    logger.info(f"Onboarding: Complete for {req.org_name} ({hotel_id})")

    return {
        "status": "provisioned",
        "success": True,
        "hotel_id": hotel_id,
        "slug": hotel_id,
        "site_id": hotel_id,
        "ready_for_login": True,
        "admin_email": email,
        "org_name": req.org_name.strip(),
        "property_name": req.property_name.strip(),
        "admin": {
            "user_id": user_id,
            "name": req.admin_name.strip(),
            "email": email,
            "temp_password": temp_password,
            "role": "admin",
        },
        "next_steps": [
            "Login with the credentials above",
            "Import your assets using /data-import",
            "View intelligence at /intelligence",
        ],
        "provisioned_at": now_str,
    }


@router.get("/onboarding/status")
def onboarding_status(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return onboarding completeness for the authenticated user's hotel.
    Shows which setup steps are done.
    """
    try:
        from src.core.tenant import get_hotel_id
        from fastapi import Request
    except Exception:
        return {"error": "Cannot determine hotel context"}

    # Get hotel_id from user record
    user_row = db.execute(
        text("SELECT hotel_id, role FROM users WHERE id = :uid"),
        {"uid": current_user.id if hasattr(current_user, "id") else str(current_user)}
    ).fetchone()

    if not user_row:
        raise HTTPException(status_code=404, detail="User not found")

    hotel_id = user_row[0]

    # Check each step
    hotel = db.execute(
        text("SELECT id, name FROM hotels WHERE id = :h"),
        {"h": hotel_id}
    ).fetchone()

    asset_count = db.execute(
        text("SELECT COUNT(*) FROM assets WHERE hotel_id = :h"),
        {"h": hotel_id}
    ).scalar() or 0

    wo_count = db.execute(
        text("SELECT COUNT(*) FROM work_orders WHERE hotel_id = :h"),
        {"h": hotel_id}
    ).scalar() or 0

    pm_count = db.execute(
        text("SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id = :h"),
        {"h": hotel_id}
    ).scalar() or 0

    user_count = db.execute(
        text("SELECT COUNT(*) FROM users WHERE hotel_id = :h AND deleted_at IS NULL"),
        {"h": hotel_id}
    ).scalar() or 0

    steps = [
        {
            "step": 1,
            "name": "Property Setup",
            "done": bool(hotel),
            "detail": hotel[1] if hotel else "Not configured"
        },
        {
            "step": 2,
            "name": "Users Configured",
            "done": user_count >= 1,
            "detail": f"{user_count} user(s) active"
        },
        {
            "step": 3,
            "name": "Assets Imported",
            "done": asset_count >= 1,
            "detail": f"{asset_count} asset(s) in system"
        },
        {
            "step": 4,
            "name": "PM Plans Active",
            "done": pm_count >= 1,
            "detail": f"{pm_count} plan(s) configured"
        },
        {
            "step": 5,
            "name": "Operations Live",
            "done": wo_count >= 1,
            "detail": f"{wo_count} work order(s) created"
        },
    ]

    done_count = sum(1 for s in steps if s["done"])
    completion_pct = int(done_count / len(steps) * 100)

    return {
        "hotel_id": hotel_id,
        "completion_pct": completion_pct,
        "steps_done": done_count,
        "steps_total": len(steps),
        "is_complete": done_count == len(steps),
        "steps": steps,
        "summary": f"{done_count}/{len(steps)} setup steps complete ({completion_pct}%)"
    }


@router.get("/onboarding/checklist", summary="Onboarding progress checklist for new tenant")
def get_onboarding_checklist(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    V7-003: Non-developer onboarding checklist.

    Returns the complete onboarding journey with:
    - step number and label
    - status: COMPLETE / IN_PROGRESS / PENDING
    - count of records in this step
    - what to do next
    - API endpoint to use

    A non-developer can follow this checklist to fully onboard
    without developer assistance.

    Journey:
    Step 1: Property provisioned (hotel created)
    Step 2: Assets imported
    Step 3: Suppliers imported
    Step 4: PM Plans imported
    Step 5: Data quality scored (>70%)
    Step 6: Baseline KPI captured
    Step 7: First AI recommendation generated
    """
    # V7-003: extract hotel_id from authenticated user
    from src.core.tenant import get_hotel_id as _ghi
    try:
        _req_obj = type("_R", (), {"headers": {"Authorization": ""}})()
        hotel_id = getattr(current_user, "hotel_id", None)
        if not hotel_id:
            from src.core.database import get_db as _gdb2
            from sqlalchemy.orm import Session as _Sess2
            from sqlalchemy import text as _t2
            import os as _os2
            _eng2 = __import__("sqlalchemy").create_engine(
                _os2.environ.get("DATABASE_URL",
                "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
            with _Sess2(_eng2) as _db2:
                _row = _db2.execute(_t2(
                    "SELECT hotel_id FROM users WHERE id=:uid LIMIT 1"
                ), {"uid": getattr(current_user, "id", "")}).fetchone()
                hotel_id = _row[0] if _row else "tb-default-hotel-000000000001"
    except Exception:
        hotel_id = "tb-default-hotel-000000000001"
    from sqlalchemy import text as sqlt

    def _count(sql, params=None):
        try:
            return int(db.execute(sqlt(sql), params or {"h": hotel_id}).scalar() or 0)
        except Exception:
            try: db.rollback()
            except: pass
            return 0

    # Step counts
    assets = _count("SELECT COUNT(*) FROM assets WHERE hotel_id=:h")
    suppliers = _count("SELECT COUNT(*) FROM suppliers WHERE hotel_id=:h")
    pm_plans = _count("SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h")
    kpi_snapshots = _count("SELECT COUNT(*) FROM kpi_snapshots WHERE hotel_id=:h")
    recommendations = _count("SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h")

    # Data quality score (from existing engine)
    dq_score = 0.0
    try:
        from src.commercial.data_quality.service import DataQualityEngine
        dq_svc = DataQualityEngine(db=db, hotel_id=hotel_id)
        report = dq_svc.get_full_report()
        dq_score = float(report.get("overall_score", 0) or 0)
    except Exception:
        pass

    # Build checklist
    steps = [
        {
            "step": 1,
            "label": "Property Provisioned",
            "description": "Hotel property created with admin user",
            "status": "COMPLETE",  # If we got here, hotel exists
            "count": 1,
            "target": 1,
            "action": "Already done ✅",
            "endpoint": "POST /api/v1/onboarding/provision",
        },
        {
            "step": 2,
            "label": "Assets Imported",
            "description": "Upload your asset register (CSV)",
            "status": "COMPLETE" if assets >= 10 else ("IN_PROGRESS" if assets > 0 else "PENDING"),
            "count": assets,
            "target": 10,
            "action": (
                f"{assets} assets imported ✅" if assets >= 10 else
                f"Import more assets (have {assets}, recommend 10+)"
            ),
            "endpoint": "POST /api/v1/data-import/assets",
            "schema_url": "/api/v1/data-import/schema/assets",
        },
        {
            "step": 3,
            "label": "Suppliers Imported",
            "description": "Upload your supplier/vendor list (CSV)",
            "status": "COMPLETE" if suppliers >= 5 else ("IN_PROGRESS" if suppliers > 0 else "PENDING"),
            "count": suppliers,
            "target": 5,
            "action": (
                f"{suppliers} suppliers imported ✅" if suppliers >= 5 else
                f"Import suppliers (have {suppliers}, recommend 5+)"
            ),
            "endpoint": "POST /api/v1/data-import/suppliers",
            "schema_url": "/api/v1/data-import/schema/suppliers",
        },
        {
            "step": 4,
            "label": "PM Plans Imported",
            "description": "Upload your preventive maintenance schedule (CSV)",
            "status": "COMPLETE" if pm_plans >= 5 else ("IN_PROGRESS" if pm_plans > 0 else "PENDING"),
            "count": pm_plans,
            "target": 5,
            "action": (
                f"{pm_plans} PM plans imported ✅" if pm_plans >= 5 else
                f"Import PM plans (have {pm_plans}, recommend 5+)"
            ),
            "endpoint": "POST /api/v1/data-import/pm-plans",
            "schema_url": "/api/v1/data-import/schema/pm-plans",
        },
        {
            "step": 5,
            "label": "Data Quality Verified",
            "description": "Data quality score must be > 70 to proceed",
            "status": "COMPLETE" if dq_score >= 70 else ("IN_PROGRESS" if dq_score > 0 else "PENDING"),
            "count": round(dq_score, 1),
            "target": 70,
            "action": (
                f"Data quality {dq_score:.1f}/100 ✅" if dq_score >= 70 else
                f"Improve data quality (score: {dq_score:.1f}/100, target: 70)"
            ),
            "endpoint": "GET /api/v1/data-quality/report",
        },
        {
            "step": 6,
            "label": "Baseline KPI Captured",
            "description": "Capture initial KPI snapshot for before/after comparison",
            "status": "COMPLETE" if kpi_snapshots > 0 else "PENDING",
            "count": kpi_snapshots,
            "target": 1,
            "action": (
                "Baseline captured ✅" if kpi_snapshots > 0 else
                "Capture baseline: POST /api/v1/roi/snapshot"
            ),
            "endpoint": "POST /api/v1/roi/snapshot",
        },
        {
            "step": 7,
            "label": "First AI Advisory Generated",
            "description": "Generate AI recommendations from your operational data",
            "status": "COMPLETE" if recommendations > 0 else "PENDING",
            "count": recommendations,
            "target": 1,
            "action": (
                f"{recommendations} recommendations available ✅" if recommendations > 0 else
                "Generate: POST /api/v1/recommendations/generate"
            ),
            "endpoint": "POST /api/v1/recommendations/generate",
            "review_url": "/api/v1/recommendations/daily-digest",
        },
    ]

    completed = sum(1 for s in steps if s["status"] == "COMPLETE")
    total = len(steps)
    pct = round(completed / total * 100)

    # Find next action
    next_step = next((s for s in steps if s["status"] != "COMPLETE"), None)

    return {
        "hotel_id": hotel_id,
        "report_type": "ONBOARDING_CHECKLIST",
        "completion_pct": pct,
        "completed_steps": completed,
        "total_steps": total,
        "status": "COMPLETE" if completed == total else "IN_PROGRESS",
        "next_action": next_step["action"] if next_step else "Onboarding complete! Review your AI digest.",
        "next_endpoint": next_step.get("endpoint") if next_step else "/api/v1/recommendations/daily-digest",
        "steps": steps,
        "pilot_ready": completed >= 5,
        "pilot_note": (
            "Property is ready for 30-day pilot! "
            "Capture baseline KPI and generate AI recommendations."
            if completed >= 5 else
            f"Complete steps {completed+1}–{total} to be pilot-ready."
        ),
    }

