"""
Procurement Read Models — T-020
Governed KPI projections for procurement analytics.
No router should query procurement OLTP tables directly.
All procurement analytics flow through this layer.
"""
from __future__ import annotations
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text


class ProcurementReadModel:
    """
    Computes procurement KPIs from domain tables.
    Hotel-scoped. Read-only. Non-blocking on failure.
    """

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def get_full_procurement_dashboard(self) -> Dict[str, Any]:
        return {
            "hotel_id": self.hotel_id,
            "purchase_orders": self._po_kpis(),
            "purchase_requests": self._pr_kpis(),
            "suppliers": self._supplier_kpis(),
            "rfqs": self._rfq_kpis(),
            "goods_receipts": self._gr_kpis(),
            "spend": self._spend_kpis(),
        }

    def _po_kpis(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS approved,
                    SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending,
                    SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) AS cancelled,
                    SUM(CASE WHEN status='received' THEN 1 ELSE 0 END) AS received,
                    COALESCE(SUM(total_amount), 0) AS total_spend
                FROM purchase_orders
                WHERE hotel_id = :hid
            """), {"hid": self.hotel_id}).fetchone()
            d = dict(row._mapping) if row else {}
            total = int(d.get("total") or 0)
            approved = int(d.get("approved") or 0)
            return {
                "total": total,
                "approved": approved,
                "pending": int(d.get("pending") or 0),
                "cancelled": int(d.get("cancelled") or 0),
                "received": int(d.get("received") or 0),
                "total_spend": float(d.get("total_spend") or 0),
                "approval_rate_pct": round(100.0 * approved / total, 1) if total else 0.0,
            }
        except Exception as e:
            return {"error": str(e)}

    def _pr_kpis(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS approved,
                    SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending,
                    SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END) AS rejected
                FROM purchase_requests
                WHERE hotel_id = :hid
            """), {"hid": self.hotel_id}).fetchone()
            d = dict(row._mapping) if row else {}
            return {
                "total": int(d.get("total") or 0),
                "approved": int(d.get("approved") or 0),
                "pending": int(d.get("pending") or 0),
                "rejected": int(d.get("rejected") or 0),
            }
        except Exception as e:
            return {"error": str(e)}

    def _supplier_kpis(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS approved,
                    SUM(CASE WHEN preferred_flag = TRUE THEN 1 ELSE 0 END) AS preferred,
                    SUM(CASE WHEN risk_level='high' THEN 1 ELSE 0 END) AS high_risk,
                    COALESCE(AVG(rating), 0) AS avg_rating
                FROM suppliers
                WHERE hotel_id = :hid
            """), {"hid": self.hotel_id}).fetchone()
            d = dict(row._mapping) if row else {}
            return {
                "total": int(d.get("total") or 0),
                "approved": int(d.get("approved") or 0),
                "preferred": int(d.get("preferred") or 0),
                "high_risk": int(d.get("high_risk") or 0),
                "avg_rating": round(float(d.get("avg_rating") or 0), 2),
            }
        except Exception as e:
            return {"error": str(e)}

    def _rfq_kpis(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status='open' THEN 1 ELSE 0 END) AS open,
                    SUM(CASE WHEN status='awarded' THEN 1 ELSE 0 END) AS awarded,
                    SUM(CASE WHEN status='closed' THEN 1 ELSE 0 END) AS closed
                FROM rfqs
                WHERE hotel_id = :hid
            """), {"hid": self.hotel_id}).fetchone()
            d = dict(row._mapping) if row else {}
            return {
                "total": int(d.get("total") or 0),
                "open": int(d.get("open") or 0),
                "awarded": int(d.get("awarded") or 0),
                "closed": int(d.get("closed") or 0),
            }
        except Exception as e:
            return {"error": str(e)}

    def _gr_kpis(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status='received' THEN 1 ELSE 0 END) AS received,
                    SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending
                FROM goods_receipts
                WHERE hotel_id = :hid
            """), {"hid": self.hotel_id}).fetchone()
            d = dict(row._mapping) if row else {}
            return {
                "total": int(d.get("total") or 0),
                "received": int(d.get("received") or 0),
                "pending": int(d.get("pending") or 0),
            }
        except Exception as e:
            return {"error": str(e)}

    def _spend_kpis(self) -> Dict[str, Any]:
        try:
            po_row = self.db.execute(text("""
                SELECT
                    COALESCE(SUM(total_amount), 0) AS total_spend,
                    COALESCE(SUM(CASE WHEN status='approved' THEN total_amount ELSE 0 END), 0) AS approved_spend,
                    COUNT(DISTINCT vendor_id) AS unique_suppliers
                FROM purchase_orders
                WHERE hotel_id = :hid
            """), {"hid": self.hotel_id}).fetchone()
            d = dict(po_row._mapping) if po_row else {}
            return {
                "total_spend": float(d.get("total_spend") or 0),
                "approved_spend": float(d.get("approved_spend") or 0),
                "unique_suppliers": int(d.get("unique_suppliers") or 0),
            }
        except Exception as e:
            return {"error": str(e)}
