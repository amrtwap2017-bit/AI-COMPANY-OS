from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

from src.auth.models import User
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.payment_tracking.models import Payment
from src.commercial.payment_tracking.repository import PaymentRepository
from src.commercial.payment_tracking.schemas import PaymentCreate, PaymentUpdate, PaymentResponse

router = APIRouter()

@router.post('/', response_model=PaymentResponse, status_code=201)
def create_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id)
):
    payment_repo = PaymentRepository(db, hotel_id)
    payment = payment_repo.create_payment(payload)
    return payment

@router.get('/{payment_id}', response_model=PaymentResponse)
def get_payment(
    payment_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id)
):
    payment_repo = PaymentRepository(db, hotel_id)
    payment = payment_repo.get_payment(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail='Payment not found')
    return payment

@router.put('/{payment_id}', response_model=PaymentResponse)
def update_payment(
    payment_id: str,
    payload: PaymentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id)
):
    payment_repo = PaymentRepository(db, hotel_id)
    payment = payment_repo.update_payment(payment_id, payload)
    if not payment:
        raise HTTPException(status_code=404, detail='Payment not found')
    return payment
