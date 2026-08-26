"""
Supplier Engine Service — Triangle Black A-006
NEW supplier analytics complementing existing supplier_intelligence.

Does NOT duplicate:
- /api/v1/supplier-intelligence/report (already 200)
- /api/v1/supplier-intelligence/scorecards (already 200)
- /api/v1/supplier-intelligence/savings-opportunities (already 200)
- /api/v1/supplier-intelligence/risk (already 200)

ADDS NEW:
- Per-supplier performance score (0-100) from suppliers table attributes
- Supplier concentration risk (% spend from top 3)
- Prefer/avoid recommendations
- Category diversity analysis

SCHEMA FACTS (verified from live DB):
- suppliers: id, hotel_id, company_name, category, status, rating,
  supplier_type, payment_terms, lead_time_days, risk_level,
  preferred_flag, is_approved, blacklisted, city, country, rating
  rating is NUMERIC (e.g. 4.72)
  risk_level is TEXT: 'low', 'medium', 'high', 'critical'
  preferred_flag, blacklisted, is_approved are BOOLEAN

- purchase_orders: id, hotel_id, vendor_id (links to suppliers.id),
  subtotal (NOT total_amount), status, po_number, created_at
"""
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text


class SupplierEngineService:
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

    def performance_scores(self, limit: int = 50) -> list:
        """
        Per-supplier performance score (0-100).
        Uses only suppliers table columns (no PO join needed).

        Score formula:
        - Rating (0-5 → 0-40 pts): rating / 5 * 40
        - Risk level (0-25 pts): low=25, medium=15, high=5, critical=0
        - Approved (15 pts): is_approved=True → 15
        - Preferred (10 pts): preferred_flag=True → 10
        - Not blacklisted (10 pts): blacklisted=False → 10
        - Lead time (0-5 pts): ≤7d=5, ≤14d=3, ≤30d=1, else=0
        Total max: 100
        """
        rows = self._q("""
            SELECT
                s.id, s.company_name, s.category, s.supplier_type,
                s.status, s.rating, s.risk_level, s.preferred_flag,
                s.blacklisted, s.is_approved, s.lead_time_days,
                s.city, s.country, s.payment_terms,
                -- Score components
                ROUND((COALESCE(s.rating, 0) / 5.0 * 40), 1) AS rating_score,
                CASE s.risk_level
                    WHEN 'low' THEN 25
                    WHEN 'medium' THEN 15
                    WHEN 'high' THEN 5
                    WHEN 'critical' THEN 0
                    ELSE 10
                END AS risk_score,
                CASE WHEN s.is_approved = TRUE THEN 15 ELSE 0 END AS approval_score,
                CASE WHEN s.preferred_flag = TRUE THEN 10 ELSE 0 END AS preferred_score,
                CASE WHEN s.blacklisted = FALSE OR s.blacklisted IS NULL THEN 10 ELSE 0 END AS not_blacklisted_score,
                CASE
                    WHEN COALESCE(s.lead_time_days, 999) <= 7 THEN 5
                    WHEN COALESCE(s.lead_time_days, 999) <= 14 THEN 3
                    WHEN COALESCE(s.lead_time_days, 999) <= 30 THEN 1
                    ELSE 0
                END AS lead_time_score,
                -- PO count
                COUNT(po.id) AS total_orders,
                COALESCE(SUM(po.subtotal), 0) AS total_spend
            FROM suppliers s
            LEFT JOIN purchase_orders po ON po.vendor_id = s.id
                AND po.hotel_id = :hid
            WHERE s.hotel_id = :hid
            GROUP BY s.id, s.company_name, s.category, s.supplier_type,
                     s.status, s.rating, s.risk_level, s.preferred_flag,
                     s.blacklisted, s.is_approved, s.lead_time_days,
                     s.city, s.country, s.payment_terms
            ORDER BY s.rating DESC NULLS LAST
            LIMIT :lim
        """, {"hid": self.hid, "lim": limit})

        result = []
        for r in rows:
            d = dict(r._mapping)
            raw_score = (
                float(d.get("rating_score", 0)) +
                d.get("risk_score", 0) +
                d.get("approval_score", 0) +
                d.get("preferred_score", 0) +
                d.get("not_blacklisted_score", 0) +
                d.get("lead_time_score", 0)
            )
            score = max(0, min(100, round(raw_score, 1)))
            grade = "A" if score >= 80 else "B" if score >= 60 else "C" if score >= 40 else "D"
            recommendation = (
                "PREFERRED" if score >= 80 and d.get("preferred_flag")
                else "RELIABLE" if score >= 70
                else "ACCEPTABLE" if score >= 50
                else "MONITOR" if score >= 30
                else "AVOID"
            )
            if d.get("blacklisted"):
                recommendation = "BLACKLISTED"

            result.append({
                "id": d["id"],
                "company_name": d["company_name"],
                "category": d.get("category", ""),
                "supplier_type": d.get("supplier_type", ""),
                "status": d.get("status", ""),
                "city": d.get("city", ""),
                "rating": float(d.get("rating") or 0),
                "risk_level": d.get("risk_level", ""),
                "preferred": bool(d.get("preferred_flag")),
                "blacklisted": bool(d.get("blacklisted")),
                "approved": bool(d.get("is_approved")),
                "lead_time_days": d.get("lead_time_days"),
                "performance_score": score,
                "grade": grade,
                "recommendation": recommendation,
                "total_orders": d.get("total_orders", 0),
                "total_spend": float(d.get("total_spend", 0)),
                "score_breakdown": {
                    "rating": float(d.get("rating_score", 0)),
                    "risk": d.get("risk_score", 0),
                    "approval": d.get("approval_score", 0),
                    "preferred": d.get("preferred_score", 0),
                    "not_blacklisted": d.get("not_blacklisted_score", 0),
                    "lead_time": d.get("lead_time_score", 0),
                }
            })

        return sorted(result, key=lambda x: x["performance_score"], reverse=True)

    def concentration_risk(self) -> dict:
        """
        Supplier concentration risk:
        What % of total spend comes from top 3 suppliers?
        Uses purchase_orders.subtotal + vendor_id.
        """
        top3 = self._q("""
            SELECT
                s.company_name,
                s.category,
                s.risk_level,
                COUNT(po.id) AS order_count,
                COALESCE(SUM(po.subtotal), 0) AS spend
            FROM purchase_orders po
            JOIN suppliers s ON s.id = po.vendor_id
            WHERE po.hotel_id = :hid
            GROUP BY s.id, s.company_name, s.category, s.risk_level
            ORDER BY spend DESC
            LIMIT 3
        """)

        total_spend = self._scalar("""
            SELECT COALESCE(SUM(subtotal), 0) FROM purchase_orders WHERE hotel_id = :hid
        """)

        top3_list = [dict(r._mapping) for r in top3]
        top3_spend = sum(float(r.get("spend", 0)) for r in top3_list)
        concentration_pct = round(top3_spend / max(float(total_spend), 1) * 100, 1)

        total_suppliers_with_pos = self._scalar("""
            SELECT COUNT(DISTINCT vendor_id) FROM purchase_orders WHERE hotel_id = :hid
        """)

        risk_level = (
            "CRITICAL" if concentration_pct >= 80
            else "HIGH" if concentration_pct >= 60
            else "MODERATE" if concentration_pct >= 40
            else "LOW"
        )

        return {
            "hotel_id": self.hid,
            "concentration_pct": concentration_pct,
            "risk_level": risk_level,
            "top3_suppliers": top3_list,
            "top3_spend": float(top3_spend),
            "total_spend": float(total_spend),
            "total_suppliers_with_orders": total_suppliers_with_pos,
            "insight": (
                f"Top 3 suppliers account for {concentration_pct}% of procurement spend — "
                f"concentration risk is {risk_level}"
            )
        }

    def category_diversity(self) -> dict:
        """Supplier availability by category."""
        rows = self._q("""
            SELECT
                category,
                COUNT(*) AS total_suppliers,
                COUNT(*) FILTER (WHERE is_approved = TRUE) AS approved,
                COUNT(*) FILTER (WHERE blacklisted = TRUE) AS blacklisted,
                COUNT(*) FILTER (WHERE preferred_flag = TRUE) AS preferred,
                ROUND(AVG(COALESCE(rating, 0)), 2) AS avg_rating,
                ROUND(AVG(COALESCE(lead_time_days, 30)), 1) AS avg_lead_time
            FROM suppliers
            WHERE hotel_id = :hid
            GROUP BY category
            ORDER BY total_suppliers DESC
        """)
        return {
            "hotel_id": self.hid,
            "by_category": [dict(r._mapping) for r in rows],
            "total_categories": len(rows)
        }

    def recommendations(self) -> dict:
        """
        Prefer/Avoid recommendations based on performance scores.
        """
        scores = self.performance_scores(limit=200)
        preferred = [s for s in scores if s["recommendation"] in ("PREFERRED", "RELIABLE")][:10]
        avoid = [s for s in scores if s["recommendation"] in ("AVOID", "BLACKLISTED")][:10]
        monitor = [s for s in scores if s["recommendation"] == "MONITOR"][:10]

        insights = []
        blacklisted_count = sum(1 for s in scores if s.get("blacklisted"))
        if blacklisted_count > 0:
            insights.append({
                "type": "BLACKLISTED_SUPPLIERS",
                "severity": "CRITICAL",
                "message": f"{blacklisted_count} blacklisted suppliers detected in registry"
            })

        low_score = [s for s in scores if s["performance_score"] < 40]
        if low_score:
            insights.append({
                "type": "LOW_PERFORMANCE",
                "severity": "HIGH",
                "message": f"{len(low_score)} suppliers have performance score below 40/100"
            })

        high_risk = [s for s in scores if s.get("risk_level") in ("high", "critical")]
        if high_risk:
            insights.append({
                "type": "HIGH_RISK_SUPPLIERS",
                "severity": "MEDIUM",
                "message": f"{len(high_risk)} suppliers have high/critical risk level"
            })

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "preferred_suppliers": preferred,
            "avoid_suppliers": avoid,
            "monitor_suppliers": monitor,
            "insights": insights,
            "summary": {
                "preferred": len(preferred),
                "avoid": len(avoid),
                "monitor": len(monitor),
                "blacklisted": blacklisted_count
            }
        }

    def executive_summary(self) -> dict:
        """Executive supplier intelligence summary."""
        scores = self.performance_scores(limit=200)
        concentration = self.concentration_risk()
        diversity = self.category_diversity()

        total = len(scores)
        avg_score = round(sum(s["performance_score"] for s in scores) / max(total, 1), 1)

        grade_dist = {}
        rec_dist = {}
        for s in scores:
            grade_dist[s["grade"]] = grade_dist.get(s["grade"], 0) + 1
            rec_dist[s["recommendation"]] = rec_dist.get(s["recommendation"], 0) + 1

        insights = []
        blacklisted = rec_dist.get("BLACKLISTED", 0)
        if blacklisted > 0:
            insights.append({
                "type": "BLACKLISTED",
                "severity": "CRITICAL",
                "message": f"{blacklisted} blacklisted suppliers in registry"
            })
        if concentration["risk_level"] in ("HIGH", "CRITICAL"):
            insights.append({
                "type": "CONCENTRATION_RISK",
                "severity": concentration["risk_level"],
                "message": concentration["insight"]
            })
        if avg_score < 60:
            insights.append({
                "type": "LOW_FLEET_SCORE",
                "severity": "HIGH",
                "message": f"Average supplier performance score is {avg_score}/100 — below acceptable threshold"
            })

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "total_suppliers": total,
            "avg_performance_score": avg_score,
            "grade_distribution": grade_dist,
            "recommendation_distribution": rec_dist,
            "concentration_risk": {
                "pct": concentration["concentration_pct"],
                "level": concentration["risk_level"],
            },
            "categories": diversity["total_categories"],
            "insights": insights,
            "top_5_suppliers": scores[:5],
            "bottom_5_suppliers": scores[-5:] if len(scores) >= 5 else scores,
        }
