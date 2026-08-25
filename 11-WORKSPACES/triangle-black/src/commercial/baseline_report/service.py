"""
Baseline Report Service — Triangle Black A-010-B
Produces the first operational intelligence snapshot for a new customer.
All queries are tenant-isolated via hotel_id.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text


class BaselineReportService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hid = hotel_id

    def _q(self, sql: str, params: dict = None):
        """Execute a query safely — returns rows or empty list."""
        try:
            result = self.db.execute(text(sql), params or {"hid": self.hid})
            return result.fetchall()
        except Exception:
            return []

    def _scalar(self, sql: str, params: dict = None, default=0):
        """Execute a scalar query safely."""
        try:
            result = self.db.execute(text(sql), params or {"hid": self.hid})
            val = result.scalar()
            return val if val is not None else default
        except Exception:
            return default

    def asset_health(self) -> dict:
        row = self._q("""
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE criticality = 'critical') AS critical,
                COUNT(*) FILTER (WHERE criticality = 'high') AS high,
                COUNT(*) FILTER (WHERE LOWER(status) IN ('operational','active')) AS operational,
                COUNT(*) FILTER (WHERE LOWER(status) = 'maintenance') AS in_maintenance,
                COUNT(*) FILTER (WHERE LOWER(status) = 'failed') AS failed
            FROM assets WHERE hotel_id = :hid AND deleted_at IS NULL
        """)
        r = dict(row[0]._mapping) if row else {}
        total = r.get("total", 0) or 1
        r["health_pct"] = round(r.get("operational", 0) / total * 100, 1)
        r["critical_pct"] = round(r.get("critical", 0) / total * 100, 1)
        return r

    def work_order_backlog(self) -> dict:
        row = self._q("""
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE LOWER(status) = 'open') AS open,
                COUNT(*) FILTER (WHERE LOWER(status) = 'in_progress') AS in_progress,
                COUNT(*) FILTER (WHERE LOWER(status) IN ('completed','closed')) AS completed,
                COUNT(*) FILTER (WHERE LOWER(priority) = 'critical') AS critical_priority,
                COUNT(*) FILTER (WHERE LOWER(priority) = 'high') AS high_priority,
                COUNT(*) FILTER (WHERE sla_breached = TRUE OR LOWER(sla_status) = 'breached') AS sla_breached
            FROM work_orders WHERE hotel_id = :hid AND deleted_at IS NULL
        """)
        r = dict(row[0]._mapping) if row else {}
        total = r.get("total", 0) or 1
        r["completion_rate_pct"] = round(r.get("completed", 0) / total * 100, 1)
        r["sla_compliance_pct"] = round((total - r.get("sla_breached", 0)) / total * 100, 1)
        return r

    def maintenance_cost(self) -> dict:
        row = self._q("""
            SELECT
                COALESCE(SUM(amount), 0) AS total_spend,
                COALESCE(AVG(amount), 0) AS avg_invoice,
                COUNT(*) AS invoice_count,
                COUNT(*) FILTER (WHERE LOWER(status) = 'overdue') AS overdue_count,
                COALESCE(SUM(amount) FILTER (WHERE LOWER(status) = 'overdue'), 0) AS overdue_amount,
                COALESCE(SUM(amount) FILTER (WHERE LOWER(status) = 'paid'), 0) AS paid_amount
            FROM invoices WHERE hotel_id = :hid AND deleted_at IS NULL
        """)
        r = dict(row[0]._mapping) if row else {}
        for k in ["total_spend", "avg_invoice", "overdue_amount", "paid_amount"]:
            if k in r:
                r[k] = float(r[k])
        return r

    def procurement_summary(self) -> dict:
        supplier_count = self._scalar(
            "SELECT COUNT(*) FROM suppliers WHERE hotel_id = :hid"
        )
        po_row = self._q("""
            SELECT
                COUNT(*) AS total_pos,
                COUNT(*) FILTER (WHERE LOWER(status) = 'pending') AS pending,
                COUNT(*) FILTER (WHERE LOWER(status) = 'approved') AS approved,
                COALESCE(SUM(total_amount), 0) AS total_po_value
            FROM purchase_orders WHERE hotel_id = :hid
        """)
        r = dict(po_row[0]._mapping) if po_row else {}
        r["active_suppliers"] = supplier_count
        r["total_po_value"] = float(r.get("total_po_value", 0))
        return r

    def service_request_summary(self) -> dict:
        row = self._q("""
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE LOWER(status) = 'open') AS open,
                COUNT(*) FILTER (WHERE LOWER(status) = 'in_progress') AS in_progress,
                COUNT(*) FILTER (WHERE LOWER(urgency) IN ('critical','high')) AS urgent,
                COUNT(*) FILTER (WHERE LOWER(status) = 'resolved') AS resolved
            FROM service_requests WHERE hotel_id = :hid AND deleted_at IS NULL
        """)
        r = dict(row[0]._mapping) if row else {}
        total = r.get("total", 0) or 1
        r["resolution_rate_pct"] = round(r.get("resolved", 0) / total * 100, 1)
        return r

    def contract_compliance(self) -> dict:
        row = self._q("""
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE LOWER(status) = 'active') AS active,
                COUNT(*) FILTER (WHERE LOWER(status) = 'expired') AS expired,
                COUNT(*) FILTER (
                    WHERE end_date IS NOT NULL
                    AND end_date::date <= CURRENT_DATE + INTERVAL '30 days'
                    AND end_date::date >= CURRENT_DATE
                ) AS expiring_30d,
                COALESCE(SUM(value), 0) AS total_contract_value
            FROM contracts WHERE hotel_id = :hid AND deleted_at IS NULL
        """)
        r = dict(row[0]._mapping) if row else {}
        r["total_contract_value"] = float(r.get("total_contract_value", 0))
        return r

    def site_summary(self) -> dict:
        site_count = self._scalar(
            "SELECT COUNT(*) FROM sites WHERE hotel_id = :hid"
        )
        assets_per_site = self._q("""
            SELECT s.name, COUNT(a.id) AS asset_count,
                   COUNT(a.id) FILTER (WHERE a.criticality = 'critical') AS critical_assets
            FROM sites s
            LEFT JOIN assets a ON a.site_id = s.id AND a.deleted_at IS NULL
            WHERE s.hotel_id = :hid
            GROUP BY s.name
            ORDER BY critical_assets DESC, asset_count DESC
            LIMIT 5
        """)
        return {
            "total_sites": site_count,
            "sites": [dict(r._mapping) for r in assets_per_site]
        }

    def workforce_summary(self) -> dict:
        emp_count = self._scalar(
            "SELECT COUNT(*) FROM employees WHERE hotel_id = :hid AND is_active = TRUE"
        )
        tech_count = self._scalar(
            "SELECT COUNT(*) FROM technicians WHERE hotel_id = :hid"
        )
        return {
            "active_employees": emp_count,
            "technicians": tech_count
        }

    def operational_risk_score(self, assets: dict, work_orders: dict) -> dict:
        """
        Risk Score (0-100, higher = more risk):
        critical_pct × 0.30 + open_wo_pct × 0.25 +
        overdue_pct × 0.25 + sla_breach_pct × 0.20
        """
        total_assets = max(assets.get("total", 1), 1)
        total_wo = max(work_orders.get("total", 1), 1)

        critical_pct = assets.get("critical", 0) / total_assets * 100
        failed_pct = assets.get("failed", 0) / total_assets * 100
        open_wo_pct = work_orders.get("open", 0) / total_wo * 100
        sla_breach_pct = 100 - work_orders.get("sla_compliance_pct", 100)

        score = (
            critical_pct * 0.30 +
            open_wo_pct * 0.25 +
            failed_pct * 0.25 +
            sla_breach_pct * 0.20
        )
        score = min(round(score, 1), 100)

        grade = "A" if score < 20 else "B" if score < 40 else "C" if score < 60 else "D"

        return {
            "score": score,
            "grade": grade,
            "label": "LOW RISK" if score < 20 else
                     "MODERATE RISK" if score < 40 else
                     "HIGH RISK" if score < 60 else
                     "CRITICAL RISK",
            "components": {
                "critical_assets_pct": round(critical_pct, 1),
                "open_wo_pct": round(open_wo_pct, 1),
                "failed_assets_pct": round(failed_pct, 1),
                "sla_breach_pct": round(sla_breach_pct, 1),
            }
        }

    def generate_insights(self, assets: dict, work_orders: dict,
                          costs: dict, procurement: dict) -> list:
        """Auto-generate 5 key insight sentences from the data."""
        insights = []

        # Asset insight
        if assets.get("critical", 0) > 0:
            insights.append({
                "type": "ASSET_RISK",
                "severity": "HIGH",
                "message": f"{assets['critical']} critical assets require immediate attention "
                           f"({assets.get('critical_pct', 0)}% of total asset base)"
            })

        # Work order insight
        open_wo = work_orders.get("open", 0)
        if open_wo > 0:
            insights.append({
                "type": "BACKLOG",
                "severity": "MEDIUM" if open_wo < 20 else "HIGH",
                "message": f"{open_wo} work orders are currently open "
                           f"(completion rate: {work_orders.get('completion_rate_pct', 0)}%)"
            })

        # SLA insight
        sla_pct = work_orders.get("sla_compliance_pct", 100)
        if sla_pct < 90:
            insights.append({
                "type": "SLA_RISK",
                "severity": "HIGH",
                "message": f"SLA compliance is at {sla_pct}% — "
                           f"{work_orders.get('sla_breached', 0)} work orders breached SLA"
            })
        else:
            insights.append({
                "type": "SLA_OK",
                "severity": "LOW",
                "message": f"SLA compliance is strong at {sla_pct}%"
            })

        # Financial insight
        overdue = costs.get("overdue_amount", 0)
        if overdue > 0:
            insights.append({
                "type": "FINANCIAL_RISK",
                "severity": "MEDIUM",
                "message": f"${overdue:,.0f} in overdue invoices requires collection attention"
            })

        # Supplier insight
        suppliers = procurement.get("active_suppliers", 0)
        pending_pos = procurement.get("pending", 0)
        if pending_pos > 0:
            insights.append({
                "type": "PROCUREMENT",
                "severity": "LOW",
                "message": f"{pending_pos} purchase orders pending approval "
                           f"across {suppliers} active suppliers"
            })

        return insights

    def generate(self) -> dict:
        """Generate the complete baseline report."""
        assets = self.asset_health()
        work_orders = self.work_order_backlog()
        costs = self.maintenance_cost()
        procurement = self.procurement_summary()
        service_reqs = self.service_request_summary()
        contracts = self.contract_compliance()
        sites = self.site_summary()
        workforce = self.workforce_summary()
        risk = self.operational_risk_score(assets, work_orders)
        insights = self.generate_insights(assets, work_orders, costs, procurement)

        return {
            "hotel_id": self.hid,
            "report_type": "OPERATIONAL_BASELINE",
            "generated_at": datetime.utcnow().isoformat(),
            "version": "1.0",
            "risk": risk,
            "insights": insights,
            "sections": {
                "asset_health": assets,
                "work_order_backlog": work_orders,
                "maintenance_cost": costs,
                "procurement": procurement,
                "service_requests": service_reqs,
                "contract_compliance": contracts,
                "sites": sites,
                "workforce": workforce,
            }
        }
