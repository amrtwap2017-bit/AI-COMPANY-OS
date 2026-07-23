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
