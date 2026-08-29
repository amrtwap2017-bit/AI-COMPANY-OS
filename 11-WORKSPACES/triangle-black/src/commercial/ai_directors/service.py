"""
AI Advisory Directors Service — Triangle Black V6-E01
Governed advisory workflow: DATA → EVIDENCE → ANALYSIS → RECOMMENDATION
→ CONFIDENCE → EXPECTED IMPACT → HUMAN REVIEW → ACTION

All 4 Directors now read from real DB data via intelligence engine queries.
No hardcoded context — every recommendation is evidence-backed.
"""
from __future__ import annotations
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger("tb.ai_directors")

HOTEL_DEFAULT = "tb-default-hotel-000000000001"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _risk(score: float) -> str:
    if score >= 80: return "CRITICAL"
    if score >= 60: return "HIGH"
    if score >= 40: return "MEDIUM"
    return "LOW"


def _conf(evidence_count: int, data_quality: str = "good") -> float:
    base = 0.70 + (min(evidence_count, 5) * 0.05)
    if data_quality == "good": base += 0.05
    return min(round(base, 2), 0.97)


class AIDirectorsService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def analyze_director(self, director_type: str,
                         context: Dict[str, Any]) -> Dict[str, Any]:
        audit_id = str(uuid.uuid4())
        if director_type == "maintenance":
            return self._maintenance_director(audit_id)
        elif director_type == "procurement":
            return self._procurement_director(audit_id)
        elif director_type == "operations":
            return self._operations_director(audit_id)
        elif director_type == "executive":
            return self._executive_director(audit_id)
        else:
            return self._executive_director(audit_id)

    # ── MAINTENANCE DIRECTOR ──────────────────────────────────────────────────

    def _maintenance_director(self, audit_id: str) -> Dict[str, Any]:
        """
        Reads: assets, work_orders, maintenance_plans
        Produces: evidence-backed maintenance recommendation
        """
        H = self.hotel_id
        evidence = []
        source_data: Dict[str, Any] = {}
        risk_score = 0.0

        try:
            # Evidence 1: PM compliance
            pm = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
                    COUNT(CASE WHEN next_due_date::DATE < CURRENT_DATE
                               AND status != 'completed' THEN 1 END) AS overdue
                FROM maintenance_plans WHERE hotel_id = :h
            """), {"h": H}).fetchone()

            total_plans = int(pm[0] or 0)
            overdue_plans = int(pm[2] or 0)
            pm_compliance = round((int(pm[1] or 0) / max(total_plans, 1)) * 100, 1)
            source_data["pm_plans"] = {
                "total": total_plans,
                "overdue": overdue_plans,
                "compliance_pct": pm_compliance
            }
            if pm_compliance < 65:
                evidence.append(
                    f"PM compliance is degraded at {pm_compliance:.1f}% "
                    f"({overdue_plans} plans overdue)."
                )
                risk_score += 25
            elif pm_compliance < 80:
                evidence.append(
                    f"PM compliance at {pm_compliance:.1f}% — below 80% target."
                )
                risk_score += 10

            # Evidence 2: Corrective WO frequency (failures)
            wo = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total_open,
                    COUNT(CASE WHEN priority IN ('critical','emergency') THEN 1 END) AS critical_open,
                    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '90 days' THEN 1 END) AS last_90d
                FROM work_orders
                WHERE hotel_id = :h AND status != 'completed'
            """), {"h": H}).fetchone()

            total_open = int(wo[0] or 0)
            critical_open = int(wo[1] or 0)
            last_90d = int(wo[2] or 0)
            source_data["work_orders"] = {
                "total_open": total_open,
                "critical_open": critical_open,
                "last_90d_open": last_90d
            }
            if critical_open >= 3:
                evidence.append(
                    f"{critical_open} critical/emergency work orders currently open."
                )
                risk_score += 30
            elif critical_open >= 1:
                evidence.append(
                    f"{critical_open} critical work order(s) in active backlog."
                )
                risk_score += 15

            if last_90d >= 50:
                evidence.append(
                    f"{last_90d} work orders opened in the last 90 days — "
                    f"elevated corrective maintenance frequency."
                )
                risk_score += 20

            # Evidence 3: Asset criticality
            assets = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    COUNT(CASE WHEN criticality IN ('critical','high') THEN 1 END) AS high_risk
                FROM assets WHERE hotel_id = :h
            """), {"h": H}).fetchone()

            total_assets = int(assets[0] or 0)
            high_risk_assets = int(assets[1] or 0)
            source_data["assets"] = {
                "total": total_assets,
                "high_risk": high_risk_assets
            }
            if high_risk_assets >= 10:
                evidence.append(
                    f"{high_risk_assets} assets classified as critical/high risk "
                    f"({round(high_risk_assets/max(total_assets,1)*100,1)}% of portfolio)."
                )
                risk_score += 15

        except Exception as e:
            logger.warning(f"Maintenance director DB error: {e}")
            evidence.append("Data collection partially limited — recommend manual verification.")

        if not evidence:
            evidence = ["Maintenance operations within normal parameters based on available data."]
            recommendation = "Continue current PM schedule. No urgent intervention required."
            action = "MONITOR"
        elif risk_score >= 50:
            recommendation = (
                f"URGENT: Schedule emergency PM audit for {critical_open} critical assets. "
                f"Address {overdue_plans} overdue maintenance plans within 48 hours."
            )
            action = "CREATE_WO"
        elif risk_score >= 25:
            recommendation = (
                f"Prioritize completion of {overdue_plans} overdue PM plans. "
                f"Review critical work order backlog with maintenance manager."
            )
            action = "ESCALATE"
        else:
            recommendation = (
                f"PM compliance at {pm_compliance:.1f}%. "
                f"Focus on scheduling {overdue_plans} overdue plans to improve grade."
            )
            action = "SCHEDULE"

        expected_impact = (
            f"Resolving identified maintenance gaps could reduce emergency work orders "
            f"by 20-35% and improve PM compliance to 80%+ within 30 days."
        ) if risk_score >= 25 else "No significant change expected — operations stable."

        return self._build_response(
            director="AI Maintenance Director",
            audit_id=audit_id,
            risk_score=risk_score,
            evidence=evidence,
            recommendation=recommendation,
            confidence=_conf(len(evidence)),
            action=action,
            expected_impact=expected_impact,
            source_data=source_data,
            approval_role="manager",
        )

    # ── PROCUREMENT DIRECTOR ──────────────────────────────────────────────────

    def _procurement_director(self, audit_id: str) -> Dict[str, Any]:
        H = self.hotel_id
        evidence = []
        source_data: Dict[str, Any] = {}
        risk_score = 0.0

        try:
            # Evidence 1: Purchase order volume and spend
            po = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total_pos,
                    COALESCE(SUM(total_amount), 0) AS total_spend,
                    COUNT(CASE WHEN status IN ('pending','draft') THEN 1 END) AS pending,
                    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS last_30d
                FROM purchase_orders WHERE hotel_id = :h
            """), {"h": H}).fetchone()

            total_pos = int(po[0] or 0)
            total_spend = float(po[1] or 0)
            pending_pos = int(po[2] or 0)
            last_30d_pos = int(po[3] or 0)
            source_data["purchase_orders"] = {
                "total": total_pos,
                "total_spend": total_spend,
                "pending": pending_pos,
                "last_30d": last_30d_pos
            }
            if pending_pos >= 50:
                evidence.append(
                    f"{pending_pos} purchase orders pending approval — "
                    f"procurement backlog risk."
                )
                risk_score += 20
            if last_30d_pos >= 30:
                evidence.append(
                    f"{last_30d_pos} POs raised in the last 30 days — "
                    f"high procurement velocity."
                )
                risk_score += 10

            # Evidence 2: Supplier concentration
            sup_conc = self.db.execute(text("""
                SELECT
                    COUNT(DISTINCT s.id) AS total_suppliers,
                    COUNT(DISTINCT po.supplier_id) AS active_suppliers
                FROM suppliers s
                LEFT JOIN purchase_orders po ON po.supplier_id = s.id
                    AND po.hotel_id = :h
                WHERE s.hotel_id = :h
            """), {"h": H}).fetchone()

            total_sups = int(sup_conc[0] or 0)
            active_sups = int(sup_conc[1] or 0)
            source_data["suppliers"] = {
                "total": total_sups,
                "active_in_procurement": active_sups
            }
            if active_sups > 0 and total_sups > 0:
                concentration = round(active_sups / max(total_sups, 1) * 100, 1)
                if concentration < 20:
                    evidence.append(
                        f"Only {active_sups} of {total_sups} suppliers active in procurement "
                        f"({concentration:.0f}%) — high concentration risk."
                    )
                    risk_score += 25

        except Exception as e:
            logger.warning(f"Procurement director DB error: {e}")
            evidence.append("Procurement data partially available.")

        if not evidence:
            evidence = ["Procurement operations within normal parameters."]
            recommendation = "No urgent procurement action required."
            action = "MONITOR"
        elif risk_score >= 40:
            recommendation = (
                f"Immediate procurement review required: {pending_pos} pending POs. "
                f"Expand active supplier base to reduce concentration risk."
            )
            action = "CREATE_PR"
        elif risk_score >= 20:
            recommendation = (
                f"Prioritize clearing {pending_pos} pending POs. "
                f"Review supplier activation to distribute procurement risk."
            )
            action = "ESCALATE"
        else:
            recommendation = "Monitor procurement velocity. Consider bulk consolidation."
            action = "MONITOR"

        expected_impact = (
            f"Consolidating pending POs could reduce procurement cycle time by 15-25% "
            f"and achieve 5-10% cost savings through bulk purchasing."
        ) if risk_score >= 20 else "No significant change expected."

        return self._build_response(
            director="AI Procurement Director",
            audit_id=audit_id,
            risk_score=risk_score,
            evidence=evidence,
            recommendation=recommendation,
            confidence=_conf(len(evidence)),
            action=action,
            expected_impact=expected_impact,
            source_data=source_data,
            approval_role="manager",
        )

    # ── OPERATIONS DIRECTOR ───────────────────────────────────────────────────

    def _operations_director(self, audit_id: str) -> Dict[str, Any]:
        H = self.hotel_id
        evidence = []
        source_data: Dict[str, Any] = {}
        risk_score = 0.0

        try:
            # Evidence 1: SLA performance
            sla = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total_wos,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
                    COUNT(CASE WHEN status NOT IN ('completed','cancelled')
                               AND created_at < NOW() - INTERVAL '4 hours'
                               AND priority = 'critical' THEN 1 END) AS breached_critical,
                    COUNT(CASE WHEN status NOT IN ('completed','cancelled') THEN 1 END) AS open
                FROM work_orders WHERE hotel_id = :h
            """), {"h": H}).fetchone()

            total_wos = int(sla[0] or 0)
            completed = int(sla[1] or 0)
            breached = int(sla[2] or 0)
            open_wos = int(sla[3] or 0)
            completion_rate = round(completed / max(total_wos, 1) * 100, 1)
            source_data["work_orders"] = {
                "total": total_wos,
                "completed": completed,
                "open": open_wos,
                "completion_rate_pct": completion_rate,
                "critical_breached": breached
            }
            if breached >= 3:
                evidence.append(
                    f"{breached} critical work orders have breached 4-hour SLA window."
                )
                risk_score += 35
            if completion_rate < 60:
                evidence.append(
                    f"Work order completion rate at {completion_rate:.1f}% — "
                    f"below 60% threshold."
                )
                risk_score += 20
            if open_wos >= 100:
                evidence.append(
                    f"{open_wos} open work orders in backlog — high operational load."
                )
                risk_score += 15

            # Evidence 2: Service request backlog
            sr = self.db.execute(text("""
                SELECT COUNT(*) FROM service_requests
                WHERE hotel_id = :h AND status = 'open'
            """), {"h": H}).fetchone()
            open_srs = int(sr[0] or 0)
            source_data["service_requests"] = {"open": open_srs}
            if open_srs >= 20:
                evidence.append(
                    f"{open_srs} service requests unprocessed — "
                    f"potential guest experience impact."
                )
                risk_score += 15

        except Exception as e:
            logger.warning(f"Operations director DB error: {e}")
            evidence.append("Operations data partially available.")

        if not evidence:
            evidence = ["Operations performing within normal parameters."]
            recommendation = "Maintain current operational tempo."
            action = "MONITOR"
        elif risk_score >= 50:
            recommendation = (
                f"URGENT: Address {breached} SLA breaches immediately. "
                f"Escalate {open_wos} open WOs to maintenance manager for triage."
            )
            action = "ESCALATE"
        elif risk_score >= 25:
            recommendation = (
                f"Review {open_wos} open work orders and prioritize critical items. "
                f"Target completion rate improvement to 75%+ within 7 days."
            )
            action = "ESCALATE"
        else:
            recommendation = (
                f"Completion rate at {completion_rate:.1f}%. "
                f"Focus on clearing {open_srs} open service requests."
            )
            action = "MONITOR"

        expected_impact = (
            f"Addressing SLA breaches and backlog could improve completion rate "
            f"by 10-20% and reduce emergency escalations by 30%."
        ) if risk_score >= 25 else "Operations stable — continue current approach."

        return self._build_response(
            director="AI Operations Director",
            audit_id=audit_id,
            risk_score=risk_score,
            evidence=evidence,
            recommendation=recommendation,
            confidence=_conf(len(evidence)),
            action=action,
            expected_impact=expected_impact,
            source_data=source_data,
            approval_role="technician",
        )

    # ── EXECUTIVE DIRECTOR ────────────────────────────────────────────────────

    def _executive_director(self, audit_id: str) -> Dict[str, Any]:
        """Aggregates all 3 directors into an executive summary."""
        H = self.hotel_id
        evidence = []
        source_data: Dict[str, Any] = {}
        risk_score = 0.0

        try:
            # Pull key metrics from DB
            summary = self.db.execute(text("""
                SELECT
                    (SELECT COUNT(*) FROM assets WHERE hotel_id = :h) AS assets,
                    (SELECT COUNT(*) FROM work_orders
                     WHERE hotel_id = :h AND status != 'completed') AS open_wos,
                    (SELECT COUNT(*) FROM work_orders
                     WHERE hotel_id = :h AND status = 'completed') AS done_wos,
                    (SELECT COUNT(*) FROM maintenance_plans
                     WHERE hotel_id = :h
                     AND next_due_date::DATE < CURRENT_DATE
                     AND status != 'completed') AS overdue_pm,
                    (SELECT COALESCE(SUM(total_amount),0)
                     FROM purchase_orders WHERE hotel_id = :h) AS total_spend
            """), {"h": H}).fetchone()

            total_assets = int(summary[0] or 0)
            open_wos = int(summary[1] or 0)
            done_wos = int(summary[2] or 0)
            overdue_pm = int(summary[3] or 0)
            total_spend = float(summary[4] or 0)
            completion_rate = round(done_wos / max(done_wos + open_wos, 1) * 100, 1)
            source_data["executive_summary"] = {
                "total_assets": total_assets,
                "open_work_orders": open_wos,
                "completion_rate_pct": completion_rate,
                "overdue_pm": overdue_pm,
                "total_spend": total_spend,
            }

            if overdue_pm >= 10:
                evidence.append(
                    f"{overdue_pm} maintenance plans overdue — "
                    f"asset reliability risk accumulating."
                )
                risk_score += 25
            if completion_rate < 60:
                evidence.append(
                    f"Work order completion rate at {completion_rate:.1f}% — "
                    f"operational efficiency below target."
                )
                risk_score += 20
            if total_spend > 1_000_000:
                evidence.append(
                    f"Total procurement spend of EGP {total_spend:,.0f} — "
                    f"cost visibility and control required."
                )
                risk_score += 10
            if total_assets > 100:
                evidence.append(
                    f"Portfolio of {total_assets} assets under management."
                )

        except Exception as e:
            logger.warning(f"Executive director DB error: {e}")
            evidence.append("Executive summary based on partial data.")

        if not evidence:
            evidence = ["All operational pillars within acceptable parameters."]
            recommendation = "No executive action required at this time."
            action = "MONITOR"
        elif risk_score >= 40:
            recommendation = (
                f"Executive intervention recommended: "
                f"{overdue_pm} overdue PM plans creating asset risk. "
                f"Approve maintenance budget allocation to clear backlog within 14 days."
            )
            action = "ESCALATE"
        elif risk_score >= 20:
            recommendation = (
                f"Review operational efficiency: completion rate {completion_rate:.1f}%. "
                f"Monthly management review of maintenance compliance advised."
            )
            action = "SCHEDULE"
        else:
            recommendation = (
                f"Operations performing at {completion_rate:.1f}% completion rate. "
                f"Continue monitoring with monthly review cadence."
            )
            action = "MONITOR"

        expected_impact = (
            f"Addressing identified gaps could improve operational efficiency by 15-25% "
            f"and reduce avoidable costs by 10-20% within 60 days."
        ) if risk_score >= 20 else "Stable operations expected to continue."

        return self._build_response(
            director="AI Executive Analyst",
            audit_id=audit_id,
            risk_score=risk_score,
            evidence=evidence,
            recommendation=recommendation,
            confidence=_conf(len(evidence)),
            action=action,
            expected_impact=expected_impact,
            source_data=source_data,
            approval_role="finance_director",
        )

    # ── RESPONSE BUILDER ──────────────────────────────────────────────────────

    def _build_response(
        self,
        director: str,
        audit_id: str,
        risk_score: float,
        evidence: List[str],
        recommendation: str,
        confidence: float,
        action: str,
        expected_impact: str,
        source_data: Dict[str, Any],
        approval_role: str,
    ) -> Dict[str, Any]:
        return {
            "director": director,
            "audit_id": audit_id,
            "hotel_id": self.hotel_id,
            "risk_level": _risk(risk_score),
            "risk_score": round(risk_score, 1),
            "evidence": evidence,
            "reasoning": (
                f"Analysis based on {len(evidence)} data point(s) from live hotel operations. "
                f"Risk score: {round(risk_score, 1)}/100."
            ),
            "recommendation": recommendation,
            "confidence_score": confidence,
            "expected_impact": expected_impact,
            "action": action,
            "source_data": source_data,
            "required_approval_role": approval_role,
            "governance_status": "governed_advisory",
            "model_used": "rule-based-v2-db",
            "generated_at": _now_iso(),
            "human_review_required": True,
            "disclaimer": (
                "AI Director output is advisory only. "
                "Human decision-maker must review and approve before any action."
            ),
        }
