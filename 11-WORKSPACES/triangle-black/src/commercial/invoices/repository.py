from sqlalchemy.orm import Session
from src.core.database import get_db
from src.commercial.invoices.models import Invoice

class InvoiceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_invoice(self, invoice_data: dict):
        invoice = Invoice(**invoice_data)
        self.db.add(invoice)
        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    def get_invoice(self, invoice_id: str):
        return self.db.query(Invoice).filter(Invoice.id == invoice_id).first()

    def list_invoices(self, hotel_id: str = None):
        query = self.db.query(Invoice)
        if hotel_id:
            query = query.filter(Invoice.hotel_id == hotel_id)
        return query.all()

    def update_invoice(self, invoice_id: str, invoice_data: dict):
        invoice = self.db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            return None
        for key, value in invoice_data.items():
            setattr(invoice, key, value)
        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    def delete_invoice(self, invoice_id: str):
        invoice = self.db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            return None
        self.db.delete(invoice)
        self.db.commit()