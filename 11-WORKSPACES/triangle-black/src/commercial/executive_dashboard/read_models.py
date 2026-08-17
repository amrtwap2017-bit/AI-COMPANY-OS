"""
Executive Dashboard Read Models — T-007
Governed KPI projections for executive views.
Dashboard endpoints delegate here instead of querying OLTP directly.
Integrates event outbox stats for platform health visibility.
"""
from __future__ import annotations
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text


class ExecutiveReadModel:
    """
    Computes executive KPIs from domain tables.
    Single entry point for all executive dashboard data.
    All queries are hotel-scoped and read-only.
    """

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def get_full_dashboard(self) -> Dict[str, Any]:
        """Complete executive dashboard — single call."""
        return {
            "hotel_id": self.hotel_id,
            "work_orders": self._work_order_kpis(),
            "service_requests": self._service_request_kpis(),
            "invoices": self._invoice_kpis(),
            "purchase_orders": self._purchase_order_kpis(),
            "projects": self._project_kpis(),
            "sla": self._sla_kpis(),
            "events": self._event_outbox_stats(),
        }

    def _work_order_kpis(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status='open' THEN 1 ELSE 0 END) AS open,
                    SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) AS in_progress,
                    SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed,
                    SUM(CASE WHEN status='closed' THEN 1 ELSE 0 END) AS closed
                FROM work_orders
                WHERE hotel_id = :hid AND deleted_at IS NULL
            """), {"hid": self.hotel_id}).fetchone()
            return self._row_to_ints(row) if row else {}
        except Exception:
            return {}

    def _service_request_kpis(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status='open' THEN 1 ELSE 0 END) AS open,
                    SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) AS in_progress,
                    SUM(CASE WHEN status='resolved' THEN 1 ELSE 0 END) AS resolved
                FROM service_requests
                WHERE hotel_id = :hid
            """), {"hid": self.hotel_id}).fetchone()
            return self._row_to_ints(row) if row else {}
        except Exception:
            return {}

    def _invoice_kpis(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status='draft' THEN 1 ELSE 0 END) AS draft,
                    SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END) AS paid,
                    COALESCE(SUM(total_amount), 0) AS total_amount
                FROM invoices
                WHERE hotel_id = :hid AND deleted_at IS NULL
            """), {"hid": self.hotel_id}).fetchone()
            d = self._row_to_ints(row) if row else {}
            if "total_amount" in d:
                d["total_amount"] = float(d.get("total_amount") or 0)
            return d
        except Exception:
            return {}

    def _purchase_order_kpis(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS approved,
                    SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending
                FROM purchase_orders
                WHERE hotel_id = :hid
            """), {"hid": self.hotel_id}).fetchone()
            return self._row_to_ints(row) if row else {}
        except Exception:
            return {}

    def _project_kpis(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active,
                    SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed
                FROM projects
                WHERE hotel_id = :hid
            """), {"hid": self.hotel_id}).fetchone()
            return self._row_to_ints(row) if row else {}
        except Exception:
            return {}

    def _sla_kpis(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN sla_status='met' THEN 1 ELSE 0 END) AS met,
                    SUM(CASE WHEN sla_status='breached' THEN 1 ELSE 0 END) AS breached,
                    SUM(CASE WHEN sla_status='on_track' THEN 1 ELSE 0 END) AS on_track
                FROM work_orders
                WHERE hotel_id = :hid AND deleted_at IS NULL
            """), {"hid": self.hotel_id}).fetchone()
            d = self._row_to_ints(row) if row else {}
            total = d.get("total", 0)
            met = d.get("met", 0)
            d["compliance_pct"] = round(100.0 * met / total, 1) if total else 0.0
            return d
        except Exception:
            return {}

    def _event_outbox_stats(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending,
                    SUM(CASE WHEN status='dispatched' THEN 1 ELSE 0 END) AS dispatched,
                    SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS failed
                FROM platform_events
                WHERE hotel_id = :hid
            """), {"hid": self.hotel_id}).fetchone()
            return self._row_to_ints(row) if row else {}
        except Exception:
            return {}

    @staticmethod
    def _row_to_ints(row) -> Dict[str, Any]:
        d = dict(row._mapping) if row else {}
        return {k: int(v) if v is not None and isinstance(v, (int, float))
                and k != "total_amount" and k != "compliance_pct"
                else v for k, v in d.items()}
