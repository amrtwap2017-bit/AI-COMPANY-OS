"""
Asset Read Models — T-022
Governed KPI projections for asset and maintenance analytics.
No router should query asset OLTP tables directly for analytics.
All asset intelligence flows through this layer.
"""
from __future__ import annotations
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text


class AssetReadModel:
    """
    Computes asset and maintenance KPIs from domain tables.
    Hotel-scoped. Read-only. Non-blocking on failure.
    """

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def get_full_asset_dashboard(self) -> Dict[str, Any]:
        return {
            "hotel_id": self.hotel_id,
            "assets": self._asset_kpis(),
            "maintenance": self._maintenance_kpis(),
            "criticality": self._criticality_breakdown(),
            "reliability": self._reliability_kpis(),
            "pm_compliance": self._pm_compliance(),
        }

    def _asset_kpis(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status='operational' THEN 1 ELSE 0 END) AS operational,
                    SUM(CASE WHEN status='under_maintenance' THEN 1 ELSE 0 END) AS under_maintenance,
                    SUM(CASE WHEN status='decommissioned' THEN 1 ELSE 0 END) AS decommissioned,
                    SUM(CASE WHEN criticality='critical' THEN 1 ELSE 0 END) AS critical_count
                FROM assets
                WHERE hotel_id = :hid AND deleted_at IS NULL
            """), {"hid": self.hotel_id}).fetchone()
            d = dict(row._mapping) if row else {}
            total = int(d.get("total") or 0)
            operational = int(d.get("operational") or 0)
            return {
                "total": total,
                "operational": operational,
                "under_maintenance": int(d.get("under_maintenance") or 0),
                "decommissioned": int(d.get("decommissioned") or 0),
                "critical_count": int(d.get("critical_count") or 0),
                "availability_pct": round(100.0 * operational / total, 1) if total else 0.0,
            }
        except Exception as e:
            return {"error": str(e)}

    def _maintenance_kpis(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total_wos,
                    SUM(CASE WHEN type='corrective' THEN 1 ELSE 0 END) AS corrective,
                    SUM(CASE WHEN type='preventive' THEN 1 ELSE 0 END) AS preventive,
                    SUM(CASE WHEN status='open' THEN 1 ELSE 0 END) AS open_wos,
                    SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed_wos,
                    SUM(CASE WHEN priority='critical' THEN 1 ELSE 0 END) AS critical_wos
                FROM work_orders
                WHERE hotel_id = :hid AND deleted_at IS NULL
            """), {"hid": self.hotel_id}).fetchone()
            d = dict(row._mapping) if row else {}
            total = int(d.get("total_wos") or 0)
            preventive = int(d.get("preventive") or 0)
            return {
                "total_work_orders": total,
                "corrective": int(d.get("corrective") or 0),
                "preventive": preventive,
                "open": int(d.get("open_wos") or 0),
                "completed": int(d.get("completed_wos") or 0),
                "critical_open": int(d.get("critical_wos") or 0),
                "pm_ratio_pct": round(100.0 * preventive / total, 1) if total else 0.0,
            }
        except Exception as e:
            return {"error": str(e)}

    def _criticality_breakdown(self) -> Dict[str, Any]:
        try:
            rows = self.db.execute(text("""
                SELECT criticality, COUNT(*) AS count
                FROM assets
                WHERE hotel_id = :hid AND deleted_at IS NULL
                GROUP BY criticality
            """), {"hid": self.hotel_id}).fetchall()
            result = {}
            for r in rows:
                d = dict(r._mapping)
                result[d.get("criticality", "unknown")] = int(d.get("count") or 0)
            return result
        except Exception as e:
            return {"error": str(e)}

    def _reliability_kpis(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    SUM(CASE WHEN sla_status='breached' THEN 1 ELSE 0 END) AS breached,
                    SUM(CASE WHEN sla_status='met' THEN 1 ELSE 0 END) AS met,
                    COUNT(*) AS total
                FROM work_orders
                WHERE hotel_id = :hid AND deleted_at IS NULL
                  AND asset_id IS NOT NULL
            """), {"hid": self.hotel_id}).fetchone()
            d = dict(row._mapping) if row else {}
            total = int(d.get("total") or 0)
            met = int(d.get("met") or 0)
            return {
                "asset_wo_total": total,
                "sla_met": met,
                "sla_breached": int(d.get("breached") or 0),
                "asset_sla_compliance_pct": round(100.0 * met / total, 1) if total else 0.0,
            }
        except Exception as e:
            return {"error": str(e)}

    def _pm_compliance(self) -> Dict[str, Any]:
        try:
            row = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total_plans,
                    SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS active_plans
                FROM maintenance_plans
                WHERE hotel_id = :hid
            """), {"hid": self.hotel_id}).fetchone()
            d = dict(row._mapping) if row else {}
            return {
                "total_plans": int(d.get("total_plans") or 0),
                "active_plans": int(d.get("active_plans") or 0),
            }
        except Exception as e:
            return {"error": str(e)}
