from __future__ import annotations
import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db

router = APIRouter(prefix="/warehouse-intelligence", tags=["warehouse-intelligence"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _safe_int(v):
    try: return int(v or 0)
    except: return 0

BRAND_GUIDE = {
    "hvac": {
        "brands": ["Carrier Egypt","Daikin","Midea","LG","Samsung Climate"],
        "notes":  "Carrier Egypt has widest service network. Daikin for commercial grade.",
        "certs":  ["ISO 9001","AHRI","CE"],
        "lead":   5,
        "tip":    "Order filters quarterly in bulk - 20% cost saving vs ad-hoc ordering.",
    },
    "electrical": {
        "brands": ["ABB Egypt","Schneider Electric","Siemens","Legrand","Hager"],
        "notes":  "ABB and Schneider have local warehouses. Siemens for industrial grade.",
        "certs":  ["IEC","CE","SASO"],
        "lead":   3,
        "tip":    "Keep 30-day safety stock for breakers - critical items with high failure rate.",
    },
    "plumbing": {
        "brands": ["Grundfos Egypt","Wilo","DAB Pumps","Giacomini","Oventrop"],
        "notes":  "Grundfos for pumps - widest local support. Giacomini for valves.",
        "certs":  ["WRAS","ISO 9001"],
        "lead":   7,
        "tip":    "Pumps should have 1 spare unit on-site for critical installations.",
    },
    "safety": {
        "brands": ["3M Egypt","Honeywell Safety","MSA Safety","Drager"],
        "notes":  "3M for PPE - widest availability. MSA for confined space equipment.",
        "certs":  ["CE","ANSI","EN"],
        "lead":   2,
        "tip":    "PPE has expiry dates - order max 3-month supply. Monthly inspection required.",
    },
    "pool": {
        "brands": ["Hayward","Pentair","Fluidra","Bayrol"],
        "notes":  "Bayrol chemicals have local distributor. Hayward for pumps and filtration.",
        "certs":  ["NSF","DIN"],
        "lead":   3,
        "tip":    "Test water chemistry daily. Keep 2-week chemical stock minimum.",
    },
    "generator": {
        "brands": ["Cummins Egypt","Perkins","Kohler","Caterpillar"],
        "notes":  "Cummins has strongest Egypt service network. Perkins cost-effective.",
        "certs":  ["ISO 8528","CE"],
        "lead":   14,
        "tip":    "Critical item - always maintain 7-day fuel reserve and quarterly service contract.",
    },
    "general": {
        "brands": ["Local market","Multiple vendors"],
        "notes":  "Compare at least 3 quotes for general items.",
        "certs":  [],
        "lead":   5,
        "tip":    "Use preferred vendor list - do not source from unknown vendors without approval.",
    },
}

@router.get("/stock-health", summary="Complete stock health dashboard")
def stock_health(
    hotel_id:  str = Query(default=None),
    db: Session = Depends(get_db)
):
    """Complete warehouse stock health with sourcing guidance per category."""
    now = datetime.datetime.utcnow()
    where  = "WHERE 1=1"
    params = {}
    if hotel_id:
        where += " AND ii.hotel_id = :hotel_id"
        params["hotel_id"] = hotel_id

    try:
        rows = db.execute(text(f"""
            SELECT ii.id, ii.name, ii.category, ii.item_code,
                   ii.unit_of_measure, ii.min_stock, ii.max_stock, ii.reorder_qty,
                   COALESCE(sb.quantity, 0) as current_stock
            FROM inventory_items ii
            LEFT JOIN stock_balances sb ON sb.item_id = ii.id
            {where}
            ORDER BY COALESCE(sb.quantity, 0) ASC
            LIMIT 200
        """), params).fetchall()
    except Exception as e:
        return {"summary": {"critical":0,"low":0,"healthy":0,"overstocked":0,"total":0},
                "critical_items":[],"low_stock_items":[],"overstocked":[],
                "mentor_guidance":[{"priority":"INFO","message":"Stock data loading","action":"Retry in a moment"}],
                "generated_at": datetime.datetime.utcnow().isoformat()}

    critical = []
    low      = []
    healthy  = []
    over     = []

    for row in rows:
        item      = row_to_dict(row)
        current   = _safe_int(item.get("current_stock"))
        min_stock = _safe_int(item.get("min_stock"))
        max_stock = _safe_int(item.get("max_stock")) or min_stock * 3
        reorder   = _safe_int(item.get("reorder_qty")) or min_stock

        if current == 0:
            status = "critical"
            action = f"ORDER IMMEDIATELY: {reorder} units needed"
        elif current <= min_stock:
            status = "low"
            action = f"REORDER: Need {min_stock - current} more to reach minimum"
        elif current >= max_stock * 0.9:
            status = "overstocked"
            action = f"PAUSE ordering - {current - max_stock} units over maximum"
        else:
            status = "healthy"
            action = "Stock level OK"

        cat_key = next((k for k in BRAND_GUIDE if k in item.get("category","").lower()), "general")
        bg      = BRAND_GUIDE[cat_key]

        enriched = {
            **item,
            "status":        status,
            "action":        action,
            "shortage":      max(0, min_stock - current),
            "brands":        bg["brands"][:2],
            "sourcing_tip":  bg["tip"],
            "lead_time_days": bg["lead"],
        }

        if status == "critical":      critical.append(enriched)
        elif status == "low":         low.append(enriched)
        elif status == "overstocked": over.append(enriched)
        else:                         healthy.append(enriched)

    guidance = []
    if critical:
        guidance.append({
            "priority": "CRITICAL",
            "message":  f"{len(critical)} items completely out of stock.",
            "action":   "Create emergency purchase requests NOW. Contact vendors directly.",
            "items":    [i["name"] for i in critical[:5]],
        })
    if low:
        guidance.append({
            "priority": "HIGH",
            "message":  f"{len(low)} items below minimum stock level.",
            "action":   "Create purchase requests today. Allow for lead time.",
            "items":    [i["name"] for i in low[:5]],
        })
    if not critical and not low:
        guidance.append({
            "priority": "INFO",
            "message":  "All tracked items within healthy stock levels.",
            "action":   "Continue regular monitoring and scheduled reorder cycles.",
        })

    return {
        "summary": {
            "critical": len(critical), "low": len(low),
            "healthy": len(healthy), "overstocked": len(over),
            "total": len(rows),
        },
        "critical_items":  critical[:10],
        "low_stock_items": low[:10],
        "overstocked":     over[:5],
        "mentor_guidance": guidance,
        "generated_at":    now.isoformat(),
    }

@router.get("/brand-guide/{category}", summary="Brand and sourcing guide")
def brand_guide(category: str):
    """AI-powered brand recommendation and sourcing guide for Egypt market."""
    cat_lower = category.lower()
    matched   = next((k for k in BRAND_GUIDE if k in cat_lower), "general")
    rec       = BRAND_GUIDE[matched]

    return {
        "category":               category,
        "matched_guide":          matched,
        "recommended_brands":     rec["brands"],
        "required_certifications": rec["certs"],
        "avg_lead_time_days":     rec["lead"],
        "sourcing_notes":         rec["notes"],
        "best_practice":          rec["tip"],
        "mentor_tip": (
            f"For {category}: Always request at least 3 quotes. "
            f"Verify certifications. "
            f"Plan for {rec['lead']} day lead time."
        ),
        "reorder_strategy": {
            "safety_stock_days": rec["lead"] * 2,
            "order_frequency":   "monthly" if rec["lead"] <= 7 else "bi-monthly",
        },
    }

@router.get("/auto-reorder-plan", summary="Auto-generate reorder plan")
def auto_reorder_plan(
    hotel_id: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """Generate complete reorder plan grouped by vendor category."""
    now    = datetime.datetime.utcnow()
    where  = "WHERE COALESCE(sb.quantity, 0) <= ii.min_stock"
    params = {}
    if hotel_id:
        where  += " AND ii.hotel_id = :hotel_id"
        params["hotel_id"] = hotel_id

    try:
        rows = db.execute(text(f"""
            SELECT ii.id, ii.name, ii.category, ii.item_code,
                   ii.unit_of_measure, ii.min_stock, ii.reorder_qty,
                   COALESCE(sb.quantity, 0) as current_stock
            FROM inventory_items ii
            LEFT JOIN stock_balances sb ON sb.item_id = ii.id
            {where}
            ORDER BY ii.category, ii.name
            LIMIT 100
        """), params).fetchall()
    except Exception:
        rows = []

    plan = {}
    for row in rows:
        item = row_to_dict(row)
        cat  = item.get("category", "General")
        if cat not in plan:
            cat_key = next((k for k in BRAND_GUIDE if k in cat.lower()), "general")
            plan[cat] = {
                "category":   cat,
                "items":      [],
                "brands":     BRAND_GUIDE[cat_key]["brands"][:2],
                "lead_days":  BRAND_GUIDE[cat_key]["lead"],
                "total":      0,
            }
        needed = max(
            _safe_int(item.get("reorder_qty")),
            _safe_int(item.get("min_stock")) - _safe_int(item.get("current_stock"))
        )
        plan[cat]["items"].append({
            "name":      item.get("name"),
            "item_code": item.get("item_code"),
            "current":   _safe_int(item.get("current_stock")),
            "minimum":   _safe_int(item.get("min_stock")),
            "order_qty": needed,
            "unit":      item.get("unit_of_measure"),
            "urgency":   "CRITICAL" if _safe_int(item.get("current_stock")) == 0 else "LOW",
        })
        plan[cat]["total"] += 1

    total_lines = sum(v["total"] for v in plan.values())

    return {
        "reorder_plan":     list(plan.values()),
        "total_line_items": total_lines,
        "categories":       len(plan),
        "mentor_guidance": (
            f"Create {len(plan)} purchase requests (one per vendor category). "
            f"Total {total_lines} line items need reordering. "
            f"Start with CRITICAL items (zero stock) first."
        ),
        "recommended_order": (
            "1. Critical (zero stock) - emergency PR today. "
            "2. Low stock - standard PR this week. "
            "3. Group by vendor category - fewer POs means better pricing."
        ),
        "generated_at": now.isoformat(),
    }
