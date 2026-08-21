"""
Schemas for Customer 360 Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class CustomerLeadSummary(BaseModel):
    id: str
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None

class Customer360Profile(BaseModel):
    customer_id: str
    company_name: str
    lead: Optional[Dict[str, Any]] = None
    contracts: List[Dict[str, Any]] = []
    work_orders: List[Dict[str, Any]] = []
    invoices: List[Dict[str, Any]] = []
    total_contract_value: float = 0.0
    outstanding_invoice_amount: float = 0.0
    health_score: float = 85.0
    generated_at: datetime = Field(default_factory=datetime.utcnow)
