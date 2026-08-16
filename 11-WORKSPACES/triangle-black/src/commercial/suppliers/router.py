

from src.core.audit import audit_create, audit_update

# ── Sprint-041: Supplier Create ───────────────────────────────────────────────
@router.post("/", status_code=201, summary="Create supplier")
def create_supplier(data: dict, db: Session = Depends(get_db)):
    """Create a new supplier."""
    from sqlalchemy import text as _t
    import uuid as _u, datetime as _d
    try:
        sid = str(_u.uuid4())
        now = _d.datetime.utcnow()
        hotel_id = data.get("hotel_id", "tb-default-hotel-000000000001")
        
        db.execute(_t("""
            INSERT INTO suppliers (
                id, hotel_id, supplier_code, company_name, arabic_name,
                status, supplier_type, payment_terms, lead_time_days,
                preferred_flag, risk_level, notes, city, country,
                phone, email, category, contact_person, credit_limit,
                blacklisted, is_approved, rating, created_at, updated_at
            ) VALUES (
                :id, :hotel_id, :code, :company_name, :arabic_name,
                :status, :supplier_type, :payment_terms, :lead_time_days,
                :preferred_flag, :risk_level, :notes, :city, :country,
                :phone, :email, :category, :contact_person, :credit_limit,
                :blacklisted, :is_approved, :rating, :created_at, :updated_at
            )
        """), {
            "id": sid,
            "hotel_id": hotel_id,
            "code": data.get("supplier_code") or f"SUP-{sid[:6].upper()}",
            "company_name": data.get("company_name", "New Supplier"),
            "arabic_name": data.get("arabic_name", ""),
            "status": data.get("status", "active"),
            "supplier_type": data.get("supplier_type", "general"),
            "payment_terms": data.get("payment_terms", "net_30"),
            "lead_time_days": data.get("lead_time_days", 7),
            "preferred_flag": str(data.get("preferred_flag", False)),
            "risk_level": data.get("risk_level", "low"),
            "notes": data.get("notes", ""),
            "city": data.get("city", ""),
            "country": data.get("country", "Egypt"),
            "phone": data.get("phone", ""),
            "email": data.get("email", ""),
            "category": data.get("category", "general"),
            "contact_person": data.get("contact_person", ""),
            "credit_limit": data.get("credit_limit", 0),
            "blacklisted": str(data.get("blacklisted", False)),
            "is_approved": str(data.get("is_approved", False)),
            "rating": data.get("rating", 0),
            "created_at": now,
            "updated_at": now,
        })
        db.commit()
        return {"id": sid, "company_name": data.get("company_name"), "status": "active", "ok": True}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
# ─────────────────────────────────────────────────────────────────────────────

# ── Sprint-058: Suppliers GET endpoints (fixes 500 on GET /api/v1/suppliers/) ─
@router.get("/", summary="List suppliers")
def list_suppliers(
    hotel_id: str = "tb-default-hotel-000000000001",
    status: str = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """List suppliers filtered by hotel_id."""
    from sqlalchemy import text as _t
    try:
        where = "WHERE hotel_id = :hotel_id"
        params = {"hotel_id": hotel_id, "limit": limit, "offset": offset}
        if status:
            where += " AND status = :status"
            params["status"] = status
        rows = db.execute(_t(f"""
            SELECT id, hotel_id, supplier_code, company_name, arabic_name,
                   status, supplier_type, payment_terms, lead_time_days,
                   preferred_flag, risk_level, city, country,
                   phone, email, category, contact_person,
                   credit_limit, blacklisted, is_approved, rating,
                   created_at, updated_at
            FROM suppliers
            {where}
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :offset
        """), params).fetchall()
        count = db.execute(_t(f"""
            SELECT COUNT(*) FROM suppliers {where}
        """), {k: v for k, v in params.items()
               if k not in ("limit", "offset")}).scalar()
        return {
            "count": count,
            "results": [dict(r._mapping) for r in rows]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{supplier_id}", summary="Get supplier detail")
def get_supplier(
    supplier_id: str,
    hotel_id: str = "tb-default-hotel-000000000001",
    db: Session = Depends(get_db)
):
    """Get a single supplier by ID."""
    from sqlalchemy import text as _t
    try:
        row = db.execute(_t("""
            SELECT id, hotel_id, supplier_code, company_name, arabic_name,
                   status, supplier_type, payment_terms, lead_time_days,
                   preferred_flag, risk_level, notes, city, country,
                   phone, email, category, contact_person,
                   credit_limit, blacklisted, is_approved, rating,
                   created_at, updated_at
            FROM suppliers
            WHERE id = :id AND hotel_id = :hotel_id
        """), {"id": supplier_id, "hotel_id": hotel_id}).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Supplier not found")
        return dict(row._mapping)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{supplier_id}", summary="Update supplier")
def update_supplier(
    supplier_id: str,
    data: dict,
    db: Session = Depends(get_db)
):
    """Update supplier fields."""
    from sqlalchemy import text as _t
    import datetime as _d
    try:
        hotel_id = data.get("hotel_id", "tb-default-hotel-000000000001")
        allowed = [
            "company_name", "arabic_name", "status", "supplier_type",
            "payment_terms", "lead_time_days", "preferred_flag", "risk_level",
            "notes", "city", "country", "phone", "email", "category",
            "contact_person", "credit_limit", "blacklisted", "is_approved", "rating"
        ]
        updates = {k: v for k, v in data.items() if k in allowed}
        if not updates:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        updates["updated_at"] = _d.datetime.utcnow()
        updates["id"] = supplier_id
        updates["hotel_id"] = hotel_id
        set_clause = ", ".join(f"{k} = :{k}" for k in updates
                               if k not in ("id", "hotel_id"))
        db.execute(_t(f"""
            UPDATE suppliers SET {set_clause}
            WHERE id = :id AND hotel_id = :hotel_id
        """), updates)
        db.commit()
        return {"ok": True, "id": supplier_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
# ─────────────────────────────────────────────────────────────────────────────
