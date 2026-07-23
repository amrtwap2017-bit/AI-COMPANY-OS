from __future__ import annotations
"""
Intelligent Procurement Request Intake - Sprint 90
Accepts requests from any channel: WhatsApp, email, form, voice, paper.
Parses natural language → structured Purchase Request.
Checks inventory → routes to vendor search if not in stock.
"""
import uuid, datetime, json as _json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db

router = APIRouter(prefix="/procurement/intake", tags=["procurement-intake"])

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

# ── Item Category → Inventory Category mapping ─────────────────────────────────
CATEGORY_MAP = {
    "hvac":          ["HVAC Parts","Refrigerant","Filters","AC Parts","Compressor"],
    "electrical":    ["Electrical","Cables","Switchgear","Panels","Lighting","UPS"],
    "plumbing":      ["Plumbing","Pipes","Valves","Pumps","Water Treatment"],
    "mechanical":    ["Mechanical","Bearings","Belts","Gears","Motors"],
    "civil":         ["Civil","Cement","Paint","Tiles","Glass","Insulation"],
    "safety":        ["Safety","PPE","Fire Equipment","First Aid","Chemicals"],
    "cleaning":      ["Cleaning","Chemicals","Hygiene","Janitorial"],
    "it":            ["IT Equipment","Cables","Networking","Computers"],
    "furniture":     ["Furniture","Office Equipment","Fixtures"],
    "pool":          ["Pool Chemicals","Pool Equipment","Water Treatment"],
    "elevator":      ["Elevator Parts","Escalator","Lift Components"],
    "generator":     ["Generator","Fuel","Power Equipment","Battery"],
}

def _detect_category(text: str) -> str:
    """Detect item category from natural language description."""
    text_lower = text.lower()
    category_keywords = {
        "hvac": ["ac","hvac","air condition","chiller","ahu","fcu","cooling","refrigerant","filter","cooling tower"],
        "electrical": ["electric","cable","switch","panel","breaker","light","lamp","upc","generator","transformer"],
        "plumbing": ["pipe","pump","valve","water","plumb","leak","drain","sewage","tap","faucet"],
        "mechanical": ["bearing","belt","gear","motor","engine","shaft","coupling"],
        "civil": ["cement","paint","tile","glass","wall","floor","door","window","insulation"],
        "safety": ["safety","ppe","helmet","glove","fire","extinguisher","first aid","mask"],
        "cleaning": ["clean","detergent","chemical","hygiene","mop","broom","sanitize"],
        "pool": ["pool","swim","chlorine","ph","water treatment"],
        "elevator": ["elevator","lift","escalator"],
        "generator": ["generator","fuel","diesel","battery","power"],
    }
    for cat, keywords in category_keywords.items():
        if any(kw in text_lower for kw in keywords):
            return cat
    return "general"

