from sqlalchemy.orm import Session

class PaymentRepository:
    def __init__(self, db: Session):
        self.db = db

    # Add your methods here (example)
    def get_payments(self, hotel_id: str):
        # TODO: implement
        return []
