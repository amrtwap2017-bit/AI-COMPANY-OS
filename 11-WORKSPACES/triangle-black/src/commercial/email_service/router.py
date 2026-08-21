"""
Email Service Router with Tenant & Auth Governance (Sprint U-005)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user, require_manager
from src.commercial.auth.models import User
from .service import EmailService
from .schemas import EmailSendRequest
from .models import EmailLog
from .repository import EmailRepository

router = APIRouter(prefix="/api/v1/email", tags=["email-service"])

@router.post("/send", response_model=EmailSendRequest, status_code=201)
def send_email(
    request: EmailSendRequest,
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id),
    current_user: User = Depends(get_current_user)
):
    """
    Protected email dispatch endpoint requiring authenticated user.
    """
    svc = EmailService(db)
    svc.send_email(
        to_email=request.to_email,
        subject=request.subject,
        template_name=request.template_name,
        context={**(request.context or {}), "hotel_id": hotel_id, "sender": current_user.email}
    )
    return request

@router.get("/logs")
def get_email_logs(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id),
    current_user: User = Depends(require_manager)
):
    """
    Audit endpoint to list email dispatch logs scoped to tenant.
    """
    repo = EmailRepository(db)
    logs = repo.get_logs(hotel_id) if hasattr(repo, "get_logs") else db.query(EmailLog).filter(EmailLog.hotel_id == hotel_id).all()
    return logs
