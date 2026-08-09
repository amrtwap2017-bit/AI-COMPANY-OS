"""procurement_intake/repository.py — Sprint-082"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
import uuid
from datetime import datetime

def get_logs(db: Session, hotel_id: str, limit: int = 50) -> List[dict]:
    rows = db.execute(text("""
        SELECT * FROM procurement_intake_log
        WHERE hotel_id = :hotel_id
        ORDER BY created_at DESC LIMIT :limit
    """), {"hotel_id": hotel_id, "limit": limit}).fetchall()
    return [dict(r._mapping) for r in rows]

def log_action(db: Session, hotel_id: str, action: str,
               entity_type: Optional[str] = None,
               entity_id: Optional[str] = None,
               details: Optional[str] = None,
               actor_id: Optional[str] = None) -> str:
    lid = str(uuid.uuid4())
    db.execute(text("""
        INSERT INTO procurement_intake_log
        (id, hotel_id, action, entity_type, entity_id, details, actor_id, created_at)
        VALUES (:id, :hotel_id, :action, :entity_type, :entity_id, :details, :actor_id, :now)
    """), {"id": lid, "hotel_id": hotel_id, "action": action,
           "entity_type": entity_type, "entity_id": entity_id,
           "details": details, "actor_id": actor_id,
           "now": datetime.utcnow()})
    db.commit()
    return lid
