"""
Procurement Intelligence Engine — Triangle Black A-016
NEW: Spend analysis, supplier concentration, emergency purchases, leakage detection

Does NOT duplicate: /api/v1/supplier-intelligence/* or /api/v1/supplier-engine/*

NEW:
  /api/v1/procurement-engine/summary       — executive procurement overview
  /api/v1/procurement-engine/spend         — spend by supplier
  /api/v1/procurement-engine/emergency     — emergency/urgent purchases
  /api/v1/procurement-engine/pending       — pending approval backlog

VERIFIED DB columns:
  purchase_orders: id, hotel_id, vendor_id, po_number, status,
    subtotal, vat_amount, total_amount, approved_by, created_at
  suppliers: id, hotel_id, company_name, category, risk_level, rating
  purchase_requests: id, hotel_id, pr_number, status, priority, created_at
"""
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text


class ProcurementEngineService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hid = hotel_id

    def _q(self, sql: str, params: dict = None):
        try:
            return self.db.execute(text(sql), params or {"hid": self.hid}).fetchall()
        except Exception:
            return []

    def _scalar(self, sql: str, params: dict = None, default=0):
        try:
            val = self.db.execute(text(sql), params or {"hid": self.hid}).scalar()
            return val if val is not None else default
        except Exception:
            return default

    def spend_by_supplier(self, limit: int = 20) -> list:
        """Procurement spend aggregated per supplier."""
        rows = self._q("""
            SELECT
                s.company_name,
                s.category,
                s.risk_level,
                s.rating,
                s.preferred_flag,
                COUNT(po.id) AS order_count,
                COALESCE(SUM(po.subtotal), 0) AS total_spend,
                COALESCE(AVG(po.subtotal), 0) AS avg_order_value,
                COUNT(po.id) FILTER (
                    WHERE LOWER(po.status) IN ('pending','draft')
                ) AS pending_orders,
                COUNT(po.id) FILTER (
                    WHERE LOWER(po.status) = 'approved'
                ) AS approved_orders
            FROM purchase_orders po
            JOIN suppliers s ON s.id = po.vendor_id
            WHERE po.hotel_id = :hid
            GROUP BY s.id, s.company_name, s.category, s.risk_level,
                     s.rating, s.preferred_flag
            ORDER BY total_spend DESC
            LIMIT :lim
        """, {"hid": self.hid, "lim": limit})

        result = []
        for r in rows:
            d = dict(r._mapping)
            total = float(d.get("total_spend", 0) or 0)
            risk = d.get("risk_level", "low") or "low"
            spend_risk = (
                "HIGH" if risk in ("high", "critical") and total > 50000
                else "MODERATE" if risk in ("medium", "high")
                else "LOW"
            )
            result.append({
                "supplier": d.get("company_name", ""),
                "category": d.get("category", ""),
                "risk_level": risk,
                "rating": float(d.get("rating") or 0),
                "preferred": bool(d.get("preferred_flag")),
                "order_count": d.get("order_count", 0),
                "total_spend": round(total, 2),
                "avg_order_value": round(float(d.get("avg_order_value", 0) or 0), 2),
                "pending_orders": d.get("pending_orders", 0),
                "approved_orders": d.get("approved_orders", 0),
                "spend_risk": spend_risk,
            })
        return result

    def emergency_purchases(self) -> list:
        """Emergency/urgent purchase orders that may bypass normal process."""
        rows = self._q("""
            SELECT
                po.id, po.po_number, po.status,
                po.subtotal, po.created_at, po.approved_by,
                s.company_name AS supplier_name,
                s.risk_level,
                pr.priority AS request_priority,
                pr.pr_number,
                EXTRACT(EPOCH FROM (po.created_at - pr.created_at)) / 3600 AS hours_to_po
            FROM purchase_orders po
            LEFT JOIN suppliers s ON s.id = po.vendor_id
            LEFT JOIN purchase_requests pr ON pr.id = po.pr_id
            WHERE po.hotel_id = :hid
              AND (
                LOWER(pr.priority) IN ('emergency','critical')
                OR EXTRACT(EPOCH FROM (po.created_at - COALESCE(pr.created_at, po.created_at))) / 3600 < 4
              )
            ORDER BY po.created_at DESC
            LIMIT 20
        """)

        result = []
        for r in rows:
            d = dict(r._mapping)
            hours = float(d.get("hours_to_po") or 0)
            risk_flag = (
                "BYPASS_RISK" if hours < 1
                else "FAST_TRACK" if hours < 4
                else "EXPEDITED"
            )
            result.append({
                "id": d["id"],
                "po_number": d.get("po_number", ""),
                "supplier": d.get("supplier_name", ""),
                "risk_level": d.get("risk_level", ""),
                "amount": float(d.get("subtotal", 0) or 0),
                "status": d.get("status", ""),
                "hours_request_to_po": round(hours, 1),
                "risk_flag": risk_flag,
                "request_priority": d.get("request_priority", ""),
                "pr_number": d.get("pr_number", ""),
                "has_approval": bool(d.get("approved_by")),
            })
        return result

    def pending_approvals(self) -> list:
        """Purchase orders pending approval — backlog risk."""
        rows = self._q("""
            SELECT
                po.id, po.po_number, po.status,
                po.subtotal, po.created_at,
                s.company_name AS supplier_name,
                s.risk_level,
                ROUND(
                    EXTRACT(EPOCH FROM (NOW() - po.created_at)) / 86400, 1
                ) AS days_pending
            FROM purchase_orders po
            LEFT JOIN suppliers s ON s.id = po.vendor_id
            WHERE po.hotel_id = :hid
              AND LOWER(po.status) IN ('pending', 'draft')
              AND po.approved_by IS NULL
            ORDER BY po.created_at ASC
            LIMIT 30
        """)

        result = []
        for r in rows:
            d = dict(r._mapping)
            days = float(d.get("days_pending", 0) or 0)
            urgency = (
                "OVERDUE" if days > 7
                else "DELAYED" if days > 3
                else "PENDING"
            )
            result.append({
                "id": d["id"],
                "po_number": d.get("po_number", ""),
                "supplier": d.get("supplier_name", ""),
                "amount": float(d.get("subtotal", 0) or 0),
                "status": d.get("status", ""),
                "days_pending": days,
                "urgency": urgency,
            })
        return result

    def summary(self) -> dict:
        """Executive procurement intelligence summary."""
        # Overall spend metrics
        total_spend = self._scalar(
            "SELECT COALESCE(SUM(subtotal), 0) FROM purchase_orders WHERE hotel_id=:hid"
        )
        total_pos = self._scalar(
            "SELECT COUNT(*) FROM purchase_orders WHERE hotel_id=:hid"
        )
        approved_pos = self._scalar(
            "SELECT COUNT(*) FROM purchase_orders WHERE hotel_id=:hid "
            "AND LOWER(status) = 'approved'"
        )
        pending_pos = self._scalar(
            "SELECT COUNT(*) FROM purchase_orders WHERE hotel_id=:hid "
            "AND LOWER(status) IN ('pending','draft') AND approved_by IS NULL"
        )
        avg_order_val = self._scalar(
            "SELECT COALESCE(AVG(subtotal), 0) FROM purchase_orders WHERE hotel_id=:hid "
            "AND subtotal > 0"
        )

        # High-risk supplier spend
        high_risk_spend = self._scalar("""
            SELECT COALESCE(SUM(po.subtotal), 0)
            FROM purchase_orders po
            JOIN suppliers s ON s.id = po.vendor_id
            WHERE po.hotel_id = :hid
            AND LOWER(s.risk_level) IN ('high', 'critical')
        """)

        spend_list = self.spend_by_supplier(limit=100)
        emergency = self.emergency_purchases()
        pending = self.pending_approvals()

        top_3_spend = sum(s["total_spend"] for s in spend_list[:3])
        concentration_pct = round(top_3_spend / max(float(total_spend), 1) * 100, 1)
        high_risk_pct = round(float(high_risk_spend) / max(float(total_spend), 1) * 100, 1)

        insights = []
        if concentration_pct >= 60:
            insights.append({
                "type": "HIGH_CONCENTRATION",
                "severity": "HIGH",
                "message": f"Top 3 suppliers account for {concentration_pct}% of total spend"
            })
        if len(pending) > 10:
            insights.append({
                "type": "APPROVAL_BACKLOG",
                "severity": "MEDIUM",
                "message": f"{len(pending)} purchase orders awaiting approval"
            })
        overdue_pending = [p for p in pending if p["urgency"] == "OVERDUE"]
        if overdue_pending:
            insights.append({
                "type": "OVERDUE_APPROVALS",
                "severity": "HIGH",
                "message": f"{len(overdue_pending)} purchase orders overdue for approval (>7 days)"
            })
        if high_risk_pct >= 30:
            insights.append({
                "type": "HIGH_RISK_SPEND",
                "severity": "MEDIUM",
                "message": f"{high_risk_pct}% of spend goes to high/critical risk suppliers"
            })

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "spend": {
                "total_spend": round(float(total_spend), 2),
                "total_orders": total_pos,
                "approved_orders": approved_pos,
                "pending_orders": pending_pos,
                "avg_order_value": round(float(avg_order_val), 2),
                "high_risk_spend": round(float(high_risk_spend), 2),
                "high_risk_spend_pct": high_risk_pct,
            },
            "concentration": {
                "top3_spend": round(top_3_spend, 2),
                "concentration_pct": concentration_pct,
                "risk_level": (
                    "CRITICAL" if concentration_pct >= 80
                    else "HIGH" if concentration_pct >= 60
                    else "MODERATE" if concentration_pct >= 40
                    else "LOW"
                ),
            },
            "insights": insights,
            "top_suppliers": spend_list[:5],
            "emergency_count": len(emergency),
            "pending_approval_count": len(pending),
        }
