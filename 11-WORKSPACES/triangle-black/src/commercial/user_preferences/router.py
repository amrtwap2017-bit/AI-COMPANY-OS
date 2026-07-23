from __future__ import annotations
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db

router = APIRouter(prefix="/user-preferences", tags=["user-preferences"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _ensure_prefs_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS user_preferences (
            id           VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
            user_id      VARCHAR(100) NOT NULL,
            pref_key     VARCHAR(100) NOT NULL,
            pref_value   TEXT,
            updated_at   TIMESTAMP NOT NULL,
            UNIQUE(user_id, pref_key)
        )
    """))
    db.commit()

@router.get("/{user_id}", summary="Get all preferences for user")
def get_preferences(user_id: str, db: Session = Depends(get_db)):
    """Returns all saved preferences for a user as a flat key-value map."""
    _ensure_prefs_table(db)
    try:
        rows = db.execute(text(
            "SELECT pref_key, pref_value FROM user_preferences WHERE user_id = :uid"
        ), {"uid": user_id}).fetchall()
        return {
            "user_id": user_id,
            "preferences": {row_to_dict(r)["pref_key"]: row_to_dict(r)["pref_value"]
                           for r in rows},
        }
    except Exception as e:
        return {"user_id": user_id, "preferences": {}, "error": str(e)}

@router.put("/{user_id}/{key}", summary="Set a user preference")
def set_preference(user_id: str, key: str, data: dict, db: Session = Depends(get_db)):
    """Set or update a single preference key."""
    _ensure_prefs_table(db)
    import json as _json
    value = data.get("value")
    if isinstance(value, (dict, list)):
        value = _json.dumps(value)
    elif value is not None:
        value = str(value)

    now = datetime.datetime.utcnow()
    db.execute(text("""
        INSERT INTO user_preferences (user_id, pref_key, pref_value, updated_at)
        VALUES (:uid, :key, :val, :now)
        ON CONFLICT (user_id, pref_key)
        DO UPDATE SET pref_value = :val, updated_at = :now
    """), {"uid": user_id, "key": key, "val": value, "now": now})
    db.commit()

    return {
        "success": True,
        "user_id": user_id,
        "key":     key,
        "value":   value,
        "saved_at": now.isoformat(),
    }

@router.post("/{user_id}/bulk", summary="Set multiple preferences at once")
def set_preferences_bulk(user_id: str, data: dict, db: Session = Depends(get_db)):
    """Save multiple preference key-value pairs in one call."""
    _ensure_prefs_table(db)
    import json as _json
    prefs = data.get("preferences", {})
    if not prefs:
        raise HTTPException(400, "preferences dict required")

    now = datetime.datetime.utcnow()
    saved = []
    for key, value in prefs.items():
        if isinstance(value, (dict, list)):
            value = _json.dumps(value)
        elif value is not None:
            value = str(value)
        db.execute(text("""
            INSERT INTO user_preferences (user_id, pref_key, pref_value, updated_at)
            VALUES (:uid, :key, :val, :now)
            ON CONFLICT (user_id, pref_key)
            DO UPDATE SET pref_value = :val, updated_at = :now
        """), {"uid": user_id, "key": key, "val": value, "now": now})
        saved.append(key)

    db.commit()
    return {
        "success": True,
        "user_id": user_id,
        "saved_keys": saved,
        "count": len(saved),
    }

@router.delete("/{user_id}/{key}", summary="Delete a user preference")
def delete_preference(user_id: str, key: str, db: Session = Depends(get_db)):
    """Remove a single preference key."""
    _ensure_prefs_table(db)
    db.execute(text(
        "DELETE FROM user_preferences WHERE user_id = :uid AND pref_key = :key"
    ), {"uid": user_id, "key": key})
    db.commit()
    return {"success": True, "user_id": user_id, "deleted_key": key}
