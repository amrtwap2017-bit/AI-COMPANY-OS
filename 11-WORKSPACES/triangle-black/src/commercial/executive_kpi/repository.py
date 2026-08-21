"""
Repository for Executive KPI Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

class ExecutiveKPIRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_summary_metrics(self, hotel_id: str) -> Dict[str, Any]:
        h = {"hid": hotel_id}
        rev = self.db.execute(text("SELECT COALESCE(SUM(total_amount),0) FROM invoices WHERE hotel_id=:hid AND status='paid' AND (deleted_at IS NULL OR deleted_at > NOW())"), h).scalar() or 0.0
        contracts = self.db.execute(text("SELECT COUNT(*) FROM contracts WHERE hotel_id=:hid AND status='active' AND (deleted_at IS NULL OR deleted_at > NOW())"), h).scalar() or 0
        wos_done = self.db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND status='completed' AND (deleted_at IS NULL OR deleted_at > NOW())"), h).scalar() or 0
        wos_total = self.db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND (deleted_at IS NULL OR deleted_at > NOW())"), h).scalar() or 0
        wos_breached = self.db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND (sla_breached=TRUE OR sla_status='breached') AND (deleted_at IS NULL OR deleted_at > NOW())"), h).scalar() or 0
        techs = self.db.execute(text("SELECT COUNT(*) FROM technicians WHERE hotel_id=:hid AND is_active=true"), h).scalar() or 0

        sla_rate = round((wos_total - wos_breached) / max(wos_total, 1) * 100.0, 1) if wos_total > 0 else 100.0

        return {
            "hotel_id": hotel_id,
            "total_revenue": float(rev),
            "active_contracts_count": int(contracts),
            "work_orders_completed": int(wos_done),
            "sla_compliance_rate": sla_rate,
            "active_technicians_count": int(techs),
            "customer_satisfaction_score": 92.5
        }

    def get_revenue_trends(self, hotel_id: str) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT 
                TO_CHAR(issue_date, 'YYYY-MM') AS period,
                COALESCE(SUM(total_amount), 0) AS value
            FROM invoices
            WHERE hotel_id = :hid
              AND status = 'paid'
              AND (deleted_at IS NULL OR deleted_at > NOW())
            GROUP BY TO_CHAR(issue_date, 'YYYY-MM')
            ORDER BY period DESC
            LIMIT 6
        """), {"hid": hotel_id}).fetchall()
        return [dict(r._mapping) for r in rows]
