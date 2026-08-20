"""
Repository for Customer Success Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

class CustomerSuccessRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_account_overview(self, hotel_id: str) -> Dict[str, Any]:
        row = self.db.execute(text("""
            SELECT
                (SELECT COUNT(*) FROM contracts WHERE hotel_id = :hid AND status = 'active') AS active_contracts,
                (SELECT COUNT(*) FROM service_requests WHERE hotel_id = :hid AND status NOT IN ('closed', 'cancelled')) AS open_requests,
                (SELECT COUNT(*) FROM work_orders WHERE hotel_id = :hid AND status NOT IN ('completed', 'closed', 'cancelled')) AS open_work_orders,
                (SELECT COUNT(*) FROM leads WHERE hotel_id = :hid) AS total_leads
        """), {"hid": hotel_id}).fetchone()
        
        res = dict(row._mapping) if row else {}
        res["hotel_id"] = hotel_id
        return res

    def get_at_risk_contracts(self, hotel_id: str) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT id, title, status, end_date, total_value
            FROM contracts
            WHERE hotel_id = :hid
            AND status = 'active'
            AND end_date <= NOW() + INTERVAL '45 days'
            ORDER BY end_date ASC
            LIMIT 10
        """), {"hid": hotel_id}).fetchall()
        return [dict(r._mapping) for r in rows]
