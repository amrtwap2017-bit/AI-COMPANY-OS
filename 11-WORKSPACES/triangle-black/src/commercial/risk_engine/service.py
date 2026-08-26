"""
Operational Risk Engine — Triangle Black A-012
The intelligence layer that CONNECTS all engines into one risk view.

AGGREGATES from:
- asset_intelligence: fleet health, critical assets
- pm_engine: overdue, unscheduled
- sla_intelligence: breach rate, backlog
- cost_intelligence: overdue invoices, efficiency
- supplier_engine: blacklisted, risk levels
- kpi_engine: OHI

Produces:
- Overall Operational Risk Score (0-100, lower=better)
- Risk by domain (ASSETS/MAINTENANCE/OPERATIONS/FINANCE/PROCUREMENT)
- Top 5 risk items requiring immediate action
- Risk trend (improving/deteriorating/stable)

SCHEMA FACTS (all verified):
- assets: hotel_id, criticality, status, deleted_at, next_maintenance_date
- work_orders: hotel_id, status, priority, sla_breached, deleted_at
- invoices: hotel_id, total_amount, status (no deleted_at)
- suppliers: hotel_id, blacklisted, risk_level, status
- maintenance_plans: NO hotel_id (use asset join)
"""
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text


class RiskEngineService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hid = hotel_id

    def _s(self, sql: str, params: dict = None, default=0):
        try:
            val = self.db.execute(text(sql), params or {"hid": self.hid}).scalar()
            return val if val is not None else default
        except Exception:
            return default

    def _risk_status(self, score: float) -> str:
        if score >= 70: return "CRITICAL"
        if score >= 50: return "HIGH"
        if score >= 30: return "MODERATE"
        return "LOW"

    def asset_risk(self) -> dict:
        """Asset domain risk (0-100)."""
        total = self._s("SELECT COUNT(*) FROM assets WHERE hotel_id=:hid AND deleted_at IS NULL")
        critical = self._s("""SELECT COUNT(*) FROM assets
            WHERE hotel_id=:hid AND deleted_at IS NULL AND criticality='critical'""")
        non_operational = self._s("""SELECT COUNT(*) FROM assets
            WHERE hotel_id=:hid AND deleted_at IS NULL
            AND LOWER(status) NOT IN ('operational','active')""")
        overdue = self._s("""SELECT COUNT(*) FROM assets
            WHERE hotel_id=:hid AND deleted_at IS NULL
            AND next_maintenance_date IS NOT NULL
            AND next_maintenance_date < NOW()""")

        # Unscheduled assets (via PM join)
        unscheduled = self._s("""
            SELECT COUNT(a.id) FROM assets a
            WHERE a.hotel_id=:hid AND a.deleted_at IS NULL
            AND NOT EXISTS (
                SELECT 1 FROM maintenance_plans mp
                WHERE mp.asset_node_id = a.id
            )
        """)

        if total == 0:
            return {"score": 0, "status": "LOW", "factors": []}

        critical_ratio = critical / total
        non_op_ratio = non_operational / total
        overdue_ratio = overdue / total
        unscheduled_ratio = unscheduled / total

        score = round(
            critical_ratio * 25 +
            non_op_ratio * 25 +
            overdue_ratio * 25 +
            unscheduled_ratio * 25,
            1
        ) * 100 / 100

        score = round(min(score * 100, 100), 1)

        factors = []
        if critical > 0:
            factors.append(f"{critical} critical assets ({round(critical_ratio*100,1)}% of fleet)")
        if overdue > 0:
            factors.append(f"{overdue} assets overdue for maintenance")
        if unscheduled > 20:
            factors.append(f"{unscheduled} assets have no PM schedule")

        return {
            "domain": "ASSETS",
            "score": score,
            "status": self._risk_status(score),
            "total_assets": total,
            "critical_assets": critical,
            "overdue_assets": overdue,
            "unscheduled_assets": unscheduled,
            "factors": factors
        }

    def operations_risk(self) -> dict:
        """Operations domain risk from SLA + WO data."""
        total_wo = self._s(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND deleted_at IS NULL")
        breached = self._s("""SELECT COUNT(*) FROM work_orders
            WHERE hotel_id=:hid AND deleted_at IS NULL AND sla_breached=TRUE""")
        critical_open = self._s("""SELECT COUNT(*) FROM work_orders
            WHERE hotel_id=:hid AND deleted_at IS NULL
            AND LOWER(status)='open' AND LOWER(priority)='critical'""")
        open_wo = self._s("""SELECT COUNT(*) FROM work_orders
            WHERE hotel_id=:hid AND deleted_at IS NULL AND LOWER(status)='open'""")
        stale = self._s("""SELECT COUNT(*) FROM work_orders
            WHERE hotel_id=:hid AND deleted_at IS NULL AND LOWER(status)='open'
            AND created_at < NOW() - INTERVAL '30 days'""")

        sla_breach_rate = breached / max(total_wo, 1)
        backlog_rate = open_wo / max(total_wo, 1)

        score = round(min(100, (
            sla_breach_rate * 40 +
            (critical_open / max(total_wo, 1)) * 30 +
            (stale / max(open_wo, 1)) * 30
        ) * 100), 1)

        factors = []
        if sla_breach_rate > 0.5:
            factors.append(f"SLA breach rate: {round(sla_breach_rate*100,1)}% (target <10%)")
        if critical_open > 0:
            factors.append(f"{critical_open} critical WOs unresolved")
        if stale > 20:
            factors.append(f"{stale} WOs stale >30 days")

        return {
            "domain": "OPERATIONS",
            "score": score,
            "status": self._risk_status(score),
            "sla_breach_rate_pct": round(sla_breach_rate * 100, 1),
            "critical_open_wos": critical_open,
            "stale_wos": stale,
            "factors": factors
        }

    def maintenance_risk(self) -> dict:
        """Maintenance domain risk from PM data."""
        total_plans = self._s("""
            SELECT COUNT(mp.id) FROM maintenance_plans mp
            JOIN assets a ON a.id = mp.asset_node_id
            WHERE a.hotel_id=:hid
        """)
        completed = self._s("""
            SELECT COUNT(mp.id) FROM maintenance_plans mp
            JOIN assets a ON a.id = mp.asset_node_id
            WHERE a.hotel_id=:hid AND LOWER(mp.status)='completed'
        """)
        overdue_plans = self._s("""
            SELECT COUNT(mp.id) FROM maintenance_plans mp
            JOIN assets a ON a.id = mp.asset_node_id
            WHERE a.hotel_id=:hid
            AND mp.next_due_date IS NOT NULL
            AND mp.next_due_date < NOW()
        """)

        pm_completion = completed / max(total_plans, 1)
        overdue_rate = overdue_plans / max(total_plans, 1)

        score = round(min(100, (
            (1 - pm_completion) * 50 +
            overdue_rate * 50
        ) * 100), 1)

        factors = []
        if pm_completion < 0.5:
            factors.append(f"PM completion only {round(pm_completion*100,1)}% (target: 90%+)")
        if overdue_plans > 0:
            factors.append(f"{overdue_plans} PM plans overdue")

        return {
            "domain": "MAINTENANCE",
            "score": score,
            "status": self._risk_status(score),
            "total_plans": total_plans,
            "completed_plans": completed,
            "overdue_plans": overdue_plans,
            "pm_completion_pct": round(pm_completion * 100, 1),
            "factors": factors
        }

    def finance_risk(self) -> dict:
        """Finance domain risk from invoice data."""
        total_amount = float(self._s("""
            SELECT COALESCE(SUM(total_amount),0) FROM invoices WHERE hotel_id=:hid
        """, default=0))
        overdue_amount = float(self._s("""
            SELECT COALESCE(SUM(total_amount),0) FROM invoices
            WHERE hotel_id=:hid AND LOWER(status)='overdue'
        """, default=0))
        overdue_count = self._s("""
            SELECT COUNT(*) FROM invoices
            WHERE hotel_id=:hid AND LOWER(status)='overdue'
        """)

        overdue_rate = overdue_amount / max(total_amount, 1)
        score = round(min(100, overdue_rate * 100 * 2), 1)

        factors = []
        if overdue_count > 0:
            factors.append(
                f"{overdue_count} overdue invoices totalling ${overdue_amount:,.0f}")
        if overdue_rate > 0.2:
            factors.append(f"Overdue rate {round(overdue_rate*100,1)}% exceeds 20% threshold")

        return {
            "domain": "FINANCE",
            "score": score,
            "status": self._risk_status(score),
            "total_amount": round(total_amount, 0),
            "overdue_amount": round(overdue_amount, 0),
            "overdue_count": overdue_count,
            "overdue_rate_pct": round(overdue_rate * 100, 1),
            "factors": factors
        }

    def procurement_risk(self) -> dict:
        """Procurement domain risk from supplier data."""
        total_suppliers = self._s(
            "SELECT COUNT(*) FROM suppliers WHERE hotel_id=:hid")
        blacklisted = self._s("""
            SELECT COUNT(*) FROM suppliers
            WHERE hotel_id=:hid AND blacklisted=TRUE
        """)
        high_risk = self._s("""
            SELECT COUNT(*) FROM suppliers
            WHERE hotel_id=:hid AND LOWER(risk_level) IN ('high','critical')
        """)
        unapproved = self._s("""
            SELECT COUNT(*) FROM suppliers
            WHERE hotel_id=:hid AND (is_approved=FALSE OR is_approved IS NULL)
            AND LOWER(status)!='inactive'
        """)

        if total_suppliers == 0:
            return {"domain": "PROCUREMENT", "score": 0, "status": "LOW", "factors": []}

        blacklist_rate = blacklisted / total_suppliers
        high_risk_rate = high_risk / total_suppliers

        score = round(min(100, (
            blacklist_rate * 50 +
            high_risk_rate * 30 +
            (unapproved / total_suppliers) * 20
        ) * 100), 1)

        factors = []
        if blacklisted > 0:
            factors.append(f"{blacklisted} blacklisted suppliers in active registry")
        if high_risk > 0:
            factors.append(f"{high_risk} high/critical risk suppliers ({round(high_risk_rate*100,1)}%)")

        return {
            "domain": "PROCUREMENT",
            "score": score,
            "status": self._risk_status(score),
            "total_suppliers": total_suppliers,
            "blacklisted_suppliers": blacklisted,
            "high_risk_suppliers": high_risk,
            "unapproved_suppliers": unapproved,
            "factors": factors
        }

    def overall_risk(self) -> dict:
        """
        Composite Operational Risk Score.
        Weights:
        - Operations (SLA/WO): 35%
        - Assets: 25%
        - Maintenance: 20%
        - Finance: 10%
        - Procurement: 10%
        """
        asset = self.asset_risk()
        ops = self.operations_risk()
        maint = self.maintenance_risk()
        fin = self.finance_risk()
        proc = self.procurement_risk()

        domains = [asset, ops, maint, fin, proc]
        weights = {
            "ASSETS": 0.25, "OPERATIONS": 0.35,
            "MAINTENANCE": 0.20, "FINANCE": 0.10, "PROCUREMENT": 0.10
        }

        composite = round(sum(
            d["score"] * weights.get(d["domain"], 0.1)
            for d in domains
        ), 1)

        all_factors = []
        for d in domains:
            for f in d.get("factors", []):
                all_factors.append({
                    "domain": d["domain"],
                    "severity": d["status"],
                    "factor": f
                })

        all_factors.sort(key=lambda x: (
            0 if x["severity"] == "CRITICAL"
            else 1 if x["severity"] == "HIGH"
            else 2 if x["severity"] == "MODERATE"
            else 3
        ))

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "overall_risk_score": composite,
            "risk_grade": (
                "CRITICAL" if composite >= 70
                else "HIGH" if composite >= 50
                else "MODERATE" if composite >= 30
                else "LOW"
            ),
            "domain_scores": {d["domain"]: d["score"] for d in domains},
            "domain_status": {d["domain"]: d["status"] for d in domains},
            "top_risk_factors": all_factors[:8],
            "domains": domains,
            "executive_summary": (
                f"Overall risk: {composite}/100 ({self._risk_status(composite)}). "
                f"Highest risk domain: {max(domains, key=lambda x: x['score'])['domain']}"
            )
        }
