"""
Service for Customer 360 Domain
"""
from typing import Dict, Any
from sqlalchemy.orm import Session
from src.commercial.customer360.repository import Customer360Repository

class Customer360Service:
    def __init__(self, db: Session):
        self.repo = Customer360Repository(db)

    def get_profile(self, customer_id: str, hotel_id: str | None = None) -> Dict[str, Any]:
        lead = self.repo.find_lead(customer_id, hotel_id)
        company = lead.get("company_name", customer_id) if lead else customer_id
        lead_id = lead.get("id", customer_id) if lead else customer_id

        contracts = self.repo.find_contracts(company, lead_id, hotel_id)
        contract_ids = [c["id"] for c in contracts if c.get("id")]

        invoices = self.repo.find_invoices(contract_ids)
        work_orders = self.repo.find_work_orders(contract_ids)

        total_value = sum(float(c.get("total_value") or 0.0) for c in contracts)
        outstanding = sum(float(i.get("amount") or 0.0) for i in invoices if i.get("status") in ("unpaid", "pending", "overdue"))

        return {
            "customer_id": customer_id,
            "company_name": company,
            "lead": lead,
            "contracts": contracts,
            "work_orders": work_orders,
            "invoices": invoices,
            "total_contract_value": round(total_value, 2),
            "outstanding_invoice_amount": round(outstanding, 2),
            "health_score": 90.0 if not any(i.get("status") == "overdue" for i in invoices) else 65.0
        }
