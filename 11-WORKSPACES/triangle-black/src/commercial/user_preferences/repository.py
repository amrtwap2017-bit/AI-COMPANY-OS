"""user_preferences/repository.py — Sprint-082"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, Dict, Any
from datetime import datetime

def get_all(db: Session, user_id: str) -> Dict[str, Any]:
    rows = db.execute(text(
        "SELECT pref_key, pref_value FROM user_preferences WHERE user_id = :uid"
    ), {"uid": user_id}).fetchall()
    return {r.pref_key: r.pref_value for r in rows}

def set_preference(db: Session, user_id: str, pref_key: str, pref_value: str) -> bool:
    now = datetime.utcnow()
    db.execute(text("""
        INSERT INTO user_preferences (user_id, pref_key, pref_value, updated_at)
        VALUES (:uid, :key, :val, :now)
        ON CONFLICT (user_id, pref_key) DO UPDATE
        SET pref_value = EXCLUDED.pref_value, updated_at = EXCLUDED.updated_at
    """), {"uid": user_id, "key": pref_key, "val": str(pref_value), "now": now})
    db.commit()
    return True

def delete_preference(db: Session, user_id: str, pref_key: str) -> bool:
    result = db.execute(text(
        "DELETE FROM user_preferences WHERE user_id = :uid AND pref_key = :key"
    ), {"uid": user_id, "key": pref_key})
    db.commit()
    return result.rowcount > 0
