"""
T-007: Executive Intelligence Read Models
Governed read models for executive dashboard — no direct OLTP queries in router.
Each read model aggregates from domain tables into a structured KPI object.
"""
from typing import Dict, Any, Optional
from datetime import datetime, timedelta


class ExecutiveKPIReadModel:
    """
    Aggregates all executive KPIs from domain tables.
    Called by executive dashboard router.
    Returns structured data — never raw OLTP rows.
    """

    def __init__(self, db, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def get_operations_kpi(self) -> Dict[str, Any]:
        """Work orders, service requests, SLA compliance."""
        from sqlalchemy import text as _text
        try:
            row = self.db.execute(_text("""
                SELECT
                    COUNT(*) FILTER (WHERE status NOT IN ('completed','closed','cancelled'))
                        AS open_work_orders,
                    COUNT(*) FILTER (WHERE status IN ('completed','closed'))
                        AS completed_work_orders,
                    COUNT(*) FILTER (WHERE sla_breached = TRUE)
                        AS sla_breached_count,
                    COUNT(*) FILTER (WHERE priority = 'critical'
                        AND status NOT IN ('completed','closed','cancelled'))
                        AS critical_open,
                    ROUND(
                        100.0 * COUNT(*) FILTER (WHERE sla_status = 'met')
                        / NULLIF(COUNT(*) FILTER (WHERE status IN ('completed','closed')), 0)
                    , 1) AS sla_compliance_pct,
                    COUNT(*) FILTER (WHERE type = 'corrective') AS corrective_count,
                    COUNT(*) FILTER (WHERE type = 'preventive') AS preventive_count,
                    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600)
                        FILTER (WHERE status = 'completed') AS avg_resolution_hours
                FROM work_orders
                WHERE hotel_id = :hid
                AND (deleted_at IS NULL OR deleted_at > NOW())
            """), {"hid": self.hotel_id}).fetchone()
            d = dict(row._mapping) if row else {}
            d["hotel_id"] = self.hotel_id
            d["generated_at"] = datetime.utcnow().isoformat()
            return d
        except Exception as e:
            return {"hotel_id": self.hotel_id, "error": str(e), "open_work_orders": 0}

    def get_maintenance_kpi(self) -> Dict[str, Any]:
        """Asset health, PM compliance, reliability metrics."""
        from sqlalchemy import text as _text
        try:
            row = self.db.execute(_text("""
                SELECT
                    COUNT(*) AS total_assets,
                    COUNT(*) FILTER (WHERE status = 'active') AS active_assets,
                    COUNT(*) FILTER (WHERE status = 'fault') AS fault_assets,
                    COUNT(*) FILTER (WHERE status = 'maintenance') AS in_maintenance,
                    COUNT(*) FILTER (WHERE criticality IN ('critical','high')) AS critical_assets
                FROM assets
                WHERE hotel_id = :hid
            """), {"hid": self.hotel_id}).fetchone()

            pm_row = self.db.execute(_text("""
                SELECT
                    COUNT(*) AS total_pm_plans,
                    COUNT(*) FILTER (WHERE status = 'active') AS active_pm_plans,
                    COUNT(*) FILTER (WHERE next_due_date < NOW()
                        AND status = 'active') AS overdue_pm_plans
                FROM pm_plans
                WHERE hotel_id = :hid
            """), {"hid": self.hotel_id}).fetchone()

            assets = dict(row._mapping) if row else {}
            pm = dict(pm_row._mapping) if pm_row else {}

            return {
                "hotel_id": self.hotel_id,
                "assets": assets,
                "pm_plans": pm,
                "pm_compliance_pct": round(
                    100.0 * (1 - (pm.get("overdue_pm_plans", 0) or 0) /
                    max(pm.get("total_pm_plans", 1) or 1, 1)), 1
                ),
                "generated_at": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            return {"hotel_id": self.hotel_id, "error": str(e)}

    def get_procurement_kpi(self) -> Dict[str, Any]:
        """Purchase orders, supplier performance, spend analysis."""
        from sqlalchemy import text as _text
        try:
            po_row = self.db.execute(_text("""
                SELECT
                    COUNT(*) AS total_pos,
                    COUNT(*) FILTER (WHERE status = 'pending') AS pending_pos,
                    COUNT(*) FILTER (WHERE status = 'approved') AS approved_pos,
                    COALESCE(SUM(total_amount) FILTER (
                        WHERE status = 'approved'
                        AND created_at >= NOW() - INTERVAL '30 days'
                    ), 0) AS spend_30d,
                    COALESCE(SUM(total_amount) FILTER (
                        WHERE status = 'approved'
                        AND created_at >= NOW() - INTERVAL '365 days'
                    ), 0) AS spend_ytd
                FROM purchase_orders
                WHERE hotel_id = :hid
            """), {"hid": self.hotel_id}).fetchone()

            pr_row = self.db.execute(_text("""
                SELECT COUNT(*) AS open_prs
                FROM purchase_requests
                WHERE hotel_id = :hid
                AND status IN ('pending', 'submitted')
            """), {"hid": self.hotel_id}).fetchone()

            return {
                "hotel_id": self.hotel_id,
                "purchase_orders": dict(po_row._mapping) if po_row else {},
                "open_purchase_requests": (pr_row[0] if pr_row else 0),
                "generated_at": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            return {"hotel_id": self.hotel_id, "error": str(e)}

    def get_financial_kpi(self) -> Dict[str, Any]:
        """Invoice status, AR/AP, revenue tracking."""
        from sqlalchemy import text as _text
        try:
            inv_row = self.db.execute(_text("""
                SELECT
                    COUNT(*) AS total_invoices,
                    COUNT(*) FILTER (WHERE status = 'pending') AS pending_invoices,
                    COUNT(*) FILTER (WHERE status = 'paid') AS paid_invoices,
                    COUNT(*) FILTER (WHERE status = 'overdue') AS overdue_invoices,
                    COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) AS pending_amount,
                    COALESCE(SUM(amount) FILTER (WHERE status = 'paid'
                        AND created_at >= NOW() - INTERVAL '30 days'), 0) AS collected_30d
                FROM invoices
                WHERE hotel_id = :hid
                AND (deleted_at IS NULL OR deleted_at > NOW())
            """), {"hid": self.hotel_id}).fetchone()

            return {
                "hotel_id": self.hotel_id,
                "invoices": dict(inv_row._mapping) if inv_row else {},
                "generated_at": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            return {"hotel_id": self.hotel_id, "error": str(e)}

    def get_full_summary(self) -> Dict[str, Any]:
        """
        Complete executive summary — all KPIs in one call.
        This is what the executive dashboard loads.
        """
        return {
            "hotel_id": self.hotel_id,
            "generated_at": datetime.utcnow().isoformat(),
            "operations": self.get_operations_kpi(),
            "maintenance": self.get_maintenance_kpi(),
            "procurement": self.get_procurement_kpi(),
            "financial": self.get_financial_kpi(),
        }