def _extract_items_from_text(raw_text: str) -> list:
    """
    Parse raw request text into structured item list.
    Handles: 'Need 5 AC filters for room 204', 'مكيف الغرفة 204 لا يبرد'
    Returns list of {name, quantity, category, unit, notes}
    """
    items = []
    lines = raw_text.strip().split("
")
    for line in lines:
        line = line.strip()
        if not line:
            continue
        # Simple extraction: look for numbers for quantity
        import re
        qty_match = re.search(r'(\d+)', line)
        quantity = int(qty_match.group(1)) if qty_match else 1
        category = _detect_category(line)
        items.append({
            "name":     line[:200],
            "quantity": quantity,
            "category": category,
            "unit":     "piece",
            "notes":    line,
        })
    return items if items else [{"name": raw_text[:200], "quantity": 1,
                                  "category": _detect_category(raw_text), "unit": "piece", "notes": raw_text}]

def _ensure_intake_log_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS procurement_intake_log (
            id              VARCHAR(36) PRIMARY KEY,
            channel         VARCHAR(50) NOT NULL,
            raw_request     TEXT NOT NULL,
            parsed_items    TEXT,
            hotel_id        VARCHAR(36),
            requested_by    VARCHAR(200),
            pr_id           VARCHAR(36),
            inventory_result TEXT,
            status          VARCHAR(50) DEFAULT 'new',
            created_at      TIMESTAMP NOT NULL
        )
    """))
    db.commit()

@router.post("/parse", summary="Parse request from any channel")
def parse_request(data: dict, db: Session = Depends(get_db)):
    """
    STEP 1: Accept raw request from any channel.
    Channel: whatsapp | email | form | scan | voice
    Body: { raw_text, channel, hotel_id, requested_by, urgency }

    Returns: parsed items + inventory status + vendor recommendations
    """
    raw_text     = data.get("raw_text", "").strip()
    channel      = data.get("channel", "form")
    hotel_id     = data.get("hotel_id", "")
    requested_by = data.get("requested_by", "unknown")
    urgency      = data.get("urgency", "normal")  # urgent | normal | planned

    if not raw_text:
        raise HTTPException(400, "raw_text is required")

    _ensure_intake_log_table(db)
    now = datetime.datetime.utcnow()

    # Parse items from raw text
    parsed_items = _extract_items_from_text(raw_text)

    # Check inventory for each item
    inventory_results = []
    vendor_recommendations = []

    for item in parsed_items:
        category    = item.get("category", "general")
        qty_needed  = item.get("quantity", 1)
        item_name   = item.get("name", "")

        # Search inventory by name similarity and category
        inv_categories = CATEGORY_MAP.get(category, [category.title()])
        cat_conditions = " OR ".join([f"lower(category) LIKE :cat{i}"
                                       for i in range(len(inv_categories))])
        name_condition = f"AND lower(name) LIKE :item_name"

        params = {f"cat{i}": f"%{c.lower()}%" for i, c in enumerate(inv_categories)}
        params["item_name"] = f"%{item_name.lower()[:30]}%"

        try:
            inv_rows = db.execute(text(f"""
                SELECT ii.id, ii.name, ii.category, ii.item_code,
                       ii.unit_of_measure, ii.min_stock,
                       COALESCE(sb.quantity, 0) as stock
                FROM inventory_items ii
                LEFT JOIN stock_balances sb ON sb.item_id = ii.id
                WHERE ({cat_conditions})
                ORDER BY COALESCE(sb.quantity, 0) DESC
                LIMIT 5
            """), params).fetchall()
            inv_items = [row_to_dict(r) for r in inv_rows]
        except Exception:
            inv_items = []

        # Determine stock status
        total_available = sum(_safe_int(i.get("stock")) for i in inv_items)

        if total_available >= qty_needed:
            stock_status = "available"
            stock_msg    = f"{total_available} units in stock - ready to reserve"
        elif total_available > 0:
            stock_status = "partial"
            stock_msg    = f"Only {total_available} available, need {qty_needed} - will procure {qty_needed - total_available}"
        else:
            stock_status = "not_available"
            stock_msg    = f"Out of stock - need to procure {qty_needed} units"

        inventory_results.append({
            "item":           item,
            "stock_status":   stock_status,
            "stock_message":  stock_msg,
            "available":      total_available,
            "needed":         qty_needed,
            "shortage":       max(0, qty_needed - total_available),
            "inventory_items": inv_items[:3],
        })

        # If not available, get vendor recommendations
        if stock_status != "available":
            try:
                vendor_cats = [f"%{c.lower()}%" for c in (inv_categories[:3] if inv_categories else [category])]
                v_params = {f"vc{i}": vc for i, vc in enumerate(vendor_cats)}
                cat_q = " OR ".join([f"lower(category) LIKE :vc{i}" for i in range(len(vendor_cats))])
                vendors = db.execute(text(f"""
                    SELECT id, name, category, lead_time_days, payment_terms,
                           phone, email,
                           COALESCE(rating, 3.0) as rating
                    FROM inventory_vendors
                    WHERE {cat_q}
                    ORDER BY COALESCE(rating, 0) DESC, lead_time_days ASC
                    LIMIT 3
                """), v_params).fetchall()

                for v in vendors:
                    vd = row_to_dict(v)
                    vendor_recommendations.append({
                        "for_item":     item_name[:50],
                        "vendor_id":    vd.get("id"),
                        "vendor_name":  vd.get("name"),
                        "category":     vd.get("category"),
                        "rating":       _safe_float(vd.get("rating")),
                        "lead_time_days": _safe_int(vd.get("lead_time_days")),
                        "phone":        vd.get("phone"),
                        "email":        vd.get("email"),
                        "ai_note":      f"Recommended based on category match and {_safe_float(vd.get('rating')):.1f}/5 rating",
                    })
            except Exception:
                pass

    # Generate AI mentor guidance
    items_not_available = [r for r in inventory_results if r["stock_status"] != "available"]
    mentor_guidance = []

    if urgency == "urgent":
        mentor_guidance.append({
            "type": "urgent_sourcing",
            "message": f"URGENT: {len(items_not_available)} items need immediate sourcing. Contact top-rated vendors directly.",
            "action": "Call vendors listed below - do not wait for email response.",
        })
    if items_not_available:
        mentor_guidance.append({
            "type": "pr_required",
            "message": f"{len(items_not_available)} items are out of stock. Create a Purchase Request to initiate procurement.",
            "action": "Use the 'Create PR' button below to auto-generate a Purchase Request with pre-filled vendor recommendations.",
        })
    if len(inventory_results) > 0 and all(r["stock_status"] == "available" for r in inventory_results):
        mentor_guidance.append({
            "type": "stock_available",
            "message": "All requested items are available in stock. A stock issue will be created.",
            "action": "Confirm the quantities and your request will be fulfilled from warehouse.",
        })

    # Log the intake
    log_id = str(uuid.uuid4())
    try:
        db.execute(text("""
            INSERT INTO procurement_intake_log
                (id, channel, raw_request, parsed_items, hotel_id, requested_by, status, created_at)
            VALUES (:id, :channel, :raw, :parsed, :hotel_id, :requested_by, 'parsed', :now)
        """), {
            "id": log_id, "channel": channel, "raw": raw_text[:2000],
            "parsed": _json.dumps(parsed_items)[:2000],
            "hotel_id": hotel_id, "requested_by": requested_by, "now": now,
        })
        db.commit()
    except Exception:
        pass

    return {
        "intake_id":          log_id,
        "channel":            channel,
        "requested_by":       requested_by,
        "urgency":            urgency,
        "parsed_items":       parsed_items,
        "inventory_results":  inventory_results,
        "vendor_recommendations": vendor_recommendations[:9],
        "mentor_guidance":    mentor_guidance,
        "summary": {
            "total_items":    len(parsed_items),
            "available":      sum(1 for r in inventory_results if r["stock_status"] == "available"),
            "partial":        sum(1 for r in inventory_results if r["stock_status"] == "partial"),
            "to_procure":     sum(1 for r in inventory_results if r["stock_status"] == "not_available"),
            "needs_pr":       len(items_not_available) > 0,
        },
        "next_step": "create_pr" if items_not_available else "fulfill_from_stock",
        "generated_at": now.isoformat(),
    }

@router.post("/create-pr", summary="Auto-create PR from intake result")
def create_pr_from_intake(data: dict, db: Session = Depends(get_db)):
    """
    STEP 2: Create Purchase Request from parsed intake.
    Pre-fills all fields including vendor recommendations.
    Body: { intake_id, hotel_id, requested_by, urgency, items, approved_vendors }
    """
    intake_id    = data.get("intake_id", "")
    hotel_id     = data.get("hotel_id", "")
    requested_by = data.get("requested_by", "system")
    urgency      = data.get("urgency", "normal")
    items        = data.get("items", [])
    vendors      = data.get("approved_vendors", [])
    notes        = data.get("notes", "")

    if not items:
        raise HTTPException(400, "items list is required")

    now    = datetime.datetime.utcnow()
    pr_id  = str(uuid.uuid4())

    # Build title from items
    item_names = [i.get("name","item")[:30] for i in items[:3]]
    title = f"AUTO-PR: {', '.join(item_names)}"
    if len(items) > 3:
        title += f" +{len(items)-3} more"

    # Calculate required date based on urgency
    lead_days = {"urgent": 3, "normal": 7, "planned": 14}.get(urgency, 7)
    required_date = now + datetime.timedelta(days=lead_days)

    # Build description with vendor recommendations
    vendor_text = ""
    if vendors:
        vendor_text = "

RECOMMENDED VENDORS:
"
        for v in vendors[:3]:
            vendor_text += f"  - {v.get('vendor_name','?')} (Rating: {v.get('rating',0):.1f}/5, Lead: {v.get('lead_time_days','?')}d)
"

    description = (
        f"Auto-generated from {data.get('channel','form')} request.
"
        f"Requested by: {requested_by}
"
        f"Urgency: {urgency.upper()}
"
        f"Items: {len(items)}
"
        f"{notes}"
        f"{vendor_text}"
    )

    # Estimate total value from vendor pricing (if available)
    total_estimate = sum(
        _safe_float(i.get("estimated_price", 0)) * _safe_int(i.get("quantity", 1))
        for i in items
    )

    try:
        db.execute(text("""
            INSERT INTO purchase_requests
                (id, hotel_id, title, description, status, requested_by,
                 required_date, total_amount, created_at, updated_at)
            VALUES
                (:id, :hotel_id, :title, :desc, 'submitted', :requested_by,
                 :req_date, :total, :now, :now)
        """), {
            "id": pr_id, "hotel_id": hotel_id, "title": title[:200],
            "desc": description[:2000], "requested_by": requested_by,
            "req_date": required_date,
            "total": total_estimate if total_estimate > 0 else None,
            "now": now,
        })

        # Update intake log with PR ID
        if intake_id:
            try:
                db.execute(text("""
                    UPDATE procurement_intake_log
                    SET pr_id = :pr_id, status = 'pr_created'
                    WHERE id = :intake_id
                """), {"pr_id": pr_id, "intake_id": intake_id})
            except Exception:
                pass

        db.commit()
    except Exception as e:
        raise HTTPException(500, f"PR creation failed: {str(e)}")

    return {
        "success":       True,
        "pr_id":         pr_id,
        "title":         title,
        "status":        "submitted",
        "urgency":       urgency,
        "items_count":   len(items),
        "required_date": required_date.isoformat(),
        "total_estimate_egp": total_estimate,
        "next_step":     "awaiting_purchasing_approval",
        "message":       f"Purchase Request created and submitted for purchasing approval",
        "approval_chain": [
            {"step": 1, "role": "Purchasing Manager", "status": "pending"},
            {"step": 2, "role": "Finance",            "status": "waiting"},
            {"step": 3, "role": "Requester",          "status": "waiting"},
        ],
    }

@router.get("/status/{intake_id}", summary="Full intake status")
def get_intake_status(intake_id: str, db: Session = Depends(get_db)):
    """Track the full journey of a procurement request."""
    _ensure_intake_log_table(db)
    try:
        row = db.execute(text(
            "SELECT * FROM procurement_intake_log WHERE id = :id"
        ), {"id": intake_id}).fetchone()
        if not row:
            raise HTTPException(404, "Intake not found")

        intake = row_to_dict(row)

        # Get PR details if linked
        pr_details = None
        if intake.get("pr_id"):
            pr_row = db.execute(text(
                "SELECT * FROM purchase_requests WHERE id = :id"
            ), {"id": intake["pr_id"]}).fetchone()
            if pr_row:
                pr = row_to_dict(pr_row)
                pr_details = {
                    "pr_id":  pr.get("id"),
                    "title":  pr.get("title"),
                    "status": pr.get("status"),
                    "total":  pr.get("total_amount"),
                }

        return {
            "intake_id":  intake_id,
            "channel":    intake.get("channel"),
            "status":     intake.get("status"),
            "requested_by": intake.get("requested_by"),
            "created_at": str(intake.get("created_at","")),
            "pr_details": pr_details,
            "journey": [
                {"step": "Request Received",    "done": True},
                {"step": "Items Parsed",        "done": intake.get("status") != "new"},
                {"step": "Inventory Checked",   "done": intake.get("status") not in ["new","parsed"]},
                {"step": "PR Created",          "done": bool(intake.get("pr_id"))},
                {"step": "Purchasing Approval", "done": pr_details and pr_details.get("status") in ["approved","po_created"]},
                {"step": "Finance Approval",    "done": pr_details and pr_details.get("status") in ["po_created"]},
                {"step": "PO Sent to Vendor",   "done": False},
                {"step": "Goods Received",      "done": False},
            ],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))
