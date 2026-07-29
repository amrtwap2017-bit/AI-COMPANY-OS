from __future__ import annotations
import csv
import io
import datetime
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db

router = APIRouter(prefix="/export", tags=["csv-export"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _make_csv(headers: list, rows: list) -> str:
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=headers, extrasaction="ignore")
    writer.writeheader()
    for row in rows:
        # Convert datetime objects to strings
        clean = {}
        for k, v in row.items():
            if hasattr(v, "isoformat"):
                clean[k] = v.isoformat()
            elif v is None:
                clean[k] = ""
            else:
                clean[k] = str(v)
        writer.writerow(clean)
    return output.getvalue()

def _csv_response(content: str, filename: str) -> StreamingResponse:
    return StreamingResponse(
        iter([content]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "text/csv; charset=utf-8",
        }
    )

@router.get("/work-orders", summary="Export work orders as CSV")
def export_work_orders(
    status:   str = Query(default=None),
    priority: str = Query(default=None),
    hotel_id: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """Download all work orders as CSV file."""
    where = "WHERE 1=1"
    params = {}
    if status:   where += " AND status = :status";   params["status"] = status
    if priority: where += " AND priority = :priority"; params["priority"] = priority
    if hotel_id: where += " AND hotel_id = :hotel_id"; params["hotel_id"] = hotel_id

    try:
        rows = db.execute(text(f"""
            SELECT id, hotel_id, title, description, type, priority, status,
                   technician_id, asset_id, due_date, started_at, completed_at, created_at
            FROM work_orders {where}
            ORDER BY created_at DESC
            LIMIT 5000
        """), params).fetchall()
        data = [row_to_dict(r) for r in rows]
    except Exception as e:
        data = []

    headers = ["id","hotel_id","title","description","type","priority","status",
               "technician_id","asset_id","due_date","started_at","completed_at","created_at"]
    now = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M")
    return _csv_response(_make_csv(headers, data), f"work_orders_{now}.csv")

@router.get("/assets", summary="Export assets as CSV")
def export_assets(
    hotel_id:    str = Query(default=None),
    criticality: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """Download all assets as CSV file."""
    where = "WHERE 1=1"
    params = {}
    if hotel_id:    where += " AND hotel_id = :hotel_id"; params["hotel_id"] = hotel_id
    if criticality: where += " AND criticality = :crit"; params["crit"] = criticality

    try:
        rows = db.execute(text(f"""
            SELECT id, hotel_id, name, category, criticality, status,
                   manufacturer, model, serial_number, location_description,
                   installation_date, service_frequency, created_at
            FROM assets {where}
            ORDER BY name
            LIMIT 5000
        """), params).fetchall()
        data = [row_to_dict(r) for r in rows]
    except Exception as e:
        data = []

    headers = ["id","hotel_id","name","category","criticality","status","manufacturer",
               "model","serial_number","location_description","installation_date","service_frequency","created_at"]
    now = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M")
    return _csv_response(_make_csv(headers, data), f"assets_{now}.csv")

@router.get("/invoices", summary="Export invoices as CSV")
def export_invoices(
    status:   str = Query(default=None),
    hotel_id: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """Download all invoices as CSV file."""
    where = "WHERE 1=1"
    params = {}
    if status:   where += " AND status = :status"; params["status"] = status
    if hotel_id: where += " AND hotel_id = :hotel_id"; params["hotel_id"] = hotel_id

    try:
        rows = db.execute(text(f"""
            SELECT id, hotel_id, status, total_amount, currency, due_date,
                   invoice_number, created_at
            FROM invoices {where}
            ORDER BY created_at DESC
            LIMIT 5000
        """), params).fetchall()
        data = [row_to_dict(r) for r in rows]
    except Exception as e:
        data = []

    headers = ["id","hotel_id","invoice_number","status","total_amount","currency","due_date","created_at"]
    now = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M")
    return _csv_response(_make_csv(headers, data), f"invoices_{now}.csv")

@router.get("/leads", summary="Export leads as CSV")
def export_leads(
    status: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """Download all leads as CSV file."""
    where = "" if not status else f"WHERE status = :status"
    params = {"status": status} if status else {}

    try:
        rows = db.execute(text(f"""
            SELECT id, title, status, priority, source,
                   company_name, contact_email, contact_phone,
                   expected_value, assigned_to, created_at
            FROM leads {where}
            ORDER BY created_at DESC
            LIMIT 5000
        """), params).fetchall()
        data = [row_to_dict(r) for r in rows]
    except Exception as e:
        data = []

    headers = ["id","title","status","priority","source","company_name",
               "contact_email","contact_phone","expected_value","assigned_to","created_at"]
    now = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M")
    return _csv_response(_make_csv(headers, data), f"leads_{now}.csv")

@router.get("/technicians", summary="Export technicians as CSV")
def export_technicians(db: Session = Depends(get_db)):
    """Download all technicians as CSV file."""
    try:
        rows = db.execute(text("""
            SELECT id, hotel_id, name, specializations, is_active,
                   max_work_orders, current_work_orders, created_at
            FROM technicians
            ORDER BY name
            LIMIT 1000
        """)).fetchall()
        data = [row_to_dict(r) for r in rows]
    except Exception as e:
        data = []

    headers = ["id","hotel_id","name","specializations","is_active",
               "max_work_orders","current_work_orders","created_at"]
    now = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M")
    return _csv_response(_make_csv(headers, data), f"technicians_{now}.csv")

@router.get("/vendors", summary="Export vendors as CSV")
def export_vendors(
    category: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """Download all vendors as CSV file."""
    where = "WHERE blacklisted=false"
    params = {}
    if category:
        where += " AND category = :cat"
        params["cat"] = category
    try:
        rows = db.execute(text(f"""
            SELECT id, vendor_code, company_name, category, contact_person,
                   email, phone, city, country, is_approved, rating,
                   total_orders, on_time_delivery_pct, quality_score,
                   payment_terms, currency, created_at
            FROM vendors {where}
            ORDER BY company_name
            LIMIT 1000
        """), params).fetchall()
        data = [row_to_dict(r) for r in rows]
    except Exception as e:
        data = []
    headers = ["id","vendor_code","company_name","category","contact_person",
               "email","phone","city","country","is_approved","rating",
               "total_orders","on_time_delivery_pct","quality_score",
               "payment_terms","currency","created_at"]
    now = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M")
    return _csv_response(_make_csv(headers, data), f"vendors_{now}.csv")


@router.get("/supplier-invoices", summary="Export supplier invoices as CSV")
def export_supplier_invoices(
    status: str = Query(default=None),
    vendor_id: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """Download all supplier invoices as CSV file."""
    where = "WHERE 1=1"
    params = {}
    if status:    where += " AND si.status = :status";      params["status"] = status
    if vendor_id: where += " AND si.vendor_id = :vid";      params["vid"] = vendor_id
    try:
        rows = db.execute(text(f"""
            SELECT si.id, si.invoice_number, si.status, si.currency,
                   si.subtotal, si.vat_amount, si.total_amount,
                   si.amount_paid, si.balance_due, si.payment_status,
                   si.due_date, si.po_id,
                   v.company_name as vendor_name, v.vendor_code,
                   si.notes, si.created_at
            FROM supplier_invoices si
            LEFT JOIN vendors v ON v.id = si.vendor_id
            {where}
            ORDER BY si.created_at DESC
            LIMIT 5000
        """), params).fetchall()
        data = [row_to_dict(r) for r in rows]
    except Exception as e:
        data = []
    headers = ["id","invoice_number","vendor_name","vendor_code","status","currency",
               "subtotal","vat_amount","total_amount","amount_paid","balance_due",
               "payment_status","due_date","po_id","notes","created_at"]
    now = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M")
    return _csv_response(_make_csv(headers, data), f"supplier_invoices_{now}.csv")


@router.get("/time-entries", summary="Export time entries as CSV")
def export_time_entries(
    technician_id: str = Query(default=None),
    work_order_id: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """Download all time entries as CSV file."""
    where = "WHERE 1=1"
    params = {}
    if technician_id: where += " AND te.technician_id = :tid"; params["tid"] = technician_id
    if work_order_id: where += " AND te.work_order_id = :woid"; params["woid"] = work_order_id
    try:
        rows = db.execute(text(f"""
            SELECT te.id, te.work_order_id, wo.title as work_order_title,
                   te.technician_id, t.name as technician_name,
                   te.work_type, te.hours_logged, te.hourly_rate, te.labor_cost,
                   te.is_billable, te.notes, te.start_time, te.end_time, te.created_at
            FROM time_entries te
            LEFT JOIN work_orders wo ON wo.id = te.work_order_id
            LEFT JOIN technicians t ON t.id = te.technician_id
            {where}
            ORDER BY te.created_at DESC
            LIMIT 10000
        """), params).fetchall()
        data = [row_to_dict(r) for r in rows]
    except Exception as e:
        data = []
    headers = ["id","work_order_id","work_order_title","technician_id","technician_name",
               "work_type","hours_logged","hourly_rate","labor_cost","is_billable",
               "notes","start_time","end_time","created_at"]
    now = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M")
    return _csv_response(_make_csv(headers, data), f"time_entries_{now}.csv")


@router.get("/purchase-orders", summary="Export purchase orders as CSV")
def export_purchase_orders(
    status: str = Query(default=None),
    vendor_id: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """Download all purchase orders as CSV file."""
    where = "WHERE 1=1"
    params = {}
    if status:    where += " AND po.status = :status";   params["status"] = status
    if vendor_id: where += " AND po.vendor_id = :vid";   params["vid"] = vendor_id
    try:
        rows = db.execute(text(f"""
            SELECT po.id, po.po_number, po.title, po.status, po.currency,
                   po.subtotal, po.vat_amount, po.total_amount,
                   po.payment_terms, po.delivery_date,
                   v.company_name as vendor_name, v.vendor_code,
                   po.approved_by, po.approved_at,
                   po.internal_notes, po.created_at
            FROM purchase_orders_v2 po
            LEFT JOIN vendors v ON v.id = po.vendor_id
            {where}
            ORDER BY po.created_at DESC
            LIMIT 5000
        """), params).fetchall()
        data = [row_to_dict(r) for r in rows]
    except Exception as e:
        data = []
    headers = ["id","po_number","title","vendor_name","vendor_code","status","currency",
               "subtotal","vat_amount","total_amount","payment_terms","delivery_date",
               "approved_by","approved_at","internal_notes","created_at"]
    now = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M")
    return _csv_response(_make_csv(headers, data), f"purchase_orders_{now}.csv")


@router.get("/scope-of-work", summary="Export scope of work as CSV")
def export_scope_of_work(
    status: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """Download all scope of work documents as CSV file."""
    where = "WHERE 1=1"
    params = {}
    if status: where += " AND status = :status"; params["status"] = status
    try:
        rows = db.execute(text(f"""
            SELECT id, sow_number, title, status, type, client_name,
                   currency, labor_cost, materials_cost, overhead_pct,
                   profit_margin_pct, total_cost, estimated_days,
                   prepared_by, approved_by, approved_at, created_at
            FROM scope_of_work {where}
            ORDER BY created_at DESC
            LIMIT 5000
        """), params).fetchall()
        data = [row_to_dict(r) for r in rows]
    except Exception as e:
        data = []
    headers = ["id","sow_number","title","status","type","client_name","currency",
               "labor_cost","materials_cost","overhead_pct","profit_margin_pct",
               "total_cost","estimated_days","prepared_by","approved_by","approved_at","created_at"]
    now = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M")
    return _csv_response(_make_csv(headers, data), f"scope_of_work_{now}.csv")
