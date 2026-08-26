"""
KPI Engine Service — Triangle Black A-007/A-008
Unified Operational Health Index and 10-KPI morning dashboard.

SCHEMA FIXES APPLIED (A-008):
- invoices: use total_amount NOT amount
- contracts: use total_value NOT value, status='active' includes 'signed'
- maintenance_plans: hotel_id IS NULL on demo data — query via asset join
- suppliers: is_approved IS boolean — query correct

OHI formula:
- SLA Compliance (25%): target >90%
- Fleet Health (20%): target >80%
- WO Completion Rate (20%): target >70%
- PM Compliance (15%): target >90%
- Maintenance Spend (10%): informational
- Supplier Quality (10%): target >75%
"""
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text


class KPIEngineService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hid = hotel_id

    def _s(self, sql: str, params: dict = None, default=0):
        try:
            val = self.db.execute(text(sql), params or {"hid": self.hid}).scalar()
            return val if val is not None else default
        except Exception:
            return default

    def _q(self, sql: str, params: dict = None):
        try:
            return self.db.execute(text(sql), params or {"hid": self.hid}).fetchall()
        except Exception:
            return []

    def _status(self, value, green_threshold, amber_threshold, lower_is_better=False):
        if lower_is_better:
            if value <= green_threshold: return "GREEN"
            if value <= amber_threshold: return "AMBER"
            return "RED"
        else:
            if value >= green_threshold: return "GREEN"
            if value >= amber_threshold: return "AMBER"
            return "RED"

    def compute_10_kpis(self) -> list:
        # KPI-01: SLA Compliance
        total_wo = self._s(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND deleted_at IS NULL")
        breached = self._s("""SELECT COUNT(*) FROM work_orders
            WHERE hotel_id=:hid AND deleted_at IS NULL
            AND (sla_breached=TRUE OR LOWER(sla_status)='breached')""")
        sla_pct = round((total_wo - breached) / max(total_wo, 1) * 100, 1)

        # KPI-02 + KPI-03: WO rates
        open_wo = self._s("""SELECT COUNT(*) FROM work_orders
            WHERE hotel_id=:hid AND deleted_at IS NULL AND LOWER(status)='open'""")
        completed_wo = self._s("""SELECT COUNT(*) FROM work_orders
            WHERE hotel_id=:hid AND deleted_at IS NULL
            AND LOWER(status) IN ('completed','closed')""")
        wo_completion_pct = round(completed_wo / max(total_wo, 1) * 100, 1)

        # KPI-04: Critical WOs
        critical_wo = self._s("""SELECT COUNT(*) FROM work_orders
            WHERE hotel_id=:hid AND deleted_at IS NULL
            AND LOWER(status)='open' AND LOWER(priority)='critical'""")

        # KPI-05 + KPI-06: Assets
        total_assets = self._s(
            "SELECT COUNT(*) FROM assets WHERE hotel_id=:hid AND deleted_at IS NULL")
        operational_assets = self._s("""SELECT COUNT(*) FROM assets
            WHERE hotel_id=:hid AND deleted_at IS NULL
            AND LOWER(status) IN ('operational','active')""")
        fleet_health_pct = round(operational_assets / max(total_assets, 1) * 100, 1)
        critical_assets = self._s("""SELECT COUNT(*) FROM assets
            WHERE hotel_id=:hid AND deleted_at IS NULL AND criticality='critical'""")

        # KPI-07: Overdue maintenance
        overdue_assets = self._s("""SELECT COUNT(*) FROM assets
            WHERE hotel_id=:hid AND deleted_at IS NULL
            AND next_maintenance_date IS NOT NULL
            AND next_maintenance_date < NOW()""")

        # KPI-08: PM Completion — maintenance_plans.hotel_id IS NULL on demo data
        # Use two strategies: direct hotel_id query + asset join fallback
        total_plans = self._s(
            "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:hid")
        completed_plans = self._s("""SELECT COUNT(*) FROM maintenance_plans
            WHERE hotel_id=:hid AND LOWER(status)='completed'""")

        # Fallback: if hotel_id not set, query via asset join
        if total_plans == 0:
            total_plans = self._s("""
                SELECT COUNT(mp.id) FROM maintenance_plans mp
                JOIN assets a ON a.id = mp.asset_node_id
                WHERE a.hotel_id=:hid
            """)
            completed_plans = self._s("""
                SELECT COUNT(mp.id) FROM maintenance_plans mp
                JOIN assets a ON a.id = mp.asset_node_id
                WHERE a.hotel_id=:hid AND LOWER(mp.status)='completed'
            """)

        pm_pct = round(completed_plans / max(total_plans, 1) * 100, 1)

        # KPI-09: Maintenance spend — FIXED: use total_amount not amount
        total_spend = float(self._s("""SELECT COALESCE(SUM(total_amount),0) FROM invoices
            WHERE hotel_id=:hid AND deleted_at IS NULL""", default=0))
        overdue_invoices = self._s("""SELECT COUNT(*) FROM invoices
            WHERE hotel_id=:hid AND deleted_at IS NULL
            AND LOWER(status)='overdue'""")

        # KPI-10: Supplier health — is_approved IS boolean (confirmed)
        total_suppliers = self._s(
            "SELECT COUNT(*) FROM suppliers WHERE hotel_id=:hid")
        approved_suppliers = self._s("""SELECT COUNT(*) FROM suppliers
            WHERE hotel_id=:hid
            AND (is_approved=TRUE OR LOWER(status)='active')
            AND (blacklisted IS NULL OR blacklisted=FALSE)""")
        supplier_health_pct = round(approved_suppliers / max(total_suppliers, 1) * 100, 1)

        # Active contracts — FIXED: use total_value, correct statuses
        active_contracts = self._s("""SELECT COUNT(*) FROM contracts
            WHERE hotel_id=:hid AND deleted_at IS NULL
            AND LOWER(status) IN ('active','signed','approved','executed')""")
        total_contract_value = float(self._s("""
            SELECT COALESCE(SUM(total_value),0) FROM contracts
            WHERE hotel_id=:hid AND deleted_at IS NULL
            AND LOWER(status) IN ('active','signed','approved','executed')""", default=0))

        kpis = [
            {
                "id": "KPI-01", "name": "SLA Compliance",
                "category": "OPERATIONS", "value": sla_pct, "unit": "%",
                "target": 90.0, "target_direction": "higher",
                "status": self._status(sla_pct, 90, 70),
                "weight": 0.25,
                "normalized_score": min(sla_pct / 90 * 100, 100),
                "insight": f"SLA compliance {sla_pct}% vs 90% target" +
                           (" — CRITICAL" if sla_pct < 50 else ""),
            },
            {
                "id": "KPI-02", "name": "WO Completion Rate",
                "category": "OPERATIONS", "value": wo_completion_pct, "unit": "%",
                "target": 70.0, "target_direction": "higher",
                "status": self._status(wo_completion_pct, 70, 50),
                "weight": 0.20,
                "normalized_score": min(wo_completion_pct / 70 * 100, 100),
                "insight": f"{completed_wo} of {total_wo} WOs completed ({wo_completion_pct}%)",
            },
            {
                "id": "KPI-03", "name": "Open Work Orders",
                "category": "OPERATIONS", "value": open_wo, "unit": "WOs",
                "target": 50, "target_direction": "lower",
                "status": self._status(open_wo, 50, 150, lower_is_better=True),
                "weight": 0.0,
                "normalized_score": max(0, 100 - (open_wo / max(total_wo, 1) * 100)),
                "insight": f"{open_wo} open WOs — backlog requires attention",
            },
            {
                "id": "KPI-04", "name": "Critical Open WOs",
                "category": "OPERATIONS", "value": critical_wo, "unit": "WOs",
                "target": 0, "target_direction": "lower",
                "status": self._status(critical_wo, 0, 3, lower_is_better=True),
                "weight": 0.0,
                "normalized_score": max(0, 100 - critical_wo * 20),
                "insight": f"{critical_wo} CRITICAL priority WOs open",
            },
            {
                "id": "KPI-05", "name": "Asset Fleet Health",
                "category": "ASSETS", "value": fleet_health_pct, "unit": "%",
                "target": 80.0, "target_direction": "higher",
                "status": self._status(fleet_health_pct, 80, 60),
                "weight": 0.20,
                "normalized_score": min(fleet_health_pct / 80 * 100, 100),
                "insight": f"{operational_assets} of {total_assets} assets operational ({fleet_health_pct}%)",
            },
            {
                "id": "KPI-06", "name": "Critical Assets",
                "category": "ASSETS", "value": critical_assets, "unit": "assets",
                "target": 0, "target_direction": "lower",
                "status": self._status(critical_assets, 0, 5, lower_is_better=True),
                "weight": 0.0,
                "normalized_score": max(0, 100 - (critical_assets / max(total_assets, 1) * 300)),
                "insight": f"{critical_assets} critical assets ({round(critical_assets/max(total_assets,1)*100,1)}% of fleet)",
            },
            {
                "id": "KPI-07", "name": "Overdue Maintenance",
                "category": "MAINTENANCE", "value": overdue_assets, "unit": "assets",
                "target": 0, "target_direction": "lower",
                "status": self._status(overdue_assets, 0, 3, lower_is_better=True),
                "weight": 0.0,
                "normalized_score": max(0, 100 - overdue_assets * 15),
                "insight": f"{overdue_assets} assets overdue for maintenance",
            },
            {
                "id": "KPI-08", "name": "PM Completion Rate",
                "category": "MAINTENANCE", "value": pm_pct, "unit": "%",
                "target": 90.0, "target_direction": "higher",
                "status": self._status(pm_pct, 90, 70),
                "weight": 0.15,
                "normalized_score": min(pm_pct / 90 * 100, 100),
                "insight": f"{completed_plans} of {total_plans} PM plans completed ({pm_pct}%)",
            },
            {
                "id": "KPI-09", "name": "Maintenance Spend",
                "category": "FINANCE",
                "value": round(total_spend, 0), "unit": "USD",
                "target": None, "target_direction": "lower",
                "status": "RED" if overdue_invoices > 5 else "AMBER" if overdue_invoices > 0 else "GREEN",
                "weight": 0.10,
                "normalized_score": 75 if overdue_invoices == 0 else 50,
                "insight": f"Total spend: ${total_spend:,.0f} | {overdue_invoices} overdue invoices",
            },
            {
                "id": "KPI-10", "name": "Supplier Health",
                "category": "PROCUREMENT", "value": supplier_health_pct, "unit": "%",
                "target": 80.0, "target_direction": "higher",
                "status": self._status(supplier_health_pct, 80, 60),
                "weight": 0.10,
                "normalized_score": min(supplier_health_pct / 80 * 100, 100),
                "insight": f"{approved_suppliers} of {total_suppliers} suppliers active/approved ({supplier_health_pct}%)",
            },
        ]

        # Inject contract context into finance KPI
        kpis[8]["active_contracts"] = active_contracts
        kpis[8]["contract_value"] = total_contract_value

        return kpis

    def operational_health_index(self, kpis: list) -> dict:
        weighted_kpis = [k for k in kpis if k.get("weight", 0) > 0]
        total_weight = sum(k["weight"] for k in weighted_kpis)
        if total_weight == 0:
            return {"score": 0, "grade": "D", "label": "NO DATA"}
        ohi = sum(k["normalized_score"] * k["weight"] for k in weighted_kpis) / total_weight
        ohi = round(min(100, max(0, ohi)), 1)
        grade = "A" if ohi >= 80 else "B" if ohi >= 65 else "C" if ohi >= 50 else "D"
        label = "HEALTHY" if ohi >= 80 else "MODERATE" if ohi >= 65 else "AT RISK" if ohi >= 50 else "CRITICAL"
        return {"score": ohi, "grade": grade, "label": label, "alert_threshold_exceeded": ohi < 50}

    def alerts(self, kpis: list) -> list:
        urgent = []
        for kpi in kpis:
            if kpi["status"] == "RED":
                urgent.append({
                    "kpi_id": kpi["id"], "kpi_name": kpi["name"],
                    "severity": "HIGH", "message": kpi["insight"],
                    "category": kpi["category"],
                })
        return urgent

    def dashboard(self) -> dict:
        kpis = self.compute_10_kpis()
        ohi = self.operational_health_index(kpis)
        urgent_alerts = self.alerts(kpis)
        by_category = {}
        for kpi in kpis:
            cat = kpi["category"]
            if cat not in by_category:
                by_category[cat] = {"kpis": [], "red": 0, "amber": 0, "green": 0}
            by_category[cat]["kpis"].append(kpi["name"])
            by_category[cat][kpi["status"].lower()] += 1

        red_count = sum(1 for k in kpis if k["status"] == "RED")
        amber_count = sum(1 for k in kpis if k["status"] == "AMBER")
        green_count = sum(1 for k in kpis if k["status"] == "GREEN")

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "report_type": "KPI_ENGINE_DASHBOARD",
            "operational_health_index": ohi,
            "kpi_summary": {"total": len(kpis), "red": red_count, "amber": amber_count, "green": green_count},
            "kpis": kpis,
            "urgent_alerts": urgent_alerts,
            "alert_count": len(urgent_alerts),
            "by_category": by_category,
            "morning_brief": (
                f"OHI: {ohi['score']}/100 ({ohi['label']}) | "
                f"SLA: {next(k['value'] for k in kpis if k['id']=='KPI-01')}% | "
                f"Open WOs: {next(k['value'] for k in kpis if k['id']=='KPI-03')} | "
                f"Alerts: {len(urgent_alerts)}"
            )
        }

    def trends(self) -> dict:
        wo_trend = self._q("""
            SELECT DATE_TRUNC('day', created_at)::date AS day,
                   COUNT(*) AS created,
                   COUNT(*) FILTER (WHERE LOWER(status) IN ('completed','closed')) AS completed
            FROM work_orders WHERE hotel_id=:hid AND deleted_at IS NULL
              AND created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE_TRUNC('day', created_at)::date ORDER BY day
        """)
        asset_trend = self._q("""
            SELECT LOWER(status) AS status, COUNT(*) AS count
            FROM assets WHERE hotel_id=:hid AND deleted_at IS NULL
            GROUP BY LOWER(status)
        """)
        return {
            "hotel_id": self.hid, "period": "7_days",
            "work_order_trend": [dict(r._mapping) for r in wo_trend],
            "asset_status_distribution": [dict(r._mapping) for r in asset_trend],
        }
