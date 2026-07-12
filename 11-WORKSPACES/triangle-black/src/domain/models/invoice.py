from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Invoice(Base):
    __tablename__ = 'invoices'
    id = Column(Integer, primary_key=True)
    invoice_number = Column(String)
    hotel_name = Column(String)
    hotel_address = Column(String)
    line_items = Column(String)
    subtotal = Column(Float)
    vat = Column(Float)
    total = Column(Float)
    pdf_path = Column(String)
