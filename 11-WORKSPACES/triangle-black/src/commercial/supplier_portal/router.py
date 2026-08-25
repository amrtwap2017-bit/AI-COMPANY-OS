from __future__ import annotations
import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text, func
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.models import inventory_vendors, rfqs, rfq_vendor_quotes, purchase_orders

router = APIRouter(prefix="/supplier-portal")

@router.get("/vendors/{vendor_id}/dashboard")
def get_supplier_dashboard(vendor_id: int, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    try:
        vendor_query = text("""
            SELECT 
                iv.name AS vendor_name,
                COUNT(rf.id) FILTER (WHERE rf.status = 'open') AS open_rfqs,
                COUNT(po.id) AS active_pos,
                SUM(po.total_amount) AS total_revenue_egp,
                iv.rating,
                COUNT(q.id) FILTER (WHERE q.status = 'pending') AS pending_quotes
            FROM 
                inventory_vendors iv
            LEFT JOIN 
                rfq_vendor_quotes q ON iv.id = q.vendor_id AND q.status = 'pending'
            LEFT JOIN 
                rfqs rf ON q.rfq_id = rf.id
            LEFT JOIN 
                purchase_orders po ON iv.id = po.vendor_id AND po.status = 'active'
            WHERE 
                iv.id = :vendor_id
            GROUP BY 
                iv.name, iv.rating;
        """)
        vendor_result = db.execute(vendor_query, {"vendor_id": vendor_id}).fetchone()
        
        if not vendor_result:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        return {
            "vendor_name": vendor_result.vendor_name,
            "open_rfqs": vendor_result.open_rfqs,
            "active_pos": vendor_result.active_pos,
            "total_revenue_egp": vendor_result.total_revenue_egp,
            "rating": vendor_result.rating,
            "pending_quotes": vendor_result.pending_quotes
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/vendors/{vendor_id}/rfqs")
def get_supplier_rfqs(vendor_id: int, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    try:
        rfq_query = text("""
            SELECT 
                rf.id,
                rf.title,
                rf.status,
                rf.created_at,
                rf.required_date
            FROM 
                rfqs rf
            JOIN 
                rfq_vendor_quotes q ON rf.id = q.rfq_id AND q.vendor_id = :vendor_id;
        """)
        rfq_results = db.execute(rfq_query, {"vendor_id": vendor_id}).fetchall()
        
        return [row_to_dict(row) for row in rfq_results]
    except Exception as e:
        return {"error": str(e)}

@router.post("/vendors/{vendor_id}/quote")
def post_supplier_quote(vendor_id: int, data: Dict[str, Any], hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    try:
        quote_query = text("""
            INSERT INTO rfq_vendor_quotes (id, rfq_id, vendor_id, unit_price, total_price, lead_time_days, notes, status)
            VALUES (:id, :rfq_id, :vendor_id, :unit_price, :total_price, :lead_time_days, :notes, 'pending')
            RETURNING id;
        """)
        quote_result = db.execute(quote_query, {
            "id": uuid.uuid4(),
            "rfq_id": data["rfq_id"],
            "vendor_id": vendor_id,
            "unit_price": data["unit_price"],
            "total_price": data["total_price"],
            "lead_time_days": data.get("lead_time_days", 0),
            "notes": data.get("notes", "")
        })
        db.commit()
        
        return {
            "success": True,
            "quote_id": quote_result.scalar(),
            "message": "Quote submitted successfully"
        }
    except Exception as e:
        return {"error": str(e)}

def row_to_dict(row):
    return {column.name: getattr(row, column.name) for column in row.__table__.columns}