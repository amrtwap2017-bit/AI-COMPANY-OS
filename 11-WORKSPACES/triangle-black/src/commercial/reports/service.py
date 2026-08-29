"""
Sprint 2 — Operational Summary PDF Report
Reads from all intelligence engines and produces a PDF report.
Uses: reportlab 5.0.0 (already installed)
"""
from __future__ import annotations
import io
import logging
from datetime import datetime, timezone
from typing import Dict, Any

from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger("tb.reports")

# ── reportlab imports ─────────────────────────────────────────────────────────
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, KeepTogether
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    logger.error("reportlab not available — PDF export disabled")


def _safe_float(v) -> float:
    try: return float(v or 0)
    except: return 0.0

def _safe_int(v) -> int:
    try: return int(v or 0)
    except: return 0

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class OperationalReportService:
    """Generates operational summary PDF from live DB data."""

    # Brand colors
    BRAND_DARK = colors.HexColor("#1A1A1A")
    BRAND_BRONZE = colors.HexColor("#B9924C")
    BRAND_GREEN = colors.HexColor("#22c55e")
    BRAND_RED = colors.HexColor("#ef4444")
    BRAND_AMBER = colors.HexColor("#f97316")
    BRAND_BLUE = colors.HexColor("#3b82f6")
    BRAND_GRAY = colors.HexColor("#6b7280")
    BRAND_LIGHT = colors.HexColor("#f5f4f1")
    BRAND_BORDER = colors.HexColor("#e5e1da")

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def _q(self, sql: str, params: dict = None) -> dict:
        try:
            row = self.db.execute(text(sql), params or {"h": self.hotel_id}).fetchone()
            return dict(row._mapping) if row and hasattr(row, "_mapping") else {}
        except Exception as e:
            try: self.db.rollback()
            except: pass
            return {}

    def _collect_data(self) -> Dict[str, Any]:
        """Collect all KPIs from DB in one pass."""
        H = self.hotel_id
        data = {}

        # Health score components
        wo = self._q("""
            SELECT COUNT(*) AS total,
                   SUM(CASE WHEN status='completed' THEN 1 END) AS completed,
                   SUM(CASE WHEN status NOT IN ('completed','cancelled') THEN 1 END) AS open,
                   SUM(CASE WHEN priority IN ('critical','emergency')
                            AND status NOT IN ('completed','cancelled') THEN 1 END) AS critical_open
            FROM work_orders WHERE hotel_id=:h
        """)
        total_wos = _safe_int(wo.get("total")) or 1
        data["wo_completion_rate"] = round(_safe_float(wo.get("completed")) / total_wos * 100, 1)
        data["open_wos"] = _safe_int(wo.get("open"))
        data["critical_open_wos"] = _safe_int(wo.get("critical_open"))
        data["total_wos"] = _safe_int(wo.get("total"))

        # PM compliance
        pm = self._q("""
            SELECT COUNT(*) AS total,
                   SUM(CASE WHEN status='completed' THEN 1 END) AS completed,
                   SUM(CASE WHEN next_due_date::DATE < CURRENT_DATE
                            AND status!='completed' THEN 1 END) AS overdue
            FROM maintenance_plans WHERE hotel_id=:h
        """)
        pm_total = _safe_int(pm.get("total")) or 1
        data["pm_compliance_rate"] = round(_safe_float(pm.get("completed")) / pm_total * 100, 1)
        data["pm_overdue"] = _safe_int(pm.get("overdue"))
        data["pm_total"] = _safe_int(pm.get("total"))

        # Assets
        ast = self._q("""
            SELECT COUNT(*) AS total,
                   SUM(CASE WHEN LOWER(criticality) IN ('critical','high') THEN 1 END) AS high_risk
            FROM assets WHERE hotel_id=:h
        """)
        data["total_assets"] = _safe_int(ast.get("total"))
        data["high_risk_assets"] = _safe_int(ast.get("high_risk"))

        # Suppliers
        sup = self._q("SELECT COUNT(*) AS total FROM suppliers WHERE hotel_id=:h")
        data["total_suppliers"] = _safe_int(sup.get("total"))

        # Procurement spend
        spend = self._q("""
            SELECT COALESCE(SUM(total_amount),0) AS total,
                   COUNT(*) AS pos,
                   COUNT(CASE WHEN status IN ('pending','draft') THEN 1 END) AS pending
            FROM purchase_orders WHERE hotel_id=:h
        """)
        data["total_spend"] = _safe_float(spend.get("total"))
        data["pending_pos"] = _safe_int(spend.get("pending"))
        data["total_pos"] = _safe_int(spend.get("pos"))

        # SLA
        data["sla_compliance_pct"] = 100.0  # from sla-engine
        try:
            sla_row = self.db.execute(text("""
                SELECT COUNT(*) AS total,
                       COUNT(CASE WHEN status NOT IN ('completed','cancelled')
                                  AND created_at < NOW() - INTERVAL '4 hours'
                                  AND priority='critical' THEN 1 END) AS breached
                FROM work_orders WHERE hotel_id=:h
            """), {"h": H}).fetchone()
            if sla_row:
                total_s = _safe_int(sla_row[0]) or 1
                breached = _safe_int(sla_row[1])
                data["sla_compliance_pct"] = round((1 - breached/total_s) * 100, 1)
                data["sla_breaches"] = breached
        except Exception:
            data["sla_breaches"] = 0

        # Recommendations
        try:
            rec = self.db.execute(text("""
                SELECT COUNT(*) AS total,
                       COUNT(CASE WHEN status='pending' THEN 1 END) AS pending,
                       COUNT(CASE WHEN risk_level='CRITICAL' AND status='pending' THEN 1 END) AS critical
                FROM recommendations WHERE hotel_id=:h
            """), {"h": H}).fetchone()
            if rec:
                data["rec_total"] = _safe_int(rec[0])
                data["rec_pending"] = _safe_int(rec[1])
                data["rec_critical"] = _safe_int(rec[2])
            else:
                data["rec_total"] = data["rec_pending"] = data["rec_critical"] = 0
        except Exception:
            data["rec_total"] = data["rec_pending"] = data["rec_critical"] = 0

        # Overall health score
        health = 100
        if data["wo_completion_rate"] < 70: health -= 15
        elif data["wo_completion_rate"] < 80: health -= 8
        if data["pm_compliance_rate"] < 65: health -= 15
        elif data["pm_compliance_rate"] < 80: health -= 8
        if data["sla_compliance_pct"] < 90: health -= 10
        if data["critical_open_wos"] >= 3: health -= 10
        data["health_score"] = max(0, min(100, health))
        data["health_grade"] = (
            "EXCELLENT" if data["health_score"] >= 90 else
            "GOOD" if data["health_score"] >= 75 else
            "WARNING" if data["health_score"] >= 60 else
            "CRITICAL"
        )

        # Cost avoidance estimate
        data["cost_avoidance_egp"] = round(data["total_spend"] * 0.10, 0)

        return data

    def generate_pdf(self) -> bytes:
        """Generate the operational summary PDF. Returns raw bytes."""
        if not REPORTLAB_AVAILABLE:
            raise RuntimeError("reportlab not installed")

        data = self._collect_data()
        buf = io.BytesIO()

        doc = SimpleDocTemplate(
            buf,
            pagesize=A4,
            leftMargin=15*mm,
            rightMargin=15*mm,
            topMargin=15*mm,
            bottomMargin=15*mm,
            title="Triangle Black — Operational Intelligence Report",
            author="Triangle Black Platform",
        )

        styles = getSampleStyleSheet()
        story = []

        def H(level, text, color=None):
            size = {1: 18, 2: 13, 3: 11}.get(level, 10)
            return Paragraph(
                f'<font color="#{(color or "1A1A1A").lstrip("#")}">'
                f'<b>{text}</b></font>',
                ParagraphStyle(
                    f"h{level}", parent=styles["Normal"],
                    fontSize=size,
                    spaceAfter=3*mm if level > 1 else 5*mm,
                    spaceBefore=3*mm if level > 1 else 0,
                )
            )

        def P(text, color="#374151", size=9):
            return Paragraph(
                f'<font color="{color}" size="{size}">{text}</font>',
                ParagraphStyle("p", parent=styles["Normal"],
                               fontSize=size, spaceAfter=2*mm)
            )

        def kpi_table(rows, col_widths=None):
            if col_widths is None:
                col_widths = [45*mm, 40*mm, 40*mm, 45*mm]
            t = Table(rows, colWidths=col_widths)
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), self.BRAND_LIGHT),
                ("TEXTCOLOR", (0, 0), (-1, 0), self.BRAND_DARK),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1),
                 [colors.white, self.BRAND_LIGHT]),
                ("GRID", (0, 0), (-1, -1), 0.5, self.BRAND_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4*mm),
                ("TOPPADDING", (0, 0), (-1, -1), 2.5*mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5*mm),
            ]))
            return t

        # ── HEADER ────────────────────────────────────────────────────────────
        header_data = [[
            Paragraph('<font size="20" color="#B9924C"><b>TRIANGLE BLACK</b></font>',
                      styles["Normal"]),
            Paragraph(
                f'<font size="9" color="#6b7280">'
                f'Operational Intelligence Report<br/>'
                f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}<br/>'
                f'Hotel: {self.hotel_id[-20:]}</font>',
                ParagraphStyle("right", parent=styles["Normal"],
                               alignment=TA_RIGHT, fontSize=9)
            ),
        ]]
        header_t = Table(header_data, colWidths=[95*mm, 85*mm])
        header_t.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LINEBELOW", (0, 0), (-1, 0), 1.5, self.BRAND_BRONZE),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 4*mm),
        ]))
        story.append(header_t)
        story.append(Spacer(1, 4*mm))

        # ── SECTION 1: HEALTH SCORE ───────────────────────────────────────────
        grade_color = {
            "EXCELLENT": "#22c55e", "GOOD": "#3b82f6",
            "WARNING": "#f97316", "CRITICAL": "#ef4444"
        }.get(data["health_grade"], "#6b7280")

        story.append(H(2, "1. OPERATIONAL HEALTH OVERVIEW"))
        health_data = [
            ["Metric", "Value", "Status"],
            ["Overall Health Score",
             f'{data["health_score"]}/100',
             data["health_grade"]],
            ["WO Completion Rate",
             f'{data["wo_completion_rate"]}%',
             "GOOD" if data["wo_completion_rate"] >= 70 else "WARNING"],
            ["PM Compliance",
             f'{data["pm_compliance_rate"]}%',
             "GOOD" if data["pm_compliance_rate"] >= 65 else "CRITICAL"],
            ["SLA Compliance",
             f'{data["sla_compliance_pct"]}%',
             "GOOD" if data["sla_compliance_pct"] >= 95 else "WARNING"],
        ]
        t = Table(health_data, colWidths=[80*mm, 50*mm, 50*mm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), self.BRAND_DARK),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1),
             [colors.white, self.BRAND_LIGHT]),
            ("GRID", (0, 0), (-1, -1), 0.5, self.BRAND_BORDER),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4*mm),
            ("TOPPADDING", (0, 0), (-1, -1), 2.5*mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5*mm),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ]))
        story.append(t)
        story.append(Spacer(1, 4*mm))

        # ── SECTION 2: MAINTENANCE ────────────────────────────────────────────
        story.append(H(2, "2. MAINTENANCE INTELLIGENCE"))
        maint_data = [
            ["Indicator", "Value", "Target", "Status"],
            ["PM Plans Total", str(data["pm_total"]), "—", "—"],
            ["PM Compliance Rate",
             f'{data["pm_compliance_rate"]}%', "85%",
             "BELOW TARGET" if data["pm_compliance_rate"] < 85 else "ON TARGET"],
            ["Overdue PM Plans",
             str(data["pm_overdue"]), "0",
             "ACTION NEEDED" if data["pm_overdue"] > 0 else "CLEAR"],
            ["Total Work Orders", str(data["total_wos"]), "—", "—"],
            ["Open Work Orders",
             str(data["open_wos"]), "< 50",
             "REVIEW" if data["open_wos"] > 100 else "ACCEPTABLE"],
            ["Critical/Emergency Open",
             str(data["critical_open_wos"]), "0",
             "URGENT" if data["critical_open_wos"] > 0 else "CLEAR"],
        ]
        story.append(kpi_table(maint_data,
                               [65*mm, 35*mm, 35*mm, 45*mm]))
        story.append(Spacer(1, 4*mm))

        # ── SECTION 3: PROCUREMENT ────────────────────────────────────────────
        story.append(H(2, "3. PROCUREMENT INTELLIGENCE"))
        proc_data = [
            ["Indicator", "Value", "Status"],
            ["Total Suppliers", str(data["total_suppliers"]), "—"],
            ["Total PO Spend",
             f'EGP {data["total_spend"]:,.0f}', "TRACKED"],
            ["Pending Approvals",
             str(data["pending_pos"]),
             "REVIEW" if data["pending_pos"] > 50 else "NORMAL"],
            ["Est. Cost Avoidance Potential",
             f'EGP {data["cost_avoidance_egp"]:,.0f}',
             "OPPORTUNITY"],
        ]
        story.append(kpi_table(proc_data, [75*mm, 55*mm, 50*mm]))
        story.append(Spacer(1, 4*mm))

        # ── SECTION 4: ASSET OVERVIEW ─────────────────────────────────────────
        story.append(H(2, "4. ASSET OVERVIEW"))
        asset_data = [
            ["Indicator", "Value", "Notes"],
            ["Total Assets Under Management",
             str(data["total_assets"]), "All categories"],
            ["High-Risk Assets",
             str(data["high_risk_assets"]),
             "Criticality = critical/high"],
            ["High-Risk %",
             f'{round(data["high_risk_assets"]/max(data["total_assets"],1)*100,1)}%',
             "Target: < 20%"],
        ]
        story.append(kpi_table(asset_data, [80*mm, 40*mm, 60*mm]))
        story.append(Spacer(1, 4*mm))

        # ── SECTION 5: AI RECOMMENDATIONS ────────────────────────────────────
        story.append(H(2, "5. AI RECOMMENDATIONS"))
        rec_data = [
            ["Category", "Count", "Action Required"],
            ["Total Recommendations Generated",
             str(data["rec_total"]), "—"],
            ["Pending Human Review",
             str(data["rec_pending"]),
             "REVIEW" if data["rec_pending"] > 0 else "CLEAR"],
            ["Critical Priority Pending",
             str(data["rec_critical"]),
             "URGENT" if data["rec_critical"] > 0 else "CLEAR"],
        ]
        story.append(kpi_table(rec_data, [90*mm, 35*mm, 55*mm]))
        story.append(Spacer(1, 4*mm))

        # ── SECTION 6: ROI ESTIMATE ───────────────────────────────────────────
        story.append(H(2, "6. ROI & COST AVOIDANCE"))
        roi_data = [
            ["Metric", "Value", "Methodology"],
            ["Total Operational Spend",
             f'EGP {data["total_spend"]:,.0f}',
             "Tracked purchase orders"],
            ["PM Compliance Gap",
             f'{max(0, 85-data["pm_compliance_rate"]):.1f}%',
             "vs 85% industry target"],
            ["Estimated Cost Avoidance",
             f'EGP {data["cost_avoidance_egp"]:,.0f}',
             "10% via PM improvement"],
        ]
        story.append(kpi_table(roi_data, [70*mm, 50*mm, 60*mm]))
        story.append(Spacer(1, 4*mm))

        # ── FOOTER ────────────────────────────────────────────────────────────
        story.append(HRFlowable(width="100%", thickness=1,
                                color=self.BRAND_BORDER))
        story.append(Spacer(1, 2*mm))
        story.append(P(
            f"Generated by Triangle Black Operations Intelligence Platform · "
            f"{datetime.now().strftime('%Y-%m-%d %H:%M UTC')} · "
            f"Confidential — for authorized recipients only",
            color="#9ca3af", size=8
        ))
        story.append(P(
            "This report is advisory. All recommendations require human "
            "review and approval before any action is taken.",
            color="#9ca3af", size=8
        ))

        doc.build(story)
        return buf.getvalue()

    def generate_summary_dict(self) -> Dict[str, Any]:
        """JSON summary (no PDF) for API response."""
        data = self._collect_data()
        return {
            "hotel_id": self.hotel_id,
            "report_type": "OPERATIONAL_SUMMARY",
            "generated_at": _now_iso(),
            "health_score": data["health_score"],
            "health_grade": data["health_grade"],
            "sections": {
                "maintenance": {
                    "wo_completion_rate_pct": data["wo_completion_rate"],
                    "pm_compliance_rate_pct": data["pm_compliance_rate"],
                    "pm_overdue": data["pm_overdue"],
                    "open_wos": data["open_wos"],
                    "critical_open_wos": data["critical_open_wos"],
                },
                "procurement": {
                    "total_spend_egp": data["total_spend"],
                    "pending_approvals": data["pending_pos"],
                    "cost_avoidance_potential_egp": data["cost_avoidance_egp"],
                },
                "assets": {
                    "total": data["total_assets"],
                    "high_risk": data["high_risk_assets"],
                },
                "recommendations": {
                    "total": data["rec_total"],
                    "pending": data["rec_pending"],
                    "critical_pending": data["rec_critical"],
                },
            },
            "recommendation": (
                f"Health score {data['health_score']}/100. "
                f"PM compliance at {data['pm_compliance_rate']}% — "
                f"{'below' if data['pm_compliance_rate'] < 85 else 'near'} 85% target. "
                f"EGP {data['cost_avoidance_egp']:,.0f} cost avoidance identified."
            ),
        }
