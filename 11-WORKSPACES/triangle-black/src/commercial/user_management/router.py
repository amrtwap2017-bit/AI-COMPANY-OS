"""
User Invitation Router — V15 P0
Endpoints for multi-user onboarding without developer DB intervention.

LESSON LEARNED: ALWAYS import get_current_user before using it.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user  # ALWAYS import — lesson learned

router = APIRouter(prefix="/users", tags=["user_management"])


@router.post("/invite", summary="Invite a new user to this hotel")
def invite_user(
    payload: dict,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Send an invitation to a new user.
    Requires: manager or admin role.
    Returns: invitation token + accept URL (copy and share with the invitee).
    """
    from src.commercial.user_management.service import UserInvitationService

    email = payload.get("email", "").strip().lower()
    if not email or "@" not in email:
        raise HTTPException(422, "Valid email required")

    role = payload.get("role", "engineer")
    name = payload.get("name")
    created_by = getattr(current_user, "email", str(current_user))

    svc = UserInvitationService(db=db, hotel_id=hotel_id)
    result = svc.send_invitation(
        email=email, role=role, name=name, created_by=created_by
    )

    if not result.get("success"):
        raise HTTPException(400, result.get("error", "Invitation failed"))

    return result


@router.get("/invite/{token}/validate", summary="Validate invitation token")
def validate_invitation(
    token: str,
    db: Session = Depends(get_db),
):
    """
    Public endpoint — no auth needed.
    Called when invitee clicks the accept link to verify token is valid.
    """
    # Use any hotel_id since token is globally unique
    from src.commercial.user_management.service import UserInvitationService
    svc = UserInvitationService(db=db, hotel_id="")
    return svc.validate_token(token)


@router.post("/invite/{token}/accept", summary="Accept invitation and create account")
def accept_invitation(
    token: str,
    payload: dict,
    db: Session = Depends(get_db),
):
    """
    Public endpoint — no auth needed (this IS the auth step).
    Invitee sets their password and creates their account.
    Returns: access_token for immediate login.
    """
    password = payload.get("password", "")
    if not password or len(password) < 8:
        raise HTTPException(422, "Password must be at least 8 characters")

    name = payload.get("name")
    from src.commercial.user_management.service import UserInvitationService
    svc = UserInvitationService(db=db, hotel_id="")
    result = svc.accept_invitation(token=token, password=password, name=name)

    if not result.get("success"):
        raise HTTPException(400, result.get("error", "Could not accept invitation"))

    return result


@router.get("/invitations", summary="List invitations for this hotel")
def list_invitations(
    include_expired: bool = False,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """List all invitations for the hotel (pending + accepted)."""
    from src.commercial.user_management.service import UserInvitationService
    svc = UserInvitationService(db=db, hotel_id=hotel_id)
    invitations = svc.list_invitations(include_expired=include_expired)
    return {
        "hotel_id": hotel_id,
        "count": len(invitations),
        "invitations": invitations,
    }
