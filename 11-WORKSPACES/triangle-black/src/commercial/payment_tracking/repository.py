from sqlalchemy.orm import Session
from src.core.database import get_db
from src.commercial.payment_tracking.models import Payment
from src.core.tenant import get_hotel_id

class PaymentRepository:
    def __init__(self, db: Session = Depends(get_db), hotel_id: str = Depends(get_hotel_id)):
        self.db = db
        self.hotel_id = hotel_id

    def create_payment(self, payload: PaymentCreate):
        payment = Payment(**payload.dict(), hotel_id=self.hotel_id)
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment

    def get_payments_by_invoice(self, invoice_id: str):
        return self.db.query(Payment).filter(Payment.invoice_id == invoice_id, Payment.hotel_id == self.hotel_id).all()

    def update_payment(self, payment_id: str, payload: PaymentUpdate):
        payment = self.db.query(Payment).filter(Payment.id == payment_id, Payment.hotel_id == self.hotel_id).first()
        if not payment:
            return None
        for key, value in payload.dict(exclude_unset=True).items():
            setattr(payment, key, value)
        self.db.commit()
        self.db.refresh(payment)
        return payment