"""
Cost Intelligence Engine — Triangle Black A-010
Answers: "Where is money being spent, is it under control, and what are the trends?"

SCHEMA FACTS (verified):
- invoices: hotel_id, invoice_number, total_amount, status, due_date, created_at
  NO deleted_at column
  status: 'pending', 'paid', 'overdue', 'draft'
- purchase_orders: hotel_id, vendor_id, subtotal, total_amount, status, created_at
- assets: hotel_id, category, criticality, name, deleted_at
- work_orders: hotel_id, status, category, priority, created_at, deleted_at

DOES NOT DUPLICATE:
- /api/v1/baseline/report (maintenance_cost section)
- /api/v1/financial/gl/* (GL chart of accounts)

NEW VALUE:
- Monthly spend trend (6 months)
- Invoice aging analysis
- Cost efficiency score (0-100)
- Top cost drivers
- Spend velocity (month-over-month change)
- PO spend by vendor category
"""
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text


class CostIntelligenceService:
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

    def monthly_spend_trend(self) -> dict:
        """Invoice spend trend — last 6 months."""
        rows = self._q("""
            SELECT
                TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
                COUNT(*) AS invoice_count,
                COALESCE(SUM(total_amount), 0) AS total_spend,
                COALESCE(SUM(CASE WHEN LOWER(status)='paid' THEN total_amount ELSE 0 END), 0) AS paid_amount,
                COALESCE(SUM(CASE WHEN LOWER(status)='overdue' THEN total_amount ELSE 0 END), 0) AS overdue_amount,
                COALESCE(SUM(CASE WHEN LOWER(status)='pending' THEN total_amount ELSE 0 END), 0) AS pending_amount
            FROM invoices
            WHERE hotel_id = :hid
              AND created_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
        """)

        months = [dict(r._mapping) for r in rows]

        # Calculate month-over-month change
        for i, m in enumerate(months):
            if i > 0:
                prev = float(months[i-1].get("total_spend", 0))
                curr = float(m.get("total_spend", 0))
                if prev > 0:
                    m["mom_change_pct"] = round((curr - prev) / prev * 100, 1)
                else:
                    m["mom_change_pct"] = 0
            else:
                m["mom_change_pct"] = 0

        total_6m = sum(float(m.get("total_spend", 0)) for m in months)
        avg_monthly = round(total_6m / max(len(months), 1), 0)

        return {
            "hotel_id": self.hid,
            "period": "6_months",
            "months": months,
            "total_6m_spend": round(total_6m, 0),
            "avg_monthly_spend": avg_monthly,
            "trend_direction": (
                "INCREASING" if len(months) >= 2 and
                float(months[-1].get("total_spend", 0)) > float(months[0].get("total_spend", 0))
                else "DECREASING" if len(months) >= 2
                else "STABLE"
            )
        }

    def invoice_aging(self) -> dict:
        """Invoice aging — overdue analysis."""
        total_invoices = self._s("SELECT COUNT(*) FROM invoices WHERE hotel_id=:hid")
        total_amount = float(self._s(
            "SELECT COALESCE(SUM(total_amount),0) FROM invoices WHERE hotel_id=:hid", default=0))

        overdue_count = self._s("""
            SELECT COUNT(*) FROM invoices
            WHERE hotel_id=:hid AND LOWER(status)='overdue'
        """)
        overdue_amount = float(self._s("""
            SELECT COALESCE(SUM(total_amount),0) FROM invoices
            WHERE hotel_id=:hid AND LOWER(status)='overdue'
        """, default=0))

        paid_count = self._s("""
            SELECT COUNT(*) FROM invoices
            WHERE hotel_id=:hid AND LOWER(status)='paid'
        """)
        paid_amount = float(self._s("""
            SELECT COALESCE(SUM(total_amount),0) FROM invoices
            WHERE hotel_id=:hid AND LOWER(status)='paid'
        """, default=0))

        pending_count = self._s("""
            SELECT COUNT(*) FROM invoices
            WHERE hotel_id=:hid AND LOWER(status)='pending'
        """)
        pending_amount = float(self._s("""
            SELECT COALESCE(SUM(total_amount),0) FROM invoices
            WHERE hotel_id=:hid AND LOWER(status)='pending'
        """, default=0))

        overdue_pct = round(overdue_amount / max(total_amount, 1) * 100, 1)
        payment_rate = round(paid_amount / max(total_amount, 1) * 100, 1)

        aging_buckets = self._q("""
            SELECT
                CASE
                    WHEN due_date IS NULL THEN 'NO_DUE_DATE'
                    WHEN due_date >= NOW() THEN 'CURRENT'
                    WHEN due_date >= NOW() - INTERVAL '30 days' THEN '1_30_DAYS'
                    WHEN due_date >= NOW() - INTERVAL '60 days' THEN '31_60_DAYS'
                    WHEN due_date >= NOW() - INTERVAL '90 days' THEN '61_90_DAYS'
                    ELSE '90_PLUS_DAYS'
                END AS aging_bucket,
                COUNT(*) AS invoice_count,
                COALESCE(SUM(total_amount), 0) AS amount
            FROM invoices
            WHERE hotel_id=:hid AND LOWER(status) != 'paid'
            GROUP BY 1
            ORDER BY 1
        """)

        return {
            "hotel_id": self.hid,
            "total_invoices": total_invoices,
            "total_amount": round(total_amount, 0),
            "status_breakdown": {
                "overdue": {"count": overdue_count, "amount": round(overdue_amount, 0)},
                "pending": {"count": pending_count, "amount": round(pending_amount, 0)},
                "paid": {"count": paid_count, "amount": round(paid_amount, 0)},
            },
            "overdue_pct": overdue_pct,
            "payment_rate": payment_rate,
            "aging_buckets": [dict(r._mapping) for r in aging_buckets],
            "risk_level": (
                "CRITICAL" if overdue_pct >= 30
                else "HIGH" if overdue_pct >= 15
                else "MODERATE" if overdue_pct >= 5
                else "LOW"
            )
        }

    def top_cost_drivers(self, limit: int = 10) -> dict:
        """Top invoices by amount — cost concentration analysis."""
        rows = self._q("""
            SELECT
                invoice_number,
                total_amount,
                status,
                due_date,
                created_at
            FROM invoices
            WHERE hotel_id=:hid
            ORDER BY total_amount DESC
            LIMIT :lim
        """, {"hid": self.hid, "lim": limit})

        top_invoices = [dict(r._mapping) for r in rows]

        total_all = float(self._s(
            "SELECT COALESCE(SUM(total_amount),0) FROM invoices WHERE hotel_id=:hid", default=0))

        top_amount = sum(float(r.get("total_amount", 0)) for r in top_invoices)
        concentration_pct = round(top_amount / max(total_all, 1) * 100, 1)

        # PO spend by supplier top 5
        po_rows = self._q("""
            SELECT
                s.company_name,
                s.category AS supplier_category,
                COUNT(po.id) AS po_count,
                COALESCE(SUM(po.subtotal), 0) AS total_po_spend
            FROM purchase_orders po
            JOIN suppliers s ON s.id = po.vendor_id
            WHERE po.hotel_id=:hid
            GROUP BY s.company_name, s.category
            ORDER BY total_po_spend DESC
            LIMIT 5
        """)

        return {
            "hotel_id": self.hid,
            "top_invoices": top_invoices,
            "top_invoices_concentration_pct": concentration_pct,
            "top_po_suppliers": [dict(r._mapping) for r in po_rows],
        }

    def cost_efficiency_score(self) -> dict:
        """
        Cost Efficiency Score (0-100).
        Components:
        - Payment rate (paid/total): 40 pts max
        - Low overdue ratio: 30 pts max
        - Spend stability (low MoM variance): 30 pts max
        """
        total = float(self._s(
            "SELECT COALESCE(SUM(total_amount),0) FROM invoices WHERE hotel_id=:hid", default=0))
        paid = float(self._s("""
            SELECT COALESCE(SUM(total_amount),0) FROM invoices
            WHERE hotel_id=:hid AND LOWER(status)='paid'
        """, default=0))
        overdue = float(self._s("""
            SELECT COALESCE(SUM(total_amount),0) FROM invoices
            WHERE hotel_id=:hid AND LOWER(status)='overdue'
        """, default=0))

        payment_rate = paid / max(total, 1)
        overdue_rate = overdue / max(total, 1)

        payment_score = round(payment_rate * 40, 1)
        overdue_score = round((1 - overdue_rate) * 30, 1)

        # Spend stability — stddev of monthly amounts
        rows = self._q("""
            SELECT COALESCE(SUM(total_amount), 0) AS monthly_spend
            FROM invoices
            WHERE hotel_id=:hid AND created_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
        """)
        monthly_amounts = [float(r._mapping.get("monthly_spend", 0)) for r in rows]
        if len(monthly_amounts) >= 2:
            avg = sum(monthly_amounts) / len(monthly_amounts)
            variance = sum((x - avg) ** 2 for x in monthly_amounts) / len(monthly_amounts)
            cv = (variance ** 0.5) / max(avg, 1)  # coefficient of variation
            stability_score = round(max(0, 30 - cv * 30), 1)
        else:
            stability_score = 15.0

        total_score = round(payment_score + overdue_score + stability_score, 1)
        grade = "A" if total_score >= 80 else "B" if total_score >= 65 else "C" if total_score >= 50 else "D"

        return {
            "hotel_id": self.hid,
            "cost_efficiency_score": total_score,
            "grade": grade,
            "components": {
                "payment_rate_score": payment_score,
                "overdue_control_score": overdue_score,
                "spend_stability_score": stability_score,
            },
            "payment_rate_pct": round(payment_rate * 100, 1),
            "overdue_rate_pct": round(overdue_rate * 100, 1),
            "insight": (
                f"Cost efficiency: {total_score}/100 Grade {grade}. "
                f"Payment rate: {round(payment_rate*100,1)}%, "
                f"Overdue: {round(overdue_rate*100,1)}%"
            )
        }

    def summary(self) -> dict:
        """Executive cost intelligence summary."""
        trend = self.monthly_spend_trend()
        aging = self.invoice_aging()
        efficiency = self.cost_efficiency_score()
        drivers = self.top_cost_drivers(limit=5)

        total_po_spend = float(self._s("""
            SELECT COALESCE(SUM(subtotal), 0) FROM purchase_orders
            WHERE hotel_id=:hid
        """, default=0))

        total_invoice_spend = float(aging.get("total_amount", 0))

        insights = []
        if aging["risk_level"] in ("HIGH", "CRITICAL"):
            insights.append({
                "type": "OVERDUE_INVOICES",
                "severity": aging["risk_level"],
                "message": f"{aging['overdue_pct']}% of invoice value is overdue"
            })
        if trend.get("trend_direction") == "INCREASING":
            insights.append({
                "type": "INCREASING_SPEND",
                "severity": "MEDIUM",
                "message": "Maintenance spend trend is increasing over last 6 months"
            })
        if efficiency["cost_efficiency_score"] < 50:
            insights.append({
                "type": "LOW_COST_EFFICIENCY",
                "severity": "HIGH",
                "message": f"Cost efficiency score {efficiency['cost_efficiency_score']}/100 — below acceptable threshold"
            })

        return {
            "hotel_id": self.hid,
            "generated_at": datetime.utcnow().isoformat(),
            "total_invoice_spend": total_invoice_spend,
            "total_po_spend": round(total_po_spend, 0),
            "cost_efficiency_score": efficiency["cost_efficiency_score"],
            "cost_efficiency_grade": efficiency["grade"],
            "invoice_aging_risk": aging["risk_level"],
            "spend_trend_direction": trend.get("trend_direction"),
            "avg_monthly_spend": trend.get("avg_monthly_spend", 0),
            "overdue_amount": aging["status_breakdown"]["overdue"]["amount"],
            "pending_amount": aging["status_breakdown"]["pending"]["amount"],
            "insights": insights,
            "top_cost_drivers": drivers.get("top_invoices", [])[:3],
        }
