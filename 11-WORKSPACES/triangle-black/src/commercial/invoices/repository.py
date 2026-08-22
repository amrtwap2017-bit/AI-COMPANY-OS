"""
Invoice Repository — Triangle Black Enterprise OS
Standard DDD Repository Pattern with strict hotel_id tenant scoping.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.commercial.invoices.models import Invoice

class InvoiceRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_invoices(
        self,
        hotel_id: str,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Invoice]:
        query = self.db.query(Invoice).filter(
            Invoice.hotel_id == hotel_id,
            Invoice.deleted_at.is_(None) if hasattr(Invoice, "deleted_at") else True
        )
        if status:
            query = query.filter(Invoice.status == status)
        return query.order_by(Invoice.created_at.desc()).offset(offset).limit(limit).all()

    def get_by_id(self, invoice_id: str, hotel_id: str) -> Optional[Invoice]:
        return self.db.query(Invoice).filter(
            Invoice.id == invoice_id,
            Invoice.hotel_id == hotel_id,
            Invoice.deleted_at.is_(None) if hasattr(Invoice, "deleted_at") else True
        ).first()

    def create(self, hotel_id: str, data: Dict[str, Any]) -> Invoice:
        data["hotel_id"] = hotel_id
        invoice = Invoice(**data)
        self.db.add(invoice)
        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    def update_payment_status(self, invoice_id: str, hotel_id: str, status: str) -> Optional[Invoice]:
        invoice = self.get_by_id(invoice_id, hotel_id)
        if not invoice:
            return None
        invoice.status = status
        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    def get_financial_summary(self, hotel_id: str) -> Dict[str, Any]:
        base = self.db.query(Invoice).filter(
            Invoice.hotel_id == hotel_id,
            Invoice.deleted_at.is_(None) if hasattr(Invoice, "deleted_at") else True
        )
        total_count = base.count()
        paid_count = base.filter(Invoice.status == "paid").count()
        unpaid_count = base.filter(Invoice.status.in_(["pending", "sent", "overdue"])).count()
        
        total_amt = self.db.query(func.coalesce(func.sum(Invoice.amount), 0.0)).filter(
            Invoice.hotel_id == hotel_id,
            Invoice.deleted_at.is_(None) if hasattr(Invoice, "deleted_at") else True
        ).scalar() or 0.0

        paid_amt = self.db.query(func.coalesce(func.sum(Invoice.amount), 0.0)).filter(
            Invoice.hotel_id == hotel_id,
            Invoice.status == "paid",
            Invoice.deleted_at.is_(None) if hasattr(Invoice, "deleted_at") else True
        ).scalar() or 0.0

        return {
            "total_invoices": total_count,
            "paid_invoices": paid_count,
            "unpaid_invoices": unpaid_count,
            "total_amount": float(total_amt),
            "paid_amount": float(paid_amt)
        }
