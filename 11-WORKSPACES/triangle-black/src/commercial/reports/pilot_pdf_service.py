"""
V12-005: Executive Pilot Report — PDF Generation
Uses reportlab (confirmed available) for customer-grade reporting.
Pulls data from pilot/baseline, pilot/roi, recommendations summary.
"""
from __future__ import annotations
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
import io

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.colors import HexColor, white, black
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, KeepTogether
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


# Triangle Black brand colors
TB_DARK = HexColor("#221D1A") if REPORTLAB_AVAILABLE else None
TB_CYAN = HexColor("#5B7C8C") if REPORTLAB_AVAILABLE else None
TB_GREEN = HexColor("#547C4D") if REPORTLAB_AVAILABLE else None
TB_AMBER = HexColor("#B07A2A") if REPORTLAB_AVAILABLE else None
TB_RED = HexColor("#A84A3D") if REPORTLAB_AVAILABLE else None


class PilotReportService:
    """
    Generates customer-grade PDF pilot reports.
    Content: Baseline → Progress → AI Recommendations → ROI → Next Steps
    """

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def generate_pilot_report(
        self,
        report_title: str = "Engineering Operations Intelligence Report",
        hotel_name: str = "Hotel Property",
        period_label: str = "30-Day Pilot Report",
    ) -> bytes:
        """Generate PDF bytes for download."""
        if not REPORTLAB_AVAILABLE:
            raise RuntimeError("reportlab not installed: pip install reportlab")

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=15*mm,
            leftMargin=15*mm,
            topMargin=20*mm,
            bottomMargin=20*mm,
        )

        styles = getSampleStyleSheet()
        story = []

        # Custom styles
        title_style = ParagraphStyle(
            'TBTitle',
            parent=styles['Title'],
            fontSize=22,
            textColor=white,
            alignment=TA_LEFT,
            spaceAfter=4,
        )
        heading_style = ParagraphStyle(
            'TBHeading',
            parent=styles['Heading1'],
            fontSize=14,
            textColor=TB_DARK,
            spaceBefore=12,
            spaceAfter=4,
        )
        body_style = ParagraphStyle(
            'TBBody',
            parent=styles['Normal'],
            fontSize=10,
            textColor=black,
            spaceAfter=4,
        )
        metric_style = ParagraphStyle(
            'TBMetric',
            parent=styles['Normal'],
            fontSize=18,
            textColor=TB_DARK,
            alignment=TA_CENTER,
        )

        # Cover section
        cover_data = [
            [Paragraph(f"<b>{report_title}</b>", title_style)],
            [Paragraph(f"{hotel_name}", ParagraphStyle('sub', parent=title_style, fontSize=14))],
            [Paragraph(period_label, ParagraphStyle('sub2', parent=title_style, fontSize=11))],
        ]
        cover_table = Table(cover_data, colWidths=[180*mm])
        cover_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), TB_DARK),
            ('TEXTCOLOR', (0,0), (-1,-1), white),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
        ]))
        story.append(cover_table)
        story.append(Spacer(1, 10*mm))

        # Get live data
        data = self._get_report_data()

        # Section 1: Executive Summary
        story.append(Paragraph("Executive Summary", heading_style))
        story.append(HRFlowable(width="100%", thickness=1, color=TB_CYAN))
        story.append(Spacer(1, 3*mm))

        confidence = data["data_quality"]["intelligence_confidence"]
        confidence_color = TB_GREEN if confidence == "HIGH" else TB_AMBER if confidence == "MEDIUM" else TB_RED

        summary_text = (
            f"This report summarizes operational performance for <b>{hotel_name}</b>. "
            f"Data confidence: <b>{confidence}</b>. "
            f"The platform has analyzed {data['wo']['total']:,} work orders, "
            f"{data['pm']['total']:,} PM plans, and generated {data['recs']['total']:,} "
            f"AI recommendations with a {data['recs']['acceptance_pct']}% acceptance rate."
        )
        story.append(Paragraph(summary_text, body_style))
        story.append(Spacer(1, 5*mm))

        # KPI Grid
        kpi_data = [
            [
                self._kpi_cell("Work Orders", str(data['wo']['total']), "total"),
                self._kpi_cell("WO→Asset", f"{data['wo']['linkage_pct']}%", "linkage"),
                self._kpi_cell("PM Plans", str(data['pm']['total']), "total"),
                self._kpi_cell("PM Compliance", f"{data['pm']['compliance_pct']}%", "compliance"),
            ],
            [
                self._kpi_cell("Critical WOs", str(data['wo']['critical']), "critical"),
                self._kpi_cell("Overdue PM", str(data['pm']['overdue']), "overdue"),
                self._kpi_cell("AI Recs", str(data['recs']['total']), "count"),
                self._kpi_cell("Acceptance", f"{data['recs']['acceptance_pct']}%", "rate"),
            ],
        ]
        kpi_table = Table(kpi_data, colWidths=[45*mm]*4)
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), HexColor("#F5F5F5")),
            ('GRID', (0,0), (-1,-1), 0.5, HexColor("#DDDDDD")),
            ('ROWBACKGROUNDS', (0,0), (-1,-1), [HexColor("#F8F8F8"), HexColor("#EFEFEF")]),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(kpi_table)
        story.append(Spacer(1, 8*mm))

        # Section 2: Work Order Analysis
        story.append(Paragraph("Work Order Intelligence", heading_style))
        story.append(HRFlowable(width="100%", thickness=1, color=TB_CYAN))
        story.append(Spacer(1, 3*mm))

        wo_rows = [
            ["Type", "Total", "Asset-Linked", "Linkage %"],
        ]
        for wt in data['wo']['by_type']:
            wo_rows.append([
                wt['type'].replace("_", " ").title(),
                str(wt['total']),
                str(wt['linked']),
                f"{wt['pct']}%",
            ])

        wo_table = Table(wo_rows, colWidths=[60*mm, 35*mm, 45*mm, 40*mm])
        wo_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), TB_DARK),
            ('TEXTCOLOR', (0,0), (-1,0), white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, HexColor("#DDDDDD")),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [white, HexColor("#F5F5F5")]),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(wo_table)
        story.append(Spacer(1, 8*mm))

        # Section 3: Maintenance Intelligence
        story.append(Paragraph("Preventive Maintenance", heading_style))
        story.append(HRFlowable(width="100%", thickness=1, color=TB_CYAN))
        story.append(Spacer(1, 3*mm))

        pm_text = (
            f"PM Plans: <b>{data['pm']['total']:,}</b> total | "
            f"Asset-linked: <b>{data['pm']['asset_linked']:,}</b> ({data['pm']['linkage_pct']}%) | "
            f"Overdue: <b>{data['pm']['overdue']:,}</b> | "
            f"Compliance: <b>{data['pm']['compliance_pct']}%</b>"
        )
        story.append(Paragraph(pm_text, body_style))
        story.append(Spacer(1, 5*mm))

        # Section 4: AI Recommendations
        story.append(Paragraph("AI Recommendations", heading_style))
        story.append(HRFlowable(width="100%", thickness=1, color=TB_CYAN))
        story.append(Spacer(1, 3*mm))

        rec_text = (
            f"Generated: <b>{data['recs']['total']:,}</b> | "
            f"Approved: <b>{data['recs']['approved']:,}</b> ({data['recs']['acceptance_pct']}% acceptance) | "
            f"Verified outcomes: <b>{data['recs']['with_outcome']:,}</b>"
        )
        story.append(Paragraph(rec_text, body_style))

        if data['recs']['with_outcome'] == 0:
            story.append(Paragraph(
                "<i>⚠ Outcome tracking is now active. Record outcomes as recommendations are actioned to build ROI evidence.</i>",
                ParagraphStyle('note', parent=body_style, textColor=TB_AMBER)
            ))
        story.append(Spacer(1, 5*mm))

        # Section 5: Data Quality
        story.append(Paragraph("Data Quality & Confidence", heading_style))
        story.append(HRFlowable(width="100%", thickness=1, color=TB_CYAN))
        story.append(Spacer(1, 3*mm))

        dq_text = (
            f"Intelligence confidence: <b>{confidence}</b> | "
            f"WO→Asset linkage: <b>{data['wo']['linkage_pct']}%</b> | "
            f"PM→Asset linkage: <b>{data['pm']['linkage_pct']}%</b><br/>"
            f"{data['data_quality']['primary_gap']}"
        )
        story.append(Paragraph(dq_text, body_style))
        story.append(Spacer(1, 8*mm))

        # Footer
        story.append(HRFlowable(width="100%", thickness=1, color=TB_DARK))
        story.append(Spacer(1, 3*mm))
        footer_text = (
            f"Generated by Triangle Black Engineering Intelligence Platform | "
            f"{datetime.now().strftime('%Y-%m-%d %H:%M')} | "
            f"Confidential — for internal use only"
        )
        story.append(Paragraph(footer_text, ParagraphStyle(
            'footer', parent=body_style, fontSize=8, textColor=HexColor("#888888")
        )))

        doc.build(story)
        buffer.seek(0)
        return buffer.read()

    def _kpi_cell(self, label: str, value: str, metric_type: str) -> Table:
        """Create a KPI cell for the grid."""
        styles = getSampleStyleSheet()
        val_style = ParagraphStyle('kval', parent=styles['Normal'],
                                   fontSize=16, alignment=TA_CENTER,
                                   textColor=TB_DARK, fontName='Helvetica-Bold')
        lbl_style = ParagraphStyle('klbl', parent=styles['Normal'],
                                   fontSize=8, alignment=TA_CENTER,
                                   textColor=HexColor("#666666"))
        cell = Table([[Paragraph(value, val_style)], [Paragraph(label, lbl_style)]])
        return cell

    def _get_report_data(self) -> Dict[str, Any]:
        """Pull all report data from database."""
        h = self.hotel_id
        try:
            # Work Orders
            wo_total = self.db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h"), {"h":h}).scalar() or 0
            wo_linked = self.db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND asset_id IS NOT NULL"), {"h":h}).scalar() or 0
            wo_critical = self.db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND priority='critical' AND status NOT IN ('completed','cancelled')"), {"h":h}).scalar() or 0

            wo_types = self.db.execute(text("""
                SELECT type, COUNT(*) as total, COUNT(asset_id) as linked
                FROM work_orders WHERE hotel_id=:h
                GROUP BY type ORDER BY total DESC LIMIT 8
            """), {"h":h}).fetchall()

            # PM
            pm_total = self.db.execute(text("SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h"), {"h":h}).scalar() or 0
            pm_linked = self.db.execute(text("SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h AND asset_node_id IS NOT NULL"), {"h":h}).scalar() or 0
            pm_active = self.db.execute(text("SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h AND status='active'"), {"h":h}).scalar() or 0
            pm_overdue = self.db.execute(text("SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h AND status='active' AND next_due_date < CURRENT_DATE"), {"h":h}).scalar() or 0

            # Recommendations
            recs_total = self.db.execute(text("SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h"), {"h":h}).scalar() or 0
            recs_approved = self.db.execute(text("SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h AND status='approved'"), {"h":h}).scalar() or 0
            recs_pending = self.db.execute(text("SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h AND status='pending'"), {"h":h}).scalar() or 0
            recs_with_outcome = self.db.execute(text("SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h AND outcome IS NOT NULL"), {"h":h}).scalar() or 0

            actionable = recs_approved + recs_pending
            acceptance_pct = round(recs_approved / max(actionable, 1) * 100, 1)
            pm_compliance = round((pm_active - pm_overdue) / max(pm_active, 1) * 100, 1)
            wo_linkage_pct = round(wo_linked / max(wo_total, 1) * 100, 1)
            pm_linkage_pct = round(pm_linked / max(pm_total, 1) * 100, 1)

            confidence = "HIGH" if wo_linkage_pct >= 70 else "MEDIUM" if wo_linkage_pct >= 40 else "LOW" if wo_linkage_pct >= 20 else "VERY_LOW"
            primary_gap = "WO→Asset linkage is low — intelligence reliability limited" if wo_linkage_pct < 30 else "Data quality is acceptable for pilot measurement"

            return {
                "wo": {
                    "total": int(wo_total),
                    "linked": int(wo_linked),
                    "critical": int(wo_critical),
                    "linkage_pct": wo_linkage_pct,
                    "by_type": [{"type": r[0], "total": r[1], "linked": r[2], "pct": round(r[2]/max(r[1],1)*100,1)} for r in wo_types],
                },
                "pm": {
                    "total": int(pm_total),
                    "asset_linked": int(pm_linked),
                    "overdue": int(pm_overdue),
                    "compliance_pct": pm_compliance,
                    "linkage_pct": pm_linkage_pct,
                },
                "recs": {
                    "total": int(recs_total),
                    "approved": int(recs_approved),
                    "pending": int(recs_pending),
                    "with_outcome": int(recs_with_outcome),
                    "acceptance_pct": acceptance_pct,
                },
                "data_quality": {
                    "intelligence_confidence": confidence,
                    "primary_gap": primary_gap,
                },
            }
        except Exception as e:
            return {"error": str(e), "wo": {"total": 0, "linked": 0, "critical": 0, "linkage_pct": 0, "by_type": []},
                    "pm": {"total": 0, "asset_linked": 0, "overdue": 0, "compliance_pct": 0, "linkage_pct": 0},
                    "recs": {"total": 0, "approved": 0, "pending": 0, "with_outcome": 0, "acceptance_pct": 0},
                    "data_quality": {"intelligence_confidence": "UNKNOWN", "primary_gap": "Error retrieving data"}}
