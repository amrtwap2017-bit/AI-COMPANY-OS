"""RBAC Router — extracted from main.py A-007"""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import require_admin

router = APIRouter(prefix="/rbac", tags=["rbac"])
VALID_ROLES = ["admin","manager","engineer","technician","finance","supplier","viewer"]

@router.post("/users/{user_id}/role")
def assign_user_role(user_id: str, data: dict,
                     hotel_id: str = Depends(get_hotel_id),
                     db: Session = Depends(get_db),
                     _: dict = Depends(require_admin)):
    role = data.get("role","")
    if role not in VALID_ROLES:
        raise HTTPException(400, f"Invalid role. Must be one of: {VALID_ROLES}")
    try:
        result = db.execute(text(
            "UPDATE users SET role=:role, updated_at=NOW() "
            "WHERE id=:uid AND hotel_id=:hid RETURNING id,name,email,role"
        ), {"role":role,"uid":user_id,"hid":hotel_id}).fetchone()
        if not result:
            raise HTTPException(404, "User not found in this tenant")
        db.commit()
        return {"success":True,"user_id":result.id,"name":result.name,
                "email":result.email,"role":result.role}
    except HTTPException: raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e)[:200])

@router.get("/users")
def list_users_with_roles(hotel_id: str = Depends(get_hotel_id),
                          db: Session = Depends(get_db),
                          _: dict = Depends(require_admin)):
    try:
        rows = db.execute(text(
            "SELECT id,name,email,role,is_active,created_at FROM users "
            "WHERE hotel_id=:hid AND deleted_at IS NULL ORDER BY role,name"
        ), {"hid":hotel_id}).fetchall()
        return {"hotel_id":hotel_id,"total":len(rows),
                "users":[dict(r._mapping) for r in rows],
                "valid_roles":VALID_ROLES}
    except Exception as e:
        raise HTTPException(500, str(e)[:200])
