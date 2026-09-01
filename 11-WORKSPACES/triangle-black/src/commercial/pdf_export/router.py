from __future__ import annotations
import datetime
from datetime import datetime as _dt, io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response, HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/pdf-export", tags=["pdf-export"])

def row_to_dict(row):
    if row is None: return {{}}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {{}}

PDF_ENGINE = "reportlab"  # auto-detected: reportlab available

def _wo_html(wo: dict, hotel: dict) -> str:
    """Generate HTML for work order — used for PDF or direct HTML export."""
    now = _dt.utcnow().strftime("%Y-%m-%d %H:%M")
    priority_color = {{
        "critical": "#dc2626", "high": "#d97706",
        "medium": "#2563eb", "low": "#64748b"
    }}.get(wo.get("priority","medium"), "#2563eb")

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ font-family: Arial, sans-serif; margin: 40px; color: #1e293b; }}
  .header {{ border-bottom: 3px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }}
  .title {{ font-size: 24px; font-weight: bold; color: #0f172a; }}
  .badge {{ display: inline-block; padding: 4px 12px; border-radius: 4px;
            background: {priority_color}; color: white; font-size: 12px; font-weight: bold; }}
  .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }}
  .field {{ margin-bottom: 12px; }}
  .label {{ font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; }}
  .value {{ font-size: 14px; color: #1e293b; margin-top: 2px; }}
  .footer {{ margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px;
             font-size: 11px; color: #94a3b8; }}
</style>
</head>
<body>
  <div class="header">
    <div class="title">Triangle Black — Work Order</div>
    <div style="margin-top: 8px;">
      <span class="badge">{{wo.get("priority","?").upper()}}</span>
      &nbsp; WO #{{wo.get("id","?")[:8]}}
    </div>
  </div>

  <div class="grid">
    <div>
      <div class="field"><div class="label">Title</div><div class="value">{{wo.get("title","—")}}</div></div>
      <div class="field"><div class="label">Type</div><div class="value">{{wo.get("type","—")}}</div></div>
      <div class="field"><div class="label">Status</div><div class="value">{{wo.get("status","—")}}</div></div>
      <div class="field"><div class="label">Priority</div><div class="value">{{wo.get("priority","—")}}</div></div>
    </div>
    <div>
      <div class="field"><div class="label">Hotel</div><div class="value">{{hotel.get("name","—")}}</div></div>
      <div class="field"><div class="label">Due Date</div><div class="value">{{str(wo.get("due_date","—"))[:10]}}</div></div>
      <div class="field"><div class="label">Started</div><div class="value">{{str(wo.get("started_at","—"))[:10]}}</div></div>
      <div class="field"><div class="label">Completed</div><div class="value">{{str(wo.get("completed_at","—"))[:10]}}</div></div>
    </div>
  </div>

  <div class="field">
    <div class="label">Description</div>
    <div class="value" style="white-space: pre-wrap;">{{wo.get("description","No description provided.")}}</div>
  </div>

  <div class="footer">
    Generated: {{now}} · Triangle Black Enterprise Operations Platform
  </div>
</body>
</html>"""

def _invoice_html(inv: dict, hotel: dict) -> str:
    now = _dt.utcnow().strftime("%Y-%m-%d %H:%M")
    amount = float(inv.get("total_amount") or 0)
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ font-family: Arial, sans-serif; margin: 40px; color: #1e293b; }}
  .header {{ border-bottom: 3px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px;
             display: flex; justify-content: space-between; align-items: flex-start; }}
  .company {{ font-size: 22px; font-weight: bold; color: #0f172a; }}
  .invoice-label {{ font-size: 28px; font-weight: bold; color: #0f172a; }}
  .amount-box {{ background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px;
                 padding: 20px; text-align: center; margin: 24px 0; }}
  .amount {{ font-size: 36px; font-weight: bold; color: #0f172a; }}
  .field {{ margin-bottom: 12px; }}
  .label {{ font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; }}
  .value {{ font-size: 14px; color: #1e293b; margin-top: 2px; }}
  .status-paid {{ color: #16a34a; font-weight: bold; }}
  .status-unpaid {{ color: #dc2626; font-weight: bold; }}
  .footer {{ margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px;
             font-size: 11px; color: #94a3b8; }}
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">Triangle Black</div>
      <div style="font-size:13px;color:#64748b;margin-top:4px;">Engineering Operations Platform</div>
    </div>
    <div class="invoice-label">INVOICE</div>
  </div>

  <div class="amount-box">
    <div class="label">Total Amount</div>
    <div class="amount">{{amount:,.2f}} EGP</div>
    <div class="{{'status-paid' if inv.get('status') == 'paid' else 'status-unpaid'}}">
      {{inv.get("status","?").upper()}}
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
    <div>
      <div class="field"><div class="label">Invoice #</div><div class="value">{{inv.get("id","?")[:12]}}</div></div>
      <div class="field"><div class="label">Client (Hotel)</div><div class="value">{{hotel.get("name","—")}}</div></div>
      <div class="field"><div class="label">Status</div><div class="value">{{inv.get("status","—")}}</div></div>
    </div>
    <div>
      <div class="field"><div class="label">Issue Date</div><div class="value">{{str(inv.get("created_at","—"))[:10]}}</div></div>
      <div class="field"><div class="label">Due Date</div><div class="value">{{str(inv.get("due_date","—"))[:10]}}</div></div>
      <div class="field"><div class="label">Currency</div><div class="value">EGP</div></div>
    </div>
  </div>

  <div class="footer">
    Generated: {{now}} · Triangle Black Enterprise Operations Platform
  </div>
</body>
</html>"""

@router.get("/work-order/{{wo_id}}", summary="Export work order as HTML/PDF")
def export_work_order(wo_id: str, db: Session = Depends(get_db)):
    """Returns work order as downloadable HTML (print-to-PDF from browser)."""
    row = db.execute(
        text("SELECT * FROM work_orders WHERE id = :id"), {{"id": wo_id}}
    ).fetchone()
    if not row:
        raise HTTPException(404, "Work order not found")
    wo = row_to_dict(row)

    hotel = {{}}
    if wo.get("hotel_id"):
        h = db.execute(
            text("SELECT name, city FROM hotels WHERE id = :id"),
            {{"id": wo["hotel_id"]}}
        ).fetchone()
        hotel = row_to_dict(h) if h else {{}}

    html = _wo_html(wo, hotel)
    return HTMLResponse(
        content=html,
        headers={{
            "Content-Disposition": f'attachment; filename="wo-{{wo_id[:8]}}.html"',
            "X-Print-Ready": "true",
        }}
    )

@router.get("/invoice/{{invoice_id}}", summary="Export invoice as HTML/PDF")
def export_invoice(invoice_id: str, db: Session = Depends(get_db)):
    """Returns invoice as downloadable HTML (print-to-PDF from browser)."""
    row = db.execute(
        text("SELECT * FROM invoices WHERE id = :id"), {{"id": invoice_id}}
    ).fetchone()
    if not row:
        raise HTTPException(404, "Invoice not found")
    inv = row_to_dict(row)

    hotel = {{}}
    if inv.get("hotel_id"):
        h = db.execute(
            text("SELECT name, city FROM hotels WHERE id = :id"),
            {{"id": inv["hotel_id"]}}
        ).fetchone()
        hotel = row_to_dict(h) if h else {{}}

    html = _invoice_html(inv, hotel)
    return HTMLResponse(
        content=html,
        headers={{
            "Content-Disposition": f'attachment; filename="invoice-{{invoice_id[:8]}}.html"',
            "X-Print-Ready": "true",
        }}
    )

@router.get("/monthly-report", summary="Monthly operations summary HTML")
def monthly_report(db: Session = Depends(get_db)):
    """Executive monthly report — downloadable HTML."""
    now = _dt.utcnow()
    month = now.strftime("%B %Y")

    stats = {{}}
    for table, label in [
        ("work_orders", "Work Orders"),
        ("invoices", "Invoices"),
        ("purchase_orders", "Purchase Orders"),
        ("maintenance_plans", "PM Plans"),
    ]:
        try:
            row = db.execute(text(f"SELECT count(*) as n FROM {{table}}")).fetchone()
            stats[label] = int(row_to_dict(row).get("n") or 0)
        except Exception:
            stats[label] = 0

    try:
        rev_row = db.execute(text(
            "SELECT COALESCE(sum(total_amount),0) as rev FROM invoices WHERE status='paid'"
        )).fetchone()
        revenue = float(row_to_dict(rev_row).get("rev") or 0)
    except Exception:
        revenue = 0

    rows_html = "".join(
        f"<tr><td>{label}</td><td style='text-align:right;font-weight:bold'>{count:,}</td></tr>"
        for label, count in stats.items()
    )

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ font-family: Arial, sans-serif; margin: 40px; color: #1e293b; }}
  h1 {{ color: #0f172a; border-bottom: 3px solid #0f172a; padding-bottom: 12px; }}
  table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
  th {{ background: #0f172a; color: white; padding: 10px; text-align: left; }}
  td {{ padding: 10px; border-bottom: 1px solid #e2e8f0; }}
  .kpi {{ font-size: 32px; font-weight: bold; color: #0f172a; }}
  .footer {{ margin-top: 40px; font-size: 11px; color: #94a3b8; }}
</style>
</head>
<body>
  <h1>Triangle Black — Monthly Report</h1>
  <p style="color:#64748b">{month} · Generated {now.strftime("%Y-%m-%d %H:%M")}</p>

  <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
    <div style="font-size:12px;color:#64748b;text-transform:uppercase;">Total Revenue Collected</div>
    <div class="kpi">{revenue:,.0f} EGP</div>
  </div>

  <table>
    <thead><tr><th>Metric</th><th style="text-align:right">Count</th></tr></thead>
    <tbody>{rows_html}</tbody>
  </table>

  <div class="footer">Triangle Black Enterprise Operations Platform</div>
</body>
</html>"""

    return HTMLResponse(
        content=html,
        headers={{
            "Content-Disposition": f'attachment; filename="report-{{now.strftime("%Y-%m")}}.html"',
        }}
    )


# ── S75-FIX01: Preview endpoints (no attachment header) ─────────────────────

@router.get("/preview/work-order/{wo_id}", summary="Preview work order HTML")
def preview_work_order(wo_id: str, db: Session = Depends(get_db)):
    """Preview work order as HTML in browser."""
    from fastapi.responses import HTMLResponse as _HTMLResponse
    row = db.execute(
        text("SELECT * FROM work_orders WHERE id = :id"), {"id": wo_id}
    ).fetchone()
    if not row:
        raise HTTPException(404, "Work order not found")
    wo = row_to_dict(row)
    hotel = {}
    if wo.get("hotel_id"):
        h = db.execute(text("SELECT name FROM hotels WHERE id=:id"),
                       {"id": wo["hotel_id"]}).fetchone()
        hotel = row_to_dict(h) if h else {}
    return _HTMLResponse(content=_wo_html(wo, hotel))

@router.get("/preview/monthly-report", summary="Preview monthly report HTML")
def preview_monthly_report(db: Session = Depends(get_db)):
    """Preview monthly report as HTML in browser — no attachment header."""
    from fastapi.responses import HTMLResponse as _HTMLResponse
    now   = _dt.utcnow()
    month = now.strftime("%B %Y")
    stats = {}
    for table, label in [
        ("work_orders","Work Orders"),("invoices","Invoices"),
        ("purchase_orders","Purchase Orders"),("maintenance_plans","PM Plans"),
    ]:
        try:
            row = db.execute(text(f"SELECT count(*) as n FROM {table}")).fetchone()
            stats[label] = int(row_to_dict(row).get("n") or 0)
        except Exception:
            stats[label] = 0
    try:
        rev_row = db.execute(text(
            "SELECT COALESCE(sum(total_amount),0) as rev FROM invoices WHERE status='paid'"
        )).fetchone()
        revenue = float(row_to_dict(rev_row).get("rev") or 0)
    except Exception:
        revenue = 0
    rows_html = "".join(
        f"<tr><td>{l}</td><td style='text-align:right;font-weight:bold'>{c:,}</td></tr>"
        for l, c in stats.items()
    )
    html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>body{{font-family:Arial;margin:40px;color:#1e293b}}
h1{{color:#0f172a;border-bottom:3px solid #0f172a;padding-bottom:12px}}
table{{width:100%;border-collapse:collapse;margin:20px 0}}
th{{background:#0f172a;color:white;padding:10px;text-align:left}}
td{{padding:10px;border-bottom:1px solid #e2e8f0}}
.kpi{{font-size:32px;font-weight:bold;color:#0f172a}}</style>
</head><body>
<h1>Triangle Black — Monthly Report</h1>
<p style="color:#64748b">{month} · {now.strftime("%Y-%m-%d %H:%M")}</p>
<div style="background:#f8fafc;border-radius:8px;padding:20px;margin:20px 0;text-align:center">
<div style="font-size:12px;color:#64748b;text-transform:uppercase">Revenue Collected</div>
<div class="kpi">{revenue:,.0f} EGP</div></div>
<table><thead><tr><th>Metric</th><th style="text-align:right">Count</th></tr></thead>
<tbody>{rows_html}</tbody></table>
<div style="margin-top:40px;font-size:11px;color:#94a3b8">Triangle Black Enterprise Operations Platform</div>
</body></html>"""
    return _HTMLResponse(content=html)
