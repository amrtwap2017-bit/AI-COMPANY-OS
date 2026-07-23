from __future__ import annotations
"""
Warehouse Intelligence Engine - Sprint 90
Manages min/max stock levels, auto-reorder triggers,
brand recommendations, and sourcing guidance.
Acts as AI mentor for warehouse team.
"""
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

def _safe_float(v):
    try: return float(v or 0)
    except: return 0.0

# Recommended brands per category (Egypt market knowledge)
BRAND_RECOMMENDATIONS = {
    "hvac": {
        "brands": ["Carrier Egypt","Daikin","Midea","LG","Samsung Climate"],
        "notes": "Carrier Egypt has widest service network. Daikin for commercial grade. Midea for cost efficiency.",
        "certifications": ["ISO 9001","AHRI","CE"],
        "avg_lead_time_days": 5,
        "sourcing_tip": "Order filters quarterly in bulk - 20% cost saving vs ad-hoc",
    },
    "electrical": {
        "brands": ["ABB Egypt","Schneider Electric","Siemens","Legrand","Hager"],
        "notes": "ABB and Schneider have local warehouses. Siemens for industrial grade. Legrand for residential.",
        "certifications": ["IEC","CE","SASO"],
        "avg_lead_time_days": 3,
        "sourcing_tip": "Keep 30-day safety stock for breakers - critical items with high failure rate",
    },
    "plumbing": {
        "brands": ["Grundfos Egypt","Wilo","DAB Pumps","Giacomini","Oventrop"],
        "notes": "Grundfos for pumps - widest local support. Giacomini for valves - Italian quality.",
        "certifications": ["WRAS","ISO 9001"],
        "avg_lead_time_days": 7,
        "sourcing_tip": "Pumps should have 1 spare unit on-site for critical installations",
    },
    "safety": {
        "brands": ["3M Egypt","Honeywell Safety","MSA Safety","Drager"],
        "notes": "3M for PPE - widest availability. MSA for confined space equipment.",
        "certifications": ["CE","ANSI","EN"],
        "avg_lead_time_days": 2,
        "sourcing_tip": "PPE has expiry dates - order 3-month supply maximum. Monthly inspection required.",
    },
    "pool": {
        "brands": ["Hayward","Pentair","Fluidra","Bayrol"],
        "notes": "Bayrol chemicals have local distributor. Hayward for pumps and filtration.",
        "certifications": ["NSF","DIN"],
        "avg_lead_time_days": 3,
        "sourcing_tip": "Test water chemistry daily. Keep 2-week chemical stock minimum.",
    },
    "generator": {
        "brands": ["Cummins Egypt","Perkins","Kohler","Caterpillar"],
        "notes": "Cummins has strongest Egypt service network. Perkins cost-effective for smaller units.",
        "certifications": ["ISO 8528","CE"],
        "avg_lead_time_days": 14,
        "sourcing_tip": "Critical item - always maintain 7-day fuel reserve and quarterly service contract.",
    },
    "general": {
        "brands": ["Local market","Multiple vendors"],
        "notes": "Compare at least 3 quotes for general items.",
        "certifications": [],
        "avg_lead_time_days": 5,
        "sourcing_tip": "Use preferred vendor list - do not source from unknown vendors without approval.",
    },
}

