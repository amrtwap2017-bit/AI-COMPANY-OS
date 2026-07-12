from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from .service import EmailService
from .schemas import EmailSendRequest

router = APIRouter()

db: Session = Depends(get_db)
email_service = EmailService(db)

@router.post("/api/v1/email/send", response_model=EmailSendRequest, status_code=201)
def send_email(request: EmailSendRequest):
    email_service.send_email(
        to_email=request.to_email,
        subject=request.subject,
        template_name=request.template_name,
        context=request.context
    )
    return request

@router.get("/api/v1/email/logs", response_model=list[EmailLog])
def get_email_logs(db: Session = Depends(get_db)):
    db_repo = EmailRepository(db)
    logs = db_repo.db.query(EmailLog).all()
    return logs
