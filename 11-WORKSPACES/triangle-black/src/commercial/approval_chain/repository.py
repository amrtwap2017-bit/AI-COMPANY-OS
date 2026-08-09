"""approval_chain/repository.py — Sprint-083"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
import uuid
from datetime import datetime

def get_chain(db: Session, pr_id: str) -> List[dict]:
    rows = db.execute(text("""
        SELECT * FROM pr_approval_chain WHERE pr_id = :pr_id
        ORDER BY created_at ASC
    """), {"pr_id": pr_id}).fetchall()
    return [dict(r._mapping) for r in rows]

def add_step(db: Session, pr_id: str, hotel_id: Optional[str],
             approver_id: Optional[str], approver_name: Optional[str],
             action: str = "pending", notes: Optional[str] = None) -> str:
    aid = str(uuid.uuid4())
    now = datetime.utcnow()
    db.execute(text("""
        INSERT INTO pr_approval_chain
        (id, pr_id, hotel_id, approver_id, approver_name, action, notes, created_at)
        VALUES (:id, :pr_id, :hotel_id, :approver_id, :approver_name, :action, :notes, :now)
    """), {"id": aid, "pr_id": pr_id, "hotel_id": hotel_id,
           "approver_id": approver_id, "approver_name": approver_name,
           "action": action, "notes": notes, "now": now})
    db.commit()
    return aid

def update_step(db: Session, step_id: str, action: str,
                notes: Optional[str] = None) -> bool:
    now = datetime.utcnow()
    result = db.execute(text("""
        UPDATE pr_approval_chain SET action = :action,
        notes = :notes, actioned_at = :now
        WHERE id = :id
    """), {"action": action, "notes": notes, "now": now, "id": step_id})
    db.commit()
    return result.rowcount > 0
