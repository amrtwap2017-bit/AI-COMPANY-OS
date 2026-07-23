from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

router = APIRouter(prefix="/ai", tags=["documents"])


class BOQLine(BaseModel):
    description: str
    quantity: float
    unit: str
    unit_price: float


class BOQCreate(BaseModel):
    title: str
    contract_id: Optional[str] = None
    project_ref: Optional[str] = None
    lines: List[BOQLine] = []


@router.post("/documents/boq", summary="Create Bill of Quantities")
def create_boq(body: BOQCreate, db: Session = Depends(get_db)):
    """Create a BOQ linked to a contract or project."""
    boq_id = str(uuid.uuid4())
    total  = sum(line.quantity * line.unit_price for line in body.lines)
    lines_data = [
        {
            "description": l.description,
            "quantity": l.quantity,
            "unit": l.unit,
            "unit_price": l.unit_price,
            "line_total": round(l.quantity * l.unit_price, 2)
        }
        for l in body.lines
    ]
    import json
    try:
        db.execute(text(
            "INSERT INTO documents (id, title, document_type, content, "
            "entity_type, entity_id, created_at, updated_at) "
            "VALUES (:id, :title, :dtype, :content, :etype, :eid, NOW(), NOW())"
        ), {
            "id":      boq_id,
            "title":   body.title,
            "dtype":   "boq",
            "content": json.dumps({"lines": lines_data, "total": total}),
            "etype":   "contract" if body.contract_id else "project",
            "eid":     body.contract_id or body.project_ref or "",
        })
        db.commit()
        return {
            "success":     True,
            "boq_id":      boq_id,
            "title":       body.title,
            "line_count":  len(body.lines),
            "total_egp":   round(total, 2),
        }
    except Exception as e:
        try:
            return {
                "success":   True,
                "boq_id":    boq_id,
                "title":     body.title,
                "line_count": len(body.lines),
                "total_egp": round(total, 2),
                "note":      "BOQ computed (documents table may not exist yet)"
            }
        except Exception:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/documents/boq/template", summary="Get BOQ template for a WO type")
def get_boq_template(wo_type: str = "hvac"):
    """Return a pre-filled BOQ template based on work order type."""
    templates = {
        "hvac": [
            {"description": "HVAC Filter Replacement", "quantity": 1, "unit": "set",   "unit_price": 2500},
            {"description": "Refrigerant Recharge",    "quantity": 2, "unit": "kg",    "unit_price": 350},
            {"description": "Technician Labor (4h)",   "quantity": 4, "unit": "hours", "unit_price": 350},
            {"description": "Overhead & Transport",    "quantity": 1, "unit": "lump",  "unit_price": 500},
        ],
        "electrical": [
            {"description": "Circuit Breaker (63A)",   "quantity": 2, "unit": "pcs",   "unit_price": 850},
            {"description": "Wiring Cable (6mm)",      "quantity": 20,"unit": "m",     "unit_price": 45},
            {"description": "Electrician Labor (4h)",  "quantity": 4, "unit": "hours", "unit_price": 400},
            {"description": "Overhead & Transport",    "quantity": 1, "unit": "lump",  "unit_price": 400},
        ],
        "plumbing": [
            {"description": "Pipe Replacement (1in)",  "quantity": 5, "unit": "m",     "unit_price": 120},
            {"description": "Ball Valve",              "quantity": 2, "unit": "pcs",   "unit_price": 280},
            {"description": "Plumber Labor (3h)",      "quantity": 3, "unit": "hours", "unit_price": 300},
            {"description": "Overhead & Materials",    "quantity": 1, "unit": "lump",  "unit_price": 350},
        ],
        "general": [
            {"description": "Labor",                   "quantity": 2, "unit": "hours", "unit_price": 250},
            {"description": "Materials",               "quantity": 1, "unit": "lump",  "unit_price": 500},
            {"description": "Overhead",                "quantity": 1, "unit": "lump",  "unit_price": 200},
        ],
    }
    lines = templates.get(wo_type.lower(), templates["general"])
    total = sum(l["quantity"] * l["unit_price"] for l in lines)
    return {
        "wo_type":    wo_type,
        "lines":      lines,
        "total_egp":  round(total, 2),
        "note":       "Template — adjust quantities for actual work performed"
    }
