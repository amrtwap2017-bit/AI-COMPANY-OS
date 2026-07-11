from sqlalchemy.orm import Session
from domain.models.invoice import Invoice

class InvoiceRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_invoice(self, invoice_id: int) -> Invoice:
        return self.session.query(Invoice).filter(Invoice.id == invoice_id).first()

    def update_invoice(self, invoice_id: int, pdf_path: str) -> None:
        invoice = self.get_invoice(invoice_id)
        if invoice:
            invoice.pdf_path = pdf_path
            self.session.commit()