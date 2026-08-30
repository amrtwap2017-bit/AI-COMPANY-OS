"""
Sprint 5 — Data Quality Engine
Scores operational data completeness per tenant.
Reads from live DB — no hardcoded values.

Score: 0-100 per entity category + overall score
Recommendations: actionable, specific to the data gaps found
"""
from __future__ import annotations
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger("tb.data_quality")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _safe_int(v) -> int:
    try: return int(v or 0)
    except: return 0


class DataQualityEngine:
    """
    Scores data quality per entity category.
    Each category scored 0-100 based on completeness checks.
    Overall score = weighted average.
    """

    WEIGHTS = {
        "assets": 0.35,
        "maintenance_plans": 0.25,
        "work_orders": 0.20,
        "suppliers": 0.20,
    }

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def _q(self, sql: str, params: dict = None) -> int:
        try:
            result = self.db.execute(text(sql), params or {"h": self.hotel_id}).scalar()
            return _safe_int(result)
        except Exception as e:
            try: self.db.rollback()
            except: pass
            return 0

    def score_assets(self) -> Dict[str, Any]:
        """Score asset data quality."""
        H = self.hotel_id
        total = self._q("SELECT COUNT(*) FROM assets WHERE hotel_id=:h")
        if total == 0:
            return {"score": 0, "total": 0, "checks": [],
                    "recommendation": "No assets imported. Import asset register to begin."}

        checks = []

        # Criticality set
        without_crit = self._q(
            "SELECT COUNT(*) FROM assets WHERE hotel_id=:h "
            "AND (criticality IS NULL OR criticality='')"
        )
        crit_pct = round((total - without_crit) / total * 100, 1)
        checks.append({
            "check": "criticality_set",
            "label": "Assets with criticality rating",
            "passing": total - without_crit,
            "total": total,
            "pct": crit_pct,
            "status": "GOOD" if crit_pct >= 90 else "WARNING" if crit_pct >= 70 else "CRITICAL",
            "action": f"Set criticality for {without_crit} assets" if without_crit > 0 else None,
        })

        # Site assigned
        without_site = self._q(
            "SELECT COUNT(*) FROM assets WHERE hotel_id=:h AND site_id IS NULL"
        )
        site_pct = round((total - without_site) / total * 100, 1)
        checks.append({
            "check": "site_assigned",
            "label": "Assets with site/location",
            "passing": total - without_site,
            "total": total,
            "pct": site_pct,
            "status": "GOOD" if site_pct >= 90 else "WARNING",
            "action": f"Assign site to {without_site} assets" if without_site > 0 else None,
        })

        # Has PM plan
        with_pm = self._q(
            "SELECT COUNT(DISTINCT a.id) FROM assets a "
            "JOIN maintenance_plans mp ON mp.asset_node_id=a.id "
            "WHERE a.hotel_id=:h"
        )
        pm_pct = round(with_pm / total * 100, 1)
        checks.append({
            "check": "has_pm_plan",
            "label": "Assets with PM plan",
            "passing": with_pm,
            "total": total,
            "pct": pm_pct,
            "status": "GOOD" if pm_pct >= 80 else "WARNING" if pm_pct >= 60 else "CRITICAL",
            "action": f"Create PM plans for {total - with_pm} assets" if total - with_pm > 0 else None,
        })

        # Category set
        without_cat = self._q(
            "SELECT COUNT(*) FROM assets WHERE hotel_id=:h "
            "AND (category IS NULL OR category='' OR category='General')"
        )
        cat_pct = round((total - without_cat) / total * 100, 1)
        checks.append({
            "check": "category_set",
            "label": "Assets with specific category",
            "passing": total - without_cat,
            "total": total,
            "pct": cat_pct,
            "status": "GOOD" if cat_pct >= 80 else "WARNING",
            "action": f"Set category for {without_cat} assets" if without_cat > 0 else None,
        })

        score = round(sum(c["pct"] for c in checks) / len(checks), 1)
        actions = [c["action"] for c in checks if c["action"]]

        return {
            "score": score,
            "total": total,
            "checks": checks,
            "recommendation": "; ".join(actions[:2]) if actions else "Asset data is complete.",
        }

    def score_maintenance_plans(self) -> Dict[str, Any]:
        """Score PM plan data quality."""
        total = self._q("SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h")
        if total == 0:
            return {"score": 0, "total": 0, "checks": [],
                    "recommendation": "No PM plans found. Create preventive maintenance schedules."}

        checks = []

        # Has next_due_date
        without_due = self._q(
            "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h "
            "AND (next_due_date IS NULL OR next_due_date='')"
        )
        due_pct = round((total - without_due) / total * 100, 1)
        checks.append({
            "check": "has_next_due_date",
            "label": "PM plans with next due date",
            "passing": total - without_due,
            "total": total,
            "pct": due_pct,
            "status": "GOOD" if due_pct >= 90 else "CRITICAL",
            "action": f"Set next_due_date for {without_due} PM plans" if without_due > 0 else None,
        })

        # Not overdue
        overdue = self._q(
            "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h "
            "AND next_due_date::DATE < CURRENT_DATE AND status!='completed'"
        )
        overdue_pct = round((total - overdue) / total * 100, 1)
        checks.append({
            "check": "not_overdue",
            "label": "PM plans current (not overdue)",
            "passing": total - overdue,
            "total": total,
            "pct": overdue_pct,
            "status": "GOOD" if overdue_pct >= 90 else "WARNING" if overdue_pct >= 70 else "CRITICAL",
            "action": f"Complete {overdue} overdue PM plans" if overdue > 0 else None,
        })

        # Linked to real asset
        without_asset = self._q(
            "SELECT COUNT(*) FROM maintenance_plans mp WHERE mp.hotel_id=:h "
            "AND NOT EXISTS (SELECT 1 FROM assets a WHERE a.id=mp.asset_node_id)"
        )
        asset_pct = round((total - without_asset) / total * 100, 1)
        checks.append({
            "check": "linked_to_asset",
            "label": "PM plans linked to existing asset",
            "passing": total - without_asset,
            "total": total,
            "pct": asset_pct,
            "status": "GOOD" if asset_pct >= 95 else "WARNING",
            "action": f"Fix {without_asset} unlinked PM plans" if without_asset > 0 else None,
        })

        score = round(sum(c["pct"] for c in checks) / len(checks), 1)
        actions = [c["action"] for c in checks if c["action"]]

        return {
            "score": score,
            "total": total,
            "checks": checks,
            "recommendation": "; ".join(actions[:2]) if actions else "PM plan data is complete.",
        }

    def score_work_orders(self) -> Dict[str, Any]:
        """Score work order data quality."""
        total = self._q("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h")
        if total == 0:
            return {"score": 100, "total": 0, "checks": [],
                    "recommendation": "No work orders — create service requests to generate WOs."}

        open_wos = self._q(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h "
            "AND status NOT IN ('completed','cancelled')"
        )
        checks = []

        # Open WOs with technician
        without_tech = self._q(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h "
            "AND technician_id IS NULL AND status NOT IN ('completed','cancelled')"
        )
        tech_pct = round((open_wos - without_tech) / max(open_wos, 1) * 100, 1) if open_wos > 0 else 100
        checks.append({
            "check": "open_wos_assigned",
            "label": "Open WOs with technician assigned",
            "passing": open_wos - without_tech,
            "total": open_wos,
            "pct": tech_pct,
            "status": "GOOD" if tech_pct >= 80 else "WARNING" if tech_pct >= 60 else "CRITICAL",
            "action": f"Assign technician to {without_tech} open WOs" if without_tech > 0 else None,
        })

        # Completed WOs have description
        without_desc = self._q(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h "
            "AND (description IS NULL OR description='') AND status='completed'"
        )
        completed = self._q(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND status='completed'"
        )
        desc_pct = round((completed - without_desc) / max(completed, 1) * 100, 1) if completed > 0 else 100
        checks.append({
            "check": "completed_have_description",
            "label": "Completed WOs with description",
            "passing": completed - without_desc,
            "total": completed,
            "pct": desc_pct,
            "status": "GOOD" if desc_pct >= 80 else "WARNING",
            "action": f"Add description to {without_desc} completed WOs" if without_desc > 0 else None,
        })

        score = round(sum(c["pct"] for c in checks) / max(len(checks), 1), 1)
        actions = [c["action"] for c in checks if c["action"]]

        return {
            "score": score,
            "total": total,
            "checks": checks,
            "recommendation": "; ".join(actions[:2]) if actions else "Work order data is complete.",
        }

    def score_suppliers(self) -> Dict[str, Any]:
        """Score supplier data quality."""
        total = self._q("SELECT COUNT(*) FROM suppliers WHERE hotel_id=:h")
        if total == 0:
            return {"score": 0, "total": 0, "checks": [],
                    "recommendation": "No suppliers imported. Import supplier list."}

        checks = []

        # Has contact email
        without_email = self._q(
            "SELECT COUNT(*) FROM suppliers WHERE hotel_id=:h "
            "AND (email IS NULL OR email='')"
        )
        email_pct = round((total - without_email) / total * 100, 1)
        checks.append({
            "check": "has_contact_email",
            "label": "Suppliers with contact email",
            "passing": total - without_email,
            "total": total,
            "pct": email_pct,
            "status": "GOOD" if email_pct >= 80 else "WARNING" if email_pct >= 50 else "CRITICAL",
            "action": f"Add email for {without_email} suppliers" if without_email > 0 else None,
        })

        # Has category
        without_cat = self._q(
            "SELECT COUNT(*) FROM suppliers WHERE hotel_id=:h "
            "AND (category IS NULL OR category='' OR category='General')"
        )
        cat_pct = round((total - without_cat) / total * 100, 1)
        checks.append({
            "check": "has_category",
            "label": "Suppliers with specific category",
            "passing": total - without_cat,
            "total": total,
            "pct": cat_pct,
            "status": "GOOD" if cat_pct >= 80 else "WARNING",
            "action": f"Set category for {without_cat} suppliers" if without_cat > 0 else None,
        })

        # Has phone
        without_phone = self._q(
            "SELECT COUNT(*) FROM suppliers WHERE hotel_id=:h "
            "AND (phone IS NULL OR phone='')"
        )
        phone_pct = round((total - without_phone) / total * 100, 1)
        checks.append({
            "check": "has_contact_phone",
            "label": "Suppliers with contact phone",
            "passing": total - without_phone,
            "total": total,
            "pct": phone_pct,
            "status": "GOOD" if phone_pct >= 70 else "WARNING",
            "action": f"Add phone for {without_phone} suppliers" if without_phone > 0 else None,
        })

        score = round(sum(c["pct"] for c in checks) / len(checks), 1)
        actions = [c["action"] for c in checks if c["action"]]

        return {
            "score": score,
            "total": total,
            "checks": checks,
            "recommendation": "; ".join(actions[:2]) if actions else "Supplier data is complete.",
        }

    def get_full_report(self) -> Dict[str, Any]:
        """Generate complete data quality report."""
        categories = {
            "assets": self.score_assets(),
            "maintenance_plans": self.score_maintenance_plans(),
            "work_orders": self.score_work_orders(),
            "suppliers": self.score_suppliers(),
        }

        # Weighted overall score
        overall = round(sum(
            categories[cat]["score"] * self.WEIGHTS[cat]
            for cat in categories
        ), 1)

        grade = (
            "A" if overall >= 90 else
            "B" if overall >= 80 else
            "C" if overall >= 70 else
            "D" if overall >= 60 else "F"
        )

        # Top actionable recommendations
        all_actions = []
        for cat_name, cat_data in categories.items():
            for check in cat_data.get("checks", []):
                if check.get("action") and check.get("status") == "CRITICAL":
                    all_actions.append({
                        "category": cat_name,
                        "priority": "CRITICAL",
                        "action": check["action"],
                        "impact": f"Improves {cat_name} data quality score",
                    })
            for check in cat_data.get("checks", []):
                if check.get("action") and check.get("status") == "WARNING":
                    all_actions.append({
                        "category": cat_name,
                        "priority": "WARNING",
                        "action": check["action"],
                        "impact": f"Improves {cat_name} data quality score",
                    })

        return {
            "hotel_id": self.hotel_id,
            "report_type": "DATA_QUALITY_REPORT",
            "overall_score": overall,
            "grade": grade,
            "categories": categories,
            "top_recommendations": all_actions[:5],
            "summary": (
                f"Data quality score: {overall}/100 (Grade {grade}). "
                f"{len(all_actions)} improvements identified across "
                f"{sum(1 for c in categories.values() if c['score'] < 80)} categories."
            ),
            "generated_at": _now_iso(),
        }