@router.get("/stock-health", summary="Complete stock health dashboard")
def stock_health(
    hotel_id:  str = Query(default=None),
    warehouse: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """
    Complete warehouse stock health overview.
    Shows: critical, low, healthy, overstocked items.
    Provides sourcing guidance per category.
    """
    now = datetime.datetime.utcnow()

    where = "WHERE 1=1"
    params = {}
    if hotel_id:  where += " AND ii.hotel_id = :hotel_id";  params["hotel_id"] = hotel_id
    if warehouse: where += " AND sb.warehouse_id = :wh";     params["wh"] = warehouse

    try:
        rows = db.execute(text(f"""
            SELECT ii.id, ii.name, ii.category, ii.item_code,
                   ii.unit_of_measure, ii.min_stock, ii.max_stock,
                   ii.reorder_qty, ii.hotel_id,
                   COALESCE(sb.quantity, 0) as current_stock,
                   w.name as warehouse_name,
                   sb.warehouse_id
            FROM inventory_items ii
            LEFT JOIN stock_balances sb ON sb.item_id = ii.id
            LEFT JOIN warehouses w ON w.id = sb.warehouse_id
            {where}
            ORDER BY
                CASE
                    WHEN COALESCE(sb.quantity, 0) = 0 THEN 0
                    WHEN COALESCE(sb.quantity, 0) <= ii.min_stock THEN 1
                    ELSE 2
                END,
                ii.category
            LIMIT 200
        """), params).fetchall()
    except Exception as e:
        return {"items": [], "error": str(e)}

    critical   = []
    low        = []
    healthy    = []
    overstocked = []

    for row in rows:
        item     = row_to_dict(row)
        current  = _safe_int(item.get("current_stock"))
        min_stock = _safe_int(item.get("min_stock"))
        max_stock = _safe_int(item.get("max_stock")) or min_stock * 3
        reorder  = _safe_int(item.get("reorder_qty")) or min_stock

        # Calculate stock health score
        if current == 0:
            status = "critical"
            health_score = 0
            action = f"ORDER IMMEDIATELY: {reorder} units needed"
        elif current <= min_stock:
            status = "low"
            health_score = round(current / min_stock * 50, 0)
            shortage = min_stock - current
            action = f"REORDER: Need {shortage} more units to reach minimum"
        elif current >= max_stock * 0.9:
            status = "overstocked"
            health_score = 100
            excess = current - max_stock
            action = f"REVIEW: {excess} units over maximum - pause ordering"
        else:
            status = "healthy"
            health_score = round(50 + (current - min_stock) / (max_stock - min_stock) * 50, 0)
            action = "Stock level OK"

        # Get brand recommendation for category
        cat      = item.get("category","").lower()
        brand_cat = next((k for k in BRAND_RECOMMENDATIONS if k in cat), "general")
        brand_rec = BRAND_RECOMMENDATIONS[brand_cat]

        enriched = {
            **item,
            "status":          status,
            "health_score":    health_score,
            "action":          action,
            "shortage":        max(0, min_stock - current),
            "brand_recommendation": brand_rec["brands"][:2],
            "sourcing_tip":    brand_rec["sourcing_tip"],
            "avg_lead_time":   brand_rec["avg_lead_time_days"],
        }

        if status == "critical":        critical.append(enriched)
        elif status == "low":           low.append(enriched)
        elif status == "overstocked":   overstocked.append(enriched)
        else:                           healthy.append(enriched)

    # Generate warehouse mentor guidance
    guidance = []
    if critical:
        guidance.append({
            "priority": "CRITICAL",
            "message":  f"{len(critical)} items are completely out of stock.",
            "action":   "Create emergency purchase requests NOW. Contact vendors directly.",
            "items":    [i["name"] for i in critical[:5]],
        })
    if low:
        guidance.append({
            "priority": "HIGH",
            "message":  f"{len(low)} items are below minimum stock level.",
            "action":   "Create purchase requests today. Allow lead time in ordering.",
            "items":    [i["name"] for i in low[:5]],
        })
    if overstocked:
        guidance.append({
            "priority": "LOW",
            "message":  f"{len(overstocked)} items are overstocked.",
            "action":   "Pause ordering these items until stock reduces to healthy level.",
            "items":    [i["name"] for i in overstocked[:3]],
        })
    if not critical and not low:
        guidance.append({
            "priority": "INFO",
            "message":  "All tracked items are within healthy stock levels.",
            "action":   "Continue regular monitoring and scheduled reorder cycles.",
        })

    return {
        "summary": {
            "critical":    len(critical),
            "low":         len(low),
            "healthy":     len(healthy),
            "overstocked": len(overstocked),
            "total":       len(rows),
        },
        "critical_items":   critical[:10],
        "low_stock_items":  low[:10],
        "overstocked":      overstocked[:5],
        "healthy_sample":   healthy[:5],
        "mentor_guidance":  guidance,
        "generated_at":     now.isoformat(),
    }

@router.get("/brand-guide/{category}", summary="Brand and sourcing guide for category")
def brand_guide(category: str):
    """
    AI-powered brand recommendation and sourcing guide.
    Returns: recommended brands, certifications, lead times, best practices.
    """
    cat_lower = category.lower()
    matched = next((k for k in BRAND_RECOMMENDATIONS if k in cat_lower), "general")
    rec = BRAND_RECOMMENDATIONS[matched]

    return {
        "category":        category,
        "matched_guide":   matched,
        "recommended_brands": rec["brands"],
        "required_certifications": rec["certifications"],
        "avg_lead_time_days": rec["avg_lead_time_days"],
        "sourcing_notes":  rec["notes"],
        "best_practice":   rec["sourcing_tip"],
        "mentor_tip": (
            f"For {category}: Always request at least 3 quotes. "
            f"Verify certifications ({', '.join(rec['certifications']) or 'check locally'}). "
            f"Plan for {rec['avg_lead_time_days']} day lead time."
        ),
        "reorder_strategy": {
            "safety_stock_days": rec["avg_lead_time_days"] * 2,
            "order_frequency":   "monthly" if rec["avg_lead_time_days"] <= 7 else "bi-monthly",
            "preferred_vendors": rec["brands"][:3],
        },
    }

@router.get("/auto-reorder-plan", summary="Auto-generate reorder plan")
def auto_reorder_plan(
    hotel_id: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """
    Generate a complete reorder plan for all items below minimum.
    Groups by vendor category for efficient ordering.
    Provides total budget estimate.
    """
    now = datetime.datetime.utcnow()

    where = "WHERE COALESCE(sb.quantity, 0) <= ii.min_stock"
    params = {}
    if hotel_id:
        where += " AND ii.hotel_id = :hotel_id"
        params["hotel_id"] = hotel_id

    try:
        rows = db.execute(text(f"""
            SELECT ii.id, ii.name, ii.category, ii.item_code,
                   ii.unit_of_measure, ii.min_stock, ii.reorder_qty,
                   ii.hotel_id, COALESCE(sb.quantity, 0) as current_stock
            FROM inventory_items ii
            LEFT JOIN stock_balances sb ON sb.item_id = ii.id
            {where}
            ORDER BY ii.category, ii.name
            LIMIT 100
        """), params).fetchall()
    except Exception:
        rows = []

    # Group by category
    plan_by_category = {}
    for row in rows:
        item = row_to_dict(row)
        cat  = item.get("category", "General")
        if cat not in plan_by_category:
            cat_lower = cat.lower()
            matched   = next((k for k in BRAND_RECOMMENDATIONS if k in cat_lower), "general")
            plan_by_category[cat] = {
                "category":      cat,
                "items":         [],
                "brand_guide":   BRAND_RECOMMENDATIONS[matched]["brands"][:2],
                "lead_time_days": BRAND_RECOMMENDATIONS[matched]["avg_lead_time_days"],
                "total_items":   0,
            }

        needed = max(
            _safe_int(item.get("reorder_qty")),
            _safe_int(item.get("min_stock")) - _safe_int(item.get("current_stock"))
        )
        plan_by_category[cat]["items"].append({
            "item_id":     item.get("id"),
            "name":        item.get("name"),
            "item_code":   item.get("item_code"),
            "current":     _safe_int(item.get("current_stock")),
            "minimum":     _safe_int(item.get("min_stock")),
            "order_qty":   needed,
            "unit":        item.get("unit_of_measure"),
            "urgency":     "CRITICAL" if _safe_int(item.get("current_stock")) == 0 else "LOW",
        })
        plan_by_category[cat]["total_items"] += 1

    total_lines = sum(len(v["items"]) for v in plan_by_category.values())
    categories_count = len(plan_by_category)

    return {
        "reorder_plan":     list(plan_by_category.values()),
        "total_line_items": total_lines,
        "categories":       categories_count,
        "mentor_guidance": (
            f"Create {categories_count} purchase requests (one per vendor category). "
            f"Total {total_lines} line items need reordering. "
            f"Start with CRITICAL items (zero stock) first."
        ),
        "recommended_order": (
            "1. Critical (zero stock) → emergency PR today
"
            "2. Low stock → standard PR this week
"
            "3. Group by vendor category → fewer POs = better pricing"
        ),
        "generated_at": now.isoformat(),
    }
