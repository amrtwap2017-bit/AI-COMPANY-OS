from pydantic import BaseModel

class InvoiceSchema(BaseModel):
    invoice_number: str
    hotel_name: str
    hotel_address: str
    line_items: str
    subtotal: float
    vat: float
    total: float
    pdf_path: str
