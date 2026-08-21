"""
Repository for Executive Intelligence Domain
"""
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text

class ExecutiveIntelligenceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_operations_snapshot(self, hotel_id: str) -> Dict[str, Any]:
        h = {"hid": hotel_id}
        open_wos = self.db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND status NOT IN ('completed','closed','cancelled') AND (deleted_at IS NULL OR deleted_at > NOW())"), h).scalar() or 0
        critical_wos = self.db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND priority='critical' AND status NOT IN ('completed','closed') AND (deleted_at IS NULL OR deleted_at > NOW())"), h).scalar() or 0
        return {"open_work_orders": int(open_wos), "critical_open": int(critical_wos)}

    def get_financial_snapshot(self, hotel_id: str) -> Dict[str, Any]:
        h = {"hid": hotel_id}
        unpaid = self.db.execute(text("SELECT COALESCE(SUM(total_amount),0) FROM invoices WHERE hotel_id=:hid AND status IN ('unpaid','pending','overdue') AND (deleted_at IS NULL OR deleted_at > NOW())"), h).scalar() or 0.0
        return {"outstanding_receivables": float(unpaid)}
