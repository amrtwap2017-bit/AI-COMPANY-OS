"""
Data Import Router — Triangle Black V6-C02
JSON body endpoints + separate file upload endpoints
"""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Body, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.data_import.service import DataImportService

router = APIRouter(prefix="/data-import", tags=["Data Import Engine"])

ENTITY_CHOICES = {"assets", "suppliers", "pm-plans"}


def _svc(db: Session = Depends(get_db)) -> DataImportService:
    return DataImportService(db=db)


# ── SCHEMA REFERENCE ─────────────────────────────────────────────────────────

@router.get("/schema/{entity}")
def get_schema(entity: str, current_user=Depends(get_current_user)):
    """Required and optional columns for each importable entity."""
    schemas = {
        "assets": {
            "required": ["name"],
            "optional": ["category", "criticality", "location",
                         "serial_number", "manufacturer", "model", "status"],
            "notes": {
                "criticality": "low | medium | high | critical  (default: medium)",
                "status": "operational | maintenance | decommissioned | standby",
            },
            "example_csv": "name,category,criticality\nChiller-1,HVAC,high\nPump-2,Plumbing,medium"
        },
        "suppliers": {
            "required": ["name"],
            "optional": ["category", "contact_email", "contact_phone",
                         "contact_name", "city", "country"],
            "example_csv": "name,category,contact_email\nABC Supply,HVAC,abc@supply.com"
        },
        "pm-plans": {
            "required": ["asset_name", "frequency_days"],
            "optional": ["next_due_date", "description", "priority"],
            "notes": {
                "frequency_days": "Days between maintenance  e.g. 30, 90, 365",
                "next_due_date": "ISO format: 2026-09-01"
            },
            "example_csv": "asset_name,frequency_days,description\nChiller-1,30,Monthly PM"
        }
    }
    if entity not in schemas:
        raise HTTPException(404, f"Unknown entity '{entity}'. Use: {list(schemas)}")
    return {"entity": entity, "schema": schemas[entity]}


# ── JSON BODY ENDPOINTS ───────────────────────────────────────────────────────

@router.post("/preview")
def preview_import_json(
    payload: dict = Body(...),
    entity: str = Query(default="assets"),
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    service: DataImportService = Depends(_svc),
):
    """Parse CSV string and return first 10 rows + schema. No DB write."""
    if entity not in ENTITY_CHOICES:
        raise HTTPException(400, f"entity must be one of: {', '.join(ENTITY_CHOICES)}")
    csv_content = payload.get("csv_content", "")
    if not csv_content.strip():
        raise HTTPException(400, "csv_content is required")
    return service.preview_csv(csv_content, entity)


@router.post("/validate")
def validate_import_json(
    payload: dict = Body(...),
    entity: str = Query(default="assets"),
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    service: DataImportService = Depends(_svc),
):
    """Full row-by-row validation. Returns errors per row. No DB write."""
    if entity not in ENTITY_CHOICES:
        raise HTTPException(400, f"entity must be one of: {', '.join(ENTITY_CHOICES)}")
    csv_content = payload.get("csv_content", "")
    if not csv_content.strip():
        raise HTTPException(400, "csv_content is required")
    return service.validate_csv(hotel_id, csv_content, entity)


@router.post("/assets")
def import_assets_json(
    payload: dict = Body(...),
    dry_run: bool = Query(default=False),
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    service: DataImportService = Depends(_svc),
):
    """Import assets from CSV string. dry_run=true counts without writing."""
    csv_content = payload.get("csv_content", "")
    if not csv_content.strip():
        raise HTTPException(400, "csv_content is required")
    return service.import_assets_csv(hotel_id, csv_content, dry_run=dry_run)


@router.post("/suppliers")
def import_suppliers_json(
    payload: dict = Body(...),
    dry_run: bool = Query(default=False),
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    service: DataImportService = Depends(_svc),
):
    """Import suppliers from CSV string. Required columns: name"""
    csv_content = payload.get("csv_content", "")
    if not csv_content.strip():
        raise HTTPException(400, "csv_content is required")
    return service.import_suppliers_csv(hotel_id, csv_content, dry_run=dry_run)


# ── FILE UPLOAD ENDPOINTS ─────────────────────────────────────────────────────

@router.post("/upload/assets")
async def import_assets_file(
    file: UploadFile = File(...),
    dry_run: bool = Form(default=False),
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    service: DataImportService = Depends(_svc),
):
    """Import assets from uploaded CSV file."""
    content = await file.read()
    csv_content = content.decode("utf-8-sig", errors="replace")
    if not csv_content.strip():
        raise HTTPException(400, "Uploaded file is empty")
    return service.import_assets_csv(hotel_id, csv_content, dry_run=dry_run)


@router.post("/upload/suppliers")
async def import_suppliers_file(
    file: UploadFile = File(...),
    dry_run: bool = Form(default=False),
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    service: DataImportService = Depends(_svc),
):
    """Import suppliers from uploaded CSV file."""
    content = await file.read()
    csv_content = content.decode("utf-8-sig", errors="replace")
    if not csv_content.strip():
        raise HTTPException(400, "Uploaded file is empty")
    return service.import_suppliers_csv(hotel_id, csv_content, dry_run=dry_run)


# ── IMPORT PM PLANS ──────────────────────────────────────────────────────────

@router.post("/pm-plans")
def import_pm_plans_json(
    payload: dict = Body(...),
    dry_run: bool = Query(default=False),
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    service: DataImportService = Depends(_svc),
):
    """Import PM plans from CSV. Required: title, plan_type. Optional: asset_name, frequency, next_due_date, owner, notes."""
    csv_content = payload.get("csv_content", "")
    if not csv_content.strip():
        raise HTTPException(400, "csv_content is required")
    return service.import_pm_plans_csv(hotel_id, csv_content, dry_run=dry_run)


@router.post("/upload/pm-plans")
async def import_pm_plans_file(
    file: UploadFile = File(...),
    dry_run: bool = Form(default=False),
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    service: DataImportService = Depends(_svc),
):
    """Import PM plans from uploaded CSV file."""
    content = await file.read()
    csv_content = content.decode("utf-8-sig", errors="replace")
    if not csv_content.strip():
        raise HTTPException(400, "Uploaded file is empty")
    return service.import_pm_plans_csv(hotel_id, csv_content, dry_run=dry_run)


# ── HISTORY ───────────────────────────────────────────────────────────────────

@router.get("/history")
def import_history(
    limit: int = Query(default=20, ge=1, le=100),
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    service: DataImportService = Depends(_svc),
):
    """Recent import audit records for this hotel."""
    records = service.get_import_history(hotel_id, limit)
    return {
        "hotel_id": hotel_id,
        "count": len(records),
        "records": records,
    }
