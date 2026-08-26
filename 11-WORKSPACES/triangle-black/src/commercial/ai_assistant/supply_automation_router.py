from __future__ import annotations
from fastapi import APIRouter, Query, HTTPException
from sqlalchemy import text
from src.core.database import get_db
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/ai", tags=["supply-automation"])

DB_URL = "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"

CATEGORY_MAP = {
    "hvac":        ["HVAC", "Refrigeration", "Air Conditioning", "Cooling", "Ventilation"],
    "electrical":  ["Electrical", "Generator", "UPS", "Lighting", "Switchgear"],
    "plumbing":    ["Plumbing", "Pumps", "Water", "Sanitary", "Pipes"],
    "mechanical":  ["Mechanical", "Elevators", "Compressors", "Bearings", "Motors"],
    "civil":       ["Civil", "Finishing", "Tiles", "Waterproofing"],
    "fire":        ["Fire Alarm", "Fire Fighting", "Safety", "Sprinklers"],
    "cleaning":    ["Pool", "Chemical", "Cleaning", "Janitorial"],
}


@router.get("/supply/inventory-check", summary="Check inventory for work order type")
def inventory_check(
    work_order_type: str = Query(..., description="hvac, electrical, plumbing, etc."),
    hotel_id: str = Query("tb-default-hotel-000000000001"),
):
    categories = CATEGORY_MAP.get(work_order_type.lower(), [work_order_type])
    available = []
    below_minimum = []
    out_of_stock = []

    try:
        db = next(get_db())
        with db as session:
            cat_params = {"hotel_id": hotel_id}
            where_parts = []
            for i, c in enumerate(categories):
                key = f"cat{i}"
                cat_params[key] = f"%{c}%"
                where_parts.append(f"LOWER(ii.category) LIKE LOWER(:{key})")
            where_clause = " OR ".join(where_parts)

            rows = session.execute(text(
                "SELECT ii.id, ii.name, ii.category, ii.unit_of_measure, "
                "ii.min_stock, ii.max_stock, ii.reorder_qty, "
                "COALESCE(sb.qty_on_hand, 0) as qty_on_hand, "
                "COALESCE(sb.qty_available, 0) as qty_available "
                "FROM inventory_items ii "
                "LEFT JOIN stock_balances sb ON sb.item_id = ii.id "
                "AND sb.hotel_id = :hotel_id "
                "WHERE ii.hotel_id = :hotel_id "
                f"AND ({where_clause}) "
                "ORDER BY ii.category, ii.name LIMIT 50"
            ), cat_params).fetchall()

            for row in rows:
                item = {
                    "id": row.id,
                    "name": row.name,
                    "category": row.category,
                    "unit": row.unit_of_measure,
                    "qty_on_hand": row.qty_on_hand,
                    "qty_available": row.qty_available,
                    "min_stock": row.min_stock or 0,
                }
                if row.qty_available <= 0:
                    out_of_stock.append(item)
                elif row.qty_on_hand < (row.min_stock or 0):
                    below_minimum.append(item)
                else:
                    available.append(item)

    except Exception as e:
        return {
            "available": [], "below_minimum": [], "out_of_stock": [],
            "error": str(e), "work_order_type": work_order_type,
        }

    return {
        "work_order_type": work_order_type,
        "categories_searched": categories,
        "available": available,
        "below_minimum": below_minimum,
        "out_of_stock": out_of_stock,
        "summary": {
            "available_count": len(available),
            "below_minimum_count": len(below_minimum),
            "out_of_stock_count": len(out_of_stock),
        }
    }


class AutoPRRequest(BaseModel):
    work_order_id: str
    notes: Optional[str] = ""
    requester: Optional[str] = "System Auto-PR"


@router.post("/supply/auto-pr", summary="Auto-create Purchase Request from Work Order")
def auto_create_pr(body: AutoPRRequest):
    try:
        db = next(get_db())
        with db as session:
            wo = session.execute(text(
                "SELECT id, hotel_id, title, type, priority FROM work_orders WHERE id = :wid"
            ), {"wid": body.work_order_id}).fetchone()

            if not wo:
                raise HTTPException(status_code=404, detail=f"Work order {body.work_order_id} not found")

            pr_id = str(uuid.uuid4())
            pr_number = f"AUTO-PR-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
            categories = CATEGORY_MAP.get(wo.type or "general", [wo.type or "General"])
            justification = (
                f"Auto-generated from Work Order: {wo.title}. "
                f"Type: {wo.type}. "
                f"Required categories: {', '.join(categories)}. "
                f"{body.notes}"
            ).strip()

            session.execute(text(
                "INSERT INTO purchase_requests "
                "(id, hotel_id, pr_number, requester, department, urgency, "
                "status, priority, justification, lines, request_type, created_at, updated_at) "
                "VALUES "
                "(:id, :hotel_id, :pr_number, :requester, :dept, :urgency, "
                "'draft', :priority, :justification, '[]', 'maintenance_supply', NOW(), NOW())"
            ), {
                "id": pr_id,
                "hotel_id": wo.hotel_id,
                "pr_number": pr_number,
                "requester": body.requester,
                "dept": "Engineering",
                "urgency": "urgent" if wo.priority == "critical" else "normal",
                "priority": wo.priority or "medium",
                "justification": justification,
            })
            conn.commit()

        return {
            "success": True,
            "pr_id": pr_id,
            "pr_number": pr_number,
            "status": "draft",
            "work_order_id": body.work_order_id,
            "categories_required": categories,
            "message": f"Purchase Request {pr_number} created successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
