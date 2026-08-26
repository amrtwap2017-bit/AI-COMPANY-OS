"""
Executive Engine — Triangle Black A-014
Daily briefing + Operational Health Score + Priority Alerts

Does NOT duplicate: /api/v1/executive-dashboard/* or /api/v1/executive-intelligence/*

NEW:
  /api/v1/executive-engine/daily-briefing  — GM daily overview
  /api/v1/executive-engine/health-score    — 0-100 operational health
  /api/v1/executive-engine/alerts          — priority alert board
"""
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text


class ExecutiveEngineService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hid = hotel_id

    def _scalar(self, sql: str, params: dict = None, default=0):
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

    def health_score(self) -> dict:
        """
        Operational Health Score 0-100
        SLA compliance 30% + WO completion 25% + PM compliance 25% + supplier score 20%
        """
        # SLA compliance (completed/closed WOs)
        total_closed = self._scalar(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND deleted_at IS NULL "
            "AND LOWER(status) IN ('completed','closed')"
        )
        sla_ok = self._scalar(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND deleted_at IS NULL "
            "AND LOWER(status) IN ('completed','closed') AND (sla_breached IS NULL OR sla_breached=FALSE)"
        )
        sla_pct = round(sla_ok / max(total_closed, 1) * 100, 1)

        # WO completion rate (completed+closed / total non-cancelled)
        total_wo = self._scalar(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND deleted_at IS NULL "
            "AND LOWER(status) != 'cancelled'"
        )
        wo_completion_pct = round(total_closed / max(total_wo, 1) * 100, 1)

        # PM compliance (maintenance_plans with next_due_date in future vs overdue)
        total_plans = self._scalar(
            "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:hid AND LOWER(status)='active'"
        )
        plans_ok = self._scalar(
            "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:hid "
            "AND LOWER(status)='active' AND (next_due_date IS NULL OR next_due_date >= CURRENT_DATE)"
        )
        pm_pct = round(plans_ok / max(total_plans, 1) * 100, 1)

        # Supplier score (avg rating normalized to 100)
        avg_rating = self._scalar(
            "SELECT ROUND(AVG(COALESCE(rating, 0)) / 5.0 * 100, 1) "
            "FROM suppliers WHERE hotel_id=:hid AND (blacklisted IS NULL OR blacklisted=FALSE)"
        )
        supplier_pct = float(avg_rating or 0)

        # Weighted score
        score = round(
            sla_pct * 0.30 +
            wo_completion_pct * 0.25 +
            pm_pct * 0.25 +
            supplier_pct * 0.20, 1
        )
        score = max(0, min(100, score))

        grade = (
            "EXCELLENT" if score >= 90
            else "GOOD" if score >= 75
            else "FAIR" if score >= 60
            else "POOR"
        )

        return {
            "health_score": score,
            "grade": grade,
            "components": {
                "sla_compliance": {"score": sla_pct, "weight": 0.30},
                "wo_completion": {"score": wo_completion_pct, "weight": 0.25},
                "pm_compliance": {"score": pm_pct, "weight": 0.25},
                "supplier_score": {"score": supplier_pct, "weight": 0.20},
            }
        }

    def alerts(self) -> list:
        """Priority alert board — ranked by severity."""
        alerts = []

        # P0: SLA breaches on open WOs
        open_breached = self._scalar(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid "
            "AND deleted_at IS NULL AND status IN ('open','in_progress') "
            "AND sla_breached=TRUE"
        )
        if open_breached > 0:
            alerts.append({
                "type": "SLA_BREACH_ACTIVE",
                "severity": "P0_CRITICAL",
                "title": "Active SLA Breaches",
                "message": f"{open_breached} open work orders have breached SLA",
                "count": open_breached,
                "action": "Review /operations/work-orders?filter=sla_breached"
            })

        # P1: Emergency work orders open
        emergency_open = self._scalar(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid "
            "AND deleted_at IS NULL AND status IN ('open','in_progress') "
            "AND LOWER(priority) = 'emergency'"
        )
        if emergency_open > 0:
            alerts.append({
                "type": "EMERGENCY_WO_OPEN",
                "severity": "P1_HIGH",
                "title": "Emergency Work Orders",
                "message": f"{emergency_open} emergency priority work orders are open",
                "count": emergency_open,
                "action": "Review /operations/work-orders?priority=emergency"
            })

        # P1: PM overdue
        pm_overdue = self._scalar(
            "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:hid "
            "AND LOWER(status)='active' AND next_due_date < CURRENT_DATE"
        )
        if pm_overdue > 0:
            alerts.append({
                "type": "PM_OVERDUE",
                "severity": "P1_HIGH",
                "title": "Overdue Maintenance Plans",
                "message": f"{pm_overdue} preventive maintenance plans are overdue",
                "count": pm_overdue,
                "action": "Review /maintenance/pm-plans"
            })

        # P2: High-risk suppliers
        high_risk_suppliers = self._scalar(
            "SELECT COUNT(*) FROM suppliers WHERE hotel_id=:hid "
            "AND LOWER(risk_level) IN ('high','critical') AND (blacklisted IS NULL OR blacklisted=FALSE)"
        )
        if high_risk_suppliers > 0:
            alerts.append({
                "type": "HIGH_RISK_SUPPLIERS",
                "severity": "P2_MEDIUM",
                "title": "High Risk Suppliers",
                "message": f"{high_risk_suppliers} suppliers have high/critical risk rating",
                "count": high_risk_suppliers,
                "action": "Review /supply-chain/suppliers?risk=high"
            })

        # P2: Pending approvals
        pending_pos = self._scalar(
            "SELECT COUNT(*) FROM purchase_orders WHERE hotel_id=:hid "
            "AND LOWER(status) IN ('pending','draft') AND approved_by IS NULL"
        )
        if pending_pos > 0:
            alerts.append({
                "type": "PENDING_APPROVALS",
                "severity": "P2_MEDIUM",
                "title": "Purchase Orders Awaiting Approval",
                "message": f"{pending_pos} purchase orders need approval",
                "count": pending_pos,
                "action": "Review /supply-chain/purchase-orders?status=pending"
            })

        return alerts

    def daily_briefing(self) -> dict:
        """Complete GM daily briefing."""
        health = self.health_score()
        alert_list = self.alerts()

        # Key KPIs
        open_wos = self._scalar(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid "
            "AND deleted_at IS NULL AND status IN ('open','in_progress')"
        )
        completed_today = self._scalar(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid "
            "AND deleted_at IS NULL AND LOWER(status) IN ('completed','closed') "
            "AND DATE(updated_at) = CURRENT_DATE"
        )
        active_suppliers = self._scalar(
            "SELECT COUNT(*) FROM suppliers WHERE hotel_id=:hid"
        )
        total_assets = self._scalar(
            "SELECT COUNT(*) FROM assets WHERE hotel_id=:hid AND deleted_at IS NULL"
        )

        critical_count = sum(
            1 for a in alert_list if a["severity"] in ("P0_CRITICAL", "P1_HIGH")
        )

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "date": datetime.utcnow().date().isoformat(),
            "health": health,
            "kpis": {
                "open_work_orders": open_wos,
                "completed_today": completed_today,
                "active_suppliers": active_suppliers,
                "total_assets": total_assets,
                "active_alerts": len(alert_list),
                "critical_alerts": critical_count,
            },
            "alerts": alert_list,
            "requires_attention": critical_count > 0,
            "summary": (
                f"Operational health: {health['health_score']}/100 ({health['grade']}). "
                f"{open_wos} open work orders. "
                f"{critical_count} items require immediate attention."
            )
        }
