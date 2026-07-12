from sqlalchemy.orm import Session
from src.core.database import get_db
from .models import EmailLog

class EmailRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_log(self, to_email: str, subject: str, template_name: str, context: dict = None):
        log = EmailLog(to_email=to_email, subject=subject, template_name=template_name, context=context)
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log
