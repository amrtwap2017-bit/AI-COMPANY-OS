"""
Multi-Tenant SRE Pilot Control Service — Triangle Black SaaS v5.5
Aggregates key operational and financial KPIs across all active pilot hotels.
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

class PilotControlService:
    def __init__(self, db: Session):
        self.db = db

    def get_all_pilots_status(self) -> List[Dict[str, Any]]:
        # 1. Fetch all hotels marked as pilots
        hotel_rows = self.db.execute(text(
            "SELECT id, name, brand, city FROM hotels WHERE settings::text LIKE '%pilot%' ORDER BY name ASC"
        )).fetchall()

        results = []
        for h in hotel_rows:
            hid = h[0]
            hname = h[1]
            hbrand = h[2]
            hcity = h[3]

            # 2. Query Asset KPI counts
            assets_cnt = self.db.execute(text(
                "SELECT COUNT(*) FROM assets WHERE hotel_id = :h AND deleted_at IS NULL"
            ), {"h": hid}).scalar() or 0

            crit_cnt = self.db.execute(text(
                "SELECT COUNT(*) FROM assets WHERE hotel_id = :h AND criticality = 'critical' AND deleted_at IS NULL"
            ), {"h": hid}).scalar() or 0

            # 3. Query Work Order backlog and SLA compliance
            open_wo = self.db.execute(text(
                "SELECT COUNT(*) FROM work_orders WHERE hotel_id = :h AND status IN ('open', 'in_progress') AND deleted_at IS NULL"
            ), {"h": hid}).scalar() or 0

            sla_breaches = self.db.execute(text(
                "SELECT COUNT(*) FROM work_orders WHERE hotel_id = :h AND sla_breached IS TRUE AND deleted_at IS NULL"
            ), {"h": hid}).scalar() or 0

            # 4. Query Total Spend
            total_spend = self.db.execute(text(
                "SELECT COALESCE(SUM(amount), 0.0) FROM invoices WHERE hotel_id = :h AND deleted_at IS NULL"
            ), {"h": hid}).scalar() or 0.0

            # 5. Calculate proprietary Property Health Index
            health_score = 100
            if assets_cnt > 0:
                # Deduct score for critical assets and SLA breaches
                deductions = (crit_cnt * 5) + (sla_breaches * 15)
                health_score = max(55, 100 - deductions)

            results.append({
                "hotel_id": hid,
                "name": hname,
                "brand": hbrand,
                "city": hcity,
                "health_index": health_score,
                "kpis": {
                    "total_assets": assets_cnt,
                    "critical_assets": crit_cnt,
                    "open_backlog": open_wo,
                    "sla_breaches": sla_breaches,
                    "procurement_spend_usd": float(total_spend)
                }
            })

        return results
