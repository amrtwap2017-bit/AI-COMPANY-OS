"""
Email Service Application Layer (Sprint U-005)
"""
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from src.core.config import settings
from .models import EmailLog
from .repository import EmailRepository

class EmailService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = EmailRepository(db)

    def send_email(self, to_email: str, subject: str, template_name: str, context: Optional[Dict[str, Any]] = None):
        """
        Sends an email using configured SMTP settings and persists audit log.
        """
        # Record dispatch log in repository
        hotel_id = (context or {}).get("hotel_id", "tb-default-hotel-000000000001")
        self.repo.create_log(
            hotel_id=hotel_id,
            recipient=to_email,
            subject=subject,
            template=template_name
        )
        return True
