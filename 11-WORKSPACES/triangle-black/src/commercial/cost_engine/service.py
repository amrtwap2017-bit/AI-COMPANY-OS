"""
Cost Intelligence Engine — Triangle Black A-019
NEW: Per-asset cost analysis, maintenance cost trends, cost-to-operate

Does NOT duplicate: /api/v1/procurement-engine/* (supplier spend)

NEW:
  /api/v1/cost-engine/summary         — overall cost intelligence
  /api/v1/cost-engine/by-asset        — maintenance cost per asset
  /api/v1/cost-engine/by-category     — cost aggregated by asset category
  /api/v1/cost-engine/recurring       — recurring failure + cost patterns

VERIFIED DB columns:
  work_orders: id, hotel_id, asset_id, status, priority, created_at, completed_at
  purchase_orders: id, hotel_id, vendor_id, subtotal, total_amount, status, created_at
  assets: id, hotel_id, name, category, criticality, status
  invoices: id, hotel_id, work_order_id, amount, status, created_at
"""
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import text


class CostEngineService:
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

    def cost_by_asset(self, limit: int = 30) -> list:
        """Maintenance cost per asset from invoices linked to work orders."""
        rows = self._q("""
            SELECT
                a.id AS asset_id,
                a.name AS asset_name,
                a.category,
                a.criticality,
                COUNT(DISTINCT wo.id) AS total_work_orders,
                COUNT(DISTINCT wo.id) FILTER (
                    WHERE LOWER(wo.priority) IN ('critical','emergency')
                ) AS emergency_wos,
                COALESCE(SUM(inv.amount), 0) AS total_invoice_cost,
                COUNT(DISTINCT inv.id) AS invoice_count,
                ROUND(
                    COALESCE(SUM(inv.amount), 0) /
                    NULLIF(COUNT(DISTINCT wo.id), 0), 2
                ) AS avg_cost_per_wo
            FROM assets a
            LEFT JOIN work_orders wo ON wo.asset_id = a.id
                AND wo.hotel_id = :hid AND wo.deleted_at IS NULL
            LEFT JOIN invoices inv ON inv.work_order_id = wo.id
                AND inv.hotel_id = :hid
            WHERE a.hotel_id = :hid AND a.deleted_at IS NULL
            GROUP BY a.id, a.name, a.category, a.criticality
            HAVING COUNT(DISTINCT wo.id) > 0
               OR COALESCE(SUM(inv.amount), 0) > 0
            ORDER BY total_invoice_cost DESC NULLS LAST
            LIMIT :lim
        """, {"hid": self.hid, "lim": limit})

        result = []
        for r in rows:
            d = dict(r._mapping)
            total_cost = float(d.get("total_invoice_cost", 0) or 0)
            wos = d.get("total_work_orders", 0) or 0
            emergency = d.get("emergency_wos", 0) or 0

            # Cost risk: high cost + emergency WOs = high risk
            cost_risk = (
                "HIGH" if total_cost > 100000 or emergency >= 3
                else "MODERATE" if total_cost > 20000 or emergency >= 1
                else "LOW"
            )

            result.append({
                "asset_id": d.get("asset_id", ""),
                "asset_name": d.get("asset_name", ""),
                "category": d.get("category", ""),
                "criticality": d.get("criticality", ""),
                "total_work_orders": wos,
                "emergency_work_orders": emergency,
                "total_invoice_cost": round(total_cost, 2),
                "invoice_count": d.get("invoice_count", 0),
                "avg_cost_per_wo": float(d.get("avg_cost_per_wo") or 0),
                "cost_risk": cost_risk,
            })

        return result

    def cost_by_category(self) -> list:
        """Cost aggregated by asset category."""
        rows = self._q("""
            SELECT
                a.category,
                COUNT(DISTINCT a.id) AS asset_count,
                COUNT(DISTINCT wo.id) AS total_wos,
                COALESCE(SUM(inv.amount), 0) AS total_cost,
                ROUND(
                    COALESCE(SUM(inv.amount), 0) /
                    NULLIF(COUNT(DISTINCT a.id), 0), 2
                ) AS cost_per_asset,
                ROUND(
                    COALESCE(SUM(inv.amount), 0) /
                    NULLIF(COUNT(DISTINCT wo.id), 0), 2
                ) AS cost_per_wo
            FROM assets a
            LEFT JOIN work_orders wo ON wo.asset_id = a.id
                AND wo.hotel_id = :hid AND wo.deleted_at IS NULL
            LEFT JOIN invoices inv ON inv.work_order_id = wo.id
                AND inv.hotel_id = :hid
            WHERE a.hotel_id = :hid AND a.deleted_at IS NULL
            GROUP BY a.category
            ORDER BY total_cost DESC NULLS LAST
        """)

        result = []
        for r in rows:
            d = dict(r._mapping)
            total = float(d.get("total_cost", 0) or 0)
            cost_per_asset = float(d.get("cost_per_asset") or 0)

            burden = (
                "VERY_HIGH" if cost_per_asset > 50000
                else "HIGH" if cost_per_asset > 20000
                else "MODERATE" if cost_per_asset > 5000
                else "LOW"
            )

            result.append({
                "category": d.get("category", "Unknown"),
                "asset_count": d.get("asset_count", 0),
                "total_wos": d.get("total_wos", 0),
                "total_cost": round(total, 2),
                "cost_per_asset": round(cost_per_asset, 2),
                "cost_per_wo": float(d.get("cost_per_wo") or 0),
                "maintenance_burden": burden,
            })

        return result

    def recurring_failures(self) -> list:
        """Assets with repeated failures — cost amplifiers."""
        rows = self._q("""
            SELECT
                a.id, a.name, a.category, a.criticality,
                COUNT(wo.id) AS failure_count,
                COUNT(wo.id) FILTER (
                    WHERE LOWER(wo.priority) IN ('critical','emergency')
                ) AS critical_failures,
                MIN(wo.created_at) AS first_failure,
                MAX(wo.created_at) AS last_failure,
                COALESCE(SUM(inv.amount), 0) AS total_cost,
                ROUND(
                    EXTRACT(EPOCH FROM (MAX(wo.created_at) - MIN(wo.created_at)))
                    / 86400, 0
                ) AS days_span
            FROM assets a
            JOIN work_orders wo ON wo.asset_id = a.id
                AND wo.hotel_id = :hid AND wo.deleted_at IS NULL
            LEFT JOIN invoices inv ON inv.work_order_id = wo.id
                AND inv.hotel_id = :hid
            WHERE a.hotel_id = :hid AND a.deleted_at IS NULL
            GROUP BY a.id, a.name, a.category, a.criticality
            HAVING COUNT(wo.id) >= 3
            ORDER BY COUNT(wo.id) DESC, total_cost DESC
            LIMIT 20
        """)

        result = []
        for r in rows:
            d = dict(r._mapping)
            failures = d.get("failure_count", 0) or 0
            days = float(d.get("days_span") or 1)
            frequency = round(failures / max(days, 1) * 30, 1)  # failures per 30 days

            pattern = (
                "CHRONIC" if frequency > 2
                else "FREQUENT" if frequency > 0.5
                else "RECURRING"
            )

            result.append({
                "asset_id": d.get("id", ""),
                "asset_name": d.get("name", ""),
                "category": d.get("category", ""),
                "criticality": d.get("criticality", ""),
                "failure_count": failures,
                "critical_failures": d.get("critical_failures", 0),
                "total_cost": round(float(d.get("total_cost", 0) or 0), 2),
                "days_span": int(days),
                "failures_per_30_days": frequency,
                "pattern": pattern,
                "recommendation": (
                    "IMMEDIATE_REPLACEMENT" if pattern == "CHRONIC"
                    else "MAJOR_OVERHAUL" if d.get("critical_failures", 0) >= 2
                    else "REVIEW_PM_PLAN"
                ),
            })

        return result

    def summary(self) -> dict:
        """Overall cost intelligence summary."""
        # Total maintenance cost from invoices
        total_inv_cost = self._scalar(
            "SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE hotel_id=:hid"
        )
        total_invoices = self._scalar(
            "SELECT COUNT(*) FROM invoices WHERE hotel_id=:hid"
        )
        # Total procurement spend (from purchase_orders)
        total_po_spend = self._scalar(
            "SELECT COALESCE(SUM(subtotal), 0) FROM purchase_orders WHERE hotel_id=:hid"
        )
        # Emergency procurement cost indicator
        avg_wo_cost = self._scalar(
            "SELECT COALESCE(AVG(amount), 0) FROM invoices WHERE hotel_id=:hid AND amount > 0"
        )
        # Assets with highest costs
        by_asset = self.cost_by_asset(limit=100)
        by_cat = self.cost_by_category()
        recurring = self.recurring_failures()

        # Combined cost intelligence
        total_op_cost = float(total_inv_cost) + float(total_po_spend)
        high_cost_assets = [a for a in by_asset if a["cost_risk"] == "HIGH"]
        chronic_assets = [r for r in recurring if r["pattern"] == "CHRONIC"]

        insights = []
        if chronic_assets:
            insights.append({
                "type": "CHRONIC_FAILURES",
                "severity": "CRITICAL",
                "message": f"{len(chronic_assets)} assets have chronic failure patterns — replacement recommended"
            })
        if len(high_cost_assets) > 0:
            top_cost = high_cost_assets[0]["total_invoice_cost"] if high_cost_assets else 0
            insights.append({
                "type": "HIGH_COST_ASSETS",
                "severity": "HIGH",
                "message": f"{len(high_cost_assets)} assets driving disproportionate maintenance costs"
            })
        if float(total_po_spend) > 0 and float(total_inv_cost) == 0:
            insights.append({
                "type": "NO_INVOICE_LINKAGE",
                "severity": "MEDIUM",
                "message": "Purchase orders exist but no invoices linked to work orders — cost visibility gap"
            })

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "cost_overview": {
                "total_invoice_cost": round(float(total_inv_cost), 2),
                "total_invoices": total_invoices,
                "avg_cost_per_invoice": round(float(avg_wo_cost), 2),
                "total_procurement_spend": round(float(total_po_spend), 2),
                "total_operational_cost": round(total_op_cost, 2),
            },
            "risk_summary": {
                "high_cost_assets": len(high_cost_assets),
                "chronic_failure_assets": len(chronic_assets),
                "recurring_failure_assets": len(recurring),
            },
            "insights": insights,
            "top_cost_assets": by_asset[:5],
            "top_cost_categories": by_cat[:5],
            "chronic_assets": chronic_assets[:3],
        }
