"""
Repository for Customer 360 Domain
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

class Customer360Repository:
    def __init__(self, db: Session):
        self.db = db

    def find_lead(self, customer_id: str, hotel_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        sql = "SELECT * FROM leads WHERE (id=:id OR company_name ILIKE :name)"
        params: Dict[str, Any] = {"id": customer_id, "name": f"%{customer_id}%"}
        if hotel_id:
            sql += " AND hotel_id = :hid"
            params["hid"] = hotel_id
        sql += " LIMIT 1"
        row = self.db.execute(text(sql), params).fetchone()
        return dict(row._mapping) if row else None

    def find_contracts(self, company_name: str, lead_id: str, hotel_id: Optional[str] = None) -> List[Dict[str, Any]]:
        sql = "SELECT * FROM contracts WHERE (client_name ILIKE :c OR lead_id=:lid)"
        params: Dict[str, Any] = {"c": f"%{company_name}%", "lid": lead_id}
        if hotel_id:
            sql += " AND hotel_id = :hid"
            params["hid"] = hotel_id
        sql += " ORDER BY created_at DESC"
        rows = self.db.execute(text(sql), params).fetchall()
        return [dict(r._mapping) for r in rows]

    def find_invoices(self, contract_ids: List[str]) -> List[Dict[str, Any]]:
        if not contract_ids:
            return []
        placeholders = ",".join([f"'{cid}'" for cid in contract_ids[:20]])
        rows = self.db.execute(text(f"""
            SELECT * FROM invoices
            WHERE contract_id IN ({placeholders})
            ORDER BY created_at DESC
        """)).fetchall()
        return [dict(r._mapping) for r in rows]

    def find_work_orders(self, contract_ids: List[str]) -> List[Dict[str, Any]]:
        if not contract_ids:
            return []
        placeholders = ",".join([f"'{cid}'" for cid in contract_ids[:20]])
        rows = self.db.execute(text(f"""
            SELECT * FROM work_orders
            WHERE contract_id IN ({placeholders})
            ORDER BY created_at DESC
            LIMIT 25
        """)).fetchall()
        return [dict(r._mapping) for r in rows]
