from domain.models.invoice import Invoice
from domain.schemas.invoice import InvoiceSchema
from infrastructure.repositories.invoice_repository import InvoiceRepository
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

class InvoiceService:
    def __init__(self, repository: InvoiceRepository):
        self.repository = repository

    def generate_pdf(self, invoice_id: int) -> str:
        invoice = self.repository.get_invoice(invoice_id)
        if not invoice:
            raise ValueError('Invoice not found')

        pdf_path = f'artifacts/invoices/{invoice.id}.pdf'
        c = canvas.Canvas(pdf_path, pagesize=letter)
        width, height = letter

        # Invoice header
        c.drawString(100, height - 50, 'Triangle Black Hotel Engineering')
        c.drawString(100, height - 70, f'Invoice Number: {invoice.invoice_number}')

        # Hotel info
        c.drawString(100, height - 90, f'Hotel Name: {invoice.hotel_name}')
        c.drawString(100, height - 110, f'Address: {invoice.hotel_address}')

        # Line items
        y = height - 130
        for item in invoice.line_items.split(', '):
            c.drawString(100, y, item)
            y -= 20

        # Totals
        c.drawString(100, y, f'Subtotal: {invoice.subtotal}')
        c.drawString(100, y - 20, f'VAT: {invoice.vat}')
        c.drawString(100, y - 40, f'Total: {invoice.total}')

        # Save PDF
        c.save()

        return pdf_path

    def update_invoice_pdf(self, invoice_id: int) -> None:
        pdf_path = self.generate_pdf(invoice_id)
        self.repository.update_invoice(invoice_id, pdf_path)