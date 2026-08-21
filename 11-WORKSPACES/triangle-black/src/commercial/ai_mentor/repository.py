"""
Repository for AI Mentor Domain
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
import uuid
from datetime import datetime

class AIMentorRepository:
    def __init__(self, db: Session):
        self.db = db

    def record_decision(self, hotel_id: str, context_type: str, decision: str, metadata: Dict[str, Any]) -> str:
        dec_id = str(uuid.uuid4())
        try:
            self.db.execute(text("""
                INSERT INTO ai_mentor_decisions (id, hotel_id, context_type, decision, created_at)
                VALUES (:id, :hid, :ct, :dec, :now)
            """), {"id": dec_id, "hid": hotel_id, "ct": context_type, "dec": decision, "now": datetime.utcnow()})
            self.db.commit()
        except Exception:
            self.db.rollback()
        return dec_id
