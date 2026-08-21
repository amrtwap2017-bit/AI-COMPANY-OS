"""
Service for AI Mentor Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from src.commercial.ai_mentor.repository import AIMentorRepository

class AIMentorService:
    def __init__(self, db: Session):
        self.repo = AIMentorRepository(db)

    def get_guidance(self, context_type: str, hotel_id: str) -> Dict[str, Any]:
        guidance_map = {
            "procurement": "Always bundle spare parts orders quarterly to obtain minimum 15% discount.",
            "maintenance": "Prioritize chillers and emergency power equipment before seasonal peaks.",
            "inventory": "Maintain minimum 30-day safety buffer for critical electrical breakers."
        }
        rec = guidance_map.get(context_type.lower(), "Ensure standard verification checklists are completed.")
        return {
            "context_type": context_type,
            "hotel_id": hotel_id,
            "recommendation": rec,
            "confidence_score": 0.92,
            "best_practices": [
                "Verify supplier ISO accreditation",
                "Ensure double approval on transactions > 10,000 EGP",
                "Audit work order completion times against SLA"
            ]
        }
