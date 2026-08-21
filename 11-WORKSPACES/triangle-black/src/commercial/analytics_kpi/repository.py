"""
Repository for Analytics KPI Domain
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

class AnalyticsKPIRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_kpis_aggregation(self, hotel_id: str) -> Dict[str, Any]:
        h = {"hotel_id": hotel_id}
        total_leads = self.db.execute(text("SELECT COUNT(*) FROM leads WHERE hotel_id=:hotel_id AND (deleted_at IS NULL OR deleted_at > NOW())"), h).scalar() or 0
        won_leads = self.db.execute(text("SELECT COUNT(*) FROM leads WHERE hotel_id=:hotel_id AND status='won' AND (deleted_at IS NULL OR deleted_at > NOW())"), h).scalar() or 0
        total_wos = self.db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id AND (deleted_at IS NULL OR deleted_at > NOW())"), h).scalar() or 0
        completed_wos = self.db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id AND status='completed' AND (deleted_at IS NULL OR deleted_at > NOW())"), h).scalar() or 0
        active_contracts = self.db.execute(text("SELECT COUNT(*) FROM contracts WHERE hotel_id=:hotel_id AND status='active' AND (deleted_at IS NULL OR deleted_at > NOW())"), h).scalar() or 0
        total_inv_value = self.db.execute(text("SELECT COALESCE(SUM(total_amount),0) FROM invoices WHERE hotel_id=:hotel_id AND status='paid' AND (deleted_at IS NULL OR deleted_at > NOW())"), h).scalar() or 0
        active_techs = self.db.execute(text("SELECT COUNT(*) FROM technicians WHERE hotel_id=:hotel_id AND is_active=true"), h).scalar() or 0

        conv_rate = round((won_leads / total_leads * 100.0), 1) if total_leads > 0 else 0.0
        comp_rate = round((completed_wos / total_wos * 100.0), 1) if total_wos > 0 else 0.0

        return {
            "hotel_id": hotel_id,
            "total_leads": total_leads,
            "won_leads": won_leads,
            "total_work_orders": total_wos,
            "completed_work_orders": completed_wos,
            "active_contracts": active_contracts,
            "paid_invoices_value": float(total_inv_value),
            "active_technicians": active_techs,
            "conversion_rate": conv_rate,
            "completion_rate": comp_rate
        }

    def get_cashflow_projections(self, hotel_id: str) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT 
                TO_CHAR(issue_date, 'YYYY-MM') AS month,
                COALESCE(SUM(CASE WHEN status='paid' THEN total_amount ELSE 0 END), 0) AS inflow,
                COALESCE(SUM(CASE WHEN status='overdue' THEN total_amount ELSE 0 END), 0) AS outflow
            FROM invoices
            WHERE hotel_id = :hid
            AND (deleted_at IS NULL OR deleted_at > NOW())
            GROUP BY TO_CHAR(issue_date, 'YYYY-MM')
            ORDER BY month DESC
            LIMIT 12
        """), {"hid": hotel_id}).fetchall()
        
        return [dict(r._mapping) for r in rows]
