

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
