from __future__ import annotations
import uuid, datetime, json as _json, re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/procurement/intake", tags=["procurement-intake"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _safe_int(v):
    try: return int(v or 0)
    except: return 0

CATEGORY_MAP = {
    "hvac":       ["HVAC Parts","Refrigerant","Filters","AC Parts"],
    "electrical": ["Electrical","Cables","Switchgear","Panels","Lighting"],
    "plumbing":   ["Plumbing","Pipes","Valves","Pumps"],
    "mechanical": ["Mechanical","Bearings","Belts","Motors"],
    "civil":      ["Civil","Cement","Paint","Tiles","Glass"],
    "safety":     ["Safety","PPE","Fire Equipment","First Aid"],
    "cleaning":   ["Cleaning","Chemicals","Hygiene"],
    "pool":       ["Pool Chemicals","Pool Equipment","Water Treatment"],
    "generator":  ["Generator","Fuel","Battery"],
}

def _detect_category(text_input):
    t = text_input.lower()
    keywords = {
        "hvac":       ["ac","hvac","air condition","chiller","fcu","cooling","refrigerant","filter"],
        "electrical": ["electric","cable","switch","panel","breaker","light","lamp","generator"],
        "plumbing":   ["pipe","pump","valve","water","plumb","leak","drain","tap"],
        "mechanical": ["bearing","belt","gear","motor","engine","shaft"],
        "civil":      ["cement","paint","tile","glass","wall","floor","door","window"],
        "safety":     ["safety","ppe","helmet","glove","fire","extinguisher"],
        "cleaning":   ["clean","detergent","chemical","hygiene","sanitize"],
        "pool":       ["pool","chlorine","ph"],
        "generator":  ["generator","fuel","diesel","battery"],
    }
    for cat, kws in keywords.items():
        if any(kw in t for kw in kws):
            return cat
    return "general"

def _extract_items(raw_text):
    items = []
    lines = raw_text.strip().split("\n")
    for line in lines:
        line = line.strip()
        if not line:
            continue
        qty_match = re.search(r"(\d+)", line)
        quantity  = int(qty_match.group(1)) if qty_match else 1
        category  = _detect_category(line)
        items.append({
            "name":     line[:200],
            "quantity": quantity,
            "category": category,
            "unit":     "piece",
            "notes":    line,
        })
    return items or [{"name": raw_text[:200], "quantity": 1,
                      "category": _detect_category(raw_text), "unit": "piece", "notes": raw_text}]

def _ensure_intake_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS procurement_intake_log (
            id           VARCHAR(36) PRIMARY KEY,
            channel      VARCHAR(50) NOT NULL,
            raw_request  TEXT NOT NULL,
            parsed_items TEXT,
            hotel_id     VARCHAR(36),
            requested_by VARCHAR(200),
            pr_id        VARCHAR(36),
            status       VARCHAR(50) DEFAULT 'new',
            created_at   TIMESTAMP NOT NULL
        )
    """))
    db.commit()

@router.post("/parse", summary="Parse procurement request from any channel")
def parse_request(data: dict, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """
    Accept raw request from any channel (WhatsApp, email, form, scan).
    Parse natural language items, check inventory, recommend vendors.
    Body: { raw_text, channel, hotel_id, requested_by, urgency }
    """
    raw_text     = data.get("raw_text", "").strip()
    channel      = data.get("channel", "form")
    hotel_id     = data.get("hotel_id", "")
    requested_by = data.get("requested_by", "unknown")
    urgency      = data.get("urgency", "normal")

    if not raw_text:
        raise HTTPException(400, "raw_text is required")

    _ensure_intake_table(db)
    now          = datetime.datetime.utcnow()
    parsed_items = _extract_items(raw_text)
    inv_results  = []
    vendor_recs  = []

    for item in parsed_items:
        category   = item.get("category", "general")
        qty_needed = item.get("quantity", 1)
        item_name  = item.get("name", "")

        inv_cats = CATEGORY_MAP.get(category, [category.title()])
        cat_q    = " OR ".join([f"lower(category) LIKE :c{i}" for i in range(len(inv_cats))])
        params   = {f"c{i}": f"%{c.lower()}%" for i, c in enumerate(inv_cats)}
        params["iname"] = f"%{item_name.lower()[:30]}%"

        try:
            rows = db.execute(text(f"""
                SELECT ii.id, ii.name, ii.category, ii.item_code,
                       ii.unit_of_measure, ii.min_stock,
                       COALESCE(sb.quantity, 0) as stock
                FROM inventory_items ii
                LEFT JOIN stock_balances sb ON sb.item_id = ii.id
                WHERE ({cat_q})
                ORDER BY COALESCE(sb.quantity, 0) DESC
                LIMIT 5
            """), params).fetchall()
            inv_items = [row_to_dict(r) for r in rows]
        except Exception:
            inv_items = []

        total_avail = sum(_safe_int(i.get("stock")) for i in inv_items)

        if total_avail >= qty_needed:
            status = "available"
            msg    = f"{total_avail} units in stock - ready to reserve"
        elif total_avail > 0:
            status = "partial"
            msg    = f"Only {total_avail} available, need {qty_needed}"
        else:
            status = "not_available"
            msg    = f"Out of stock - need to procure {qty_needed} units"

        inv_results.append({
            "item":          item,
            "stock_status":  status,
            "stock_message": msg,
            "available":     total_avail,
            "needed":        qty_needed,
            "shortage":      max(0, qty_needed - total_avail),
        })

        if status != "available":
            try:
                vp = {f"vc{i}": f"%{c.lower()}%" for i, c in enumerate(inv_cats[:2])}
                vq = " OR ".join([f"lower(category) LIKE :vc{i}" for i in range(len(inv_cats[:2]))])
                vendors = db.execute(text(f"""
                    SELECT id, name, category, lead_time_days, phone, email,
                           COALESCE(rating, 3.0) as rating
                    FROM inventory_vendors
                    WHERE {vq}
                    ORDER BY COALESCE(rating, 0) DESC, lead_time_days ASC
                    LIMIT 3
                """), vp).fetchall()
                for v in vendors:
                    vd = row_to_dict(v)
                    vendor_recs.append({
                        "for_item":       item_name[:50],
                        "vendor_id":      vd.get("id"),
                        "vendor_name":    vd.get("name"),
                        "category":       vd.get("category"),
                        "rating":         float(vd.get("rating") or 3.0),
                        "lead_time_days": _safe_int(vd.get("lead_time_days")),
                        "phone":          vd.get("phone"),
                        "email":          vd.get("email"),
                        "ai_note":        f"Recommended: {float(vd.get('rating') or 3):.1f}/5 rating",
                    })
            except Exception:
                pass

    needs_pr = any(r["stock_status"] != "available" for r in inv_results)

    mentor_guidance = []
    if urgency == "urgent" and needs_pr:
        mentor_guidance.append({
            "type":    "urgent",
            "message": "URGENT: Contact top vendors directly - do not wait for email.",
            "action":  "Call vendors listed below immediately.",
        })
    if needs_pr:
        mentor_guidance.append({
            "type":    "pr_required",
            "message": "Items out of stock. Create Purchase Request to initiate procurement.",
            "action":  "Click Create PR to auto-generate with vendor recommendations.",
        })
    if not needs_pr:
        mentor_guidance.append({
            "type":    "stock_ok",
            "message": "All items available in stock.",
            "action":  "Confirm quantities to fulfill from warehouse.",
        })

    log_id = str(uuid.uuid4())
    try:
        db.execute(text("""
            INSERT INTO procurement_intake_log
                (id, channel, raw_request, parsed_items, hotel_id, requested_by, status, created_at)
            VALUES (:id, :ch, :raw, :parsed, :hid, :rby, 'parsed', :now)
        """), {
            "id": log_id, "ch": channel,
            "raw": raw_text[:2000],
            "parsed": _json.dumps(parsed_items)[:2000],
            "hid": hotel_id, "rby": requested_by, "now": now,
        })
        db.commit()
    except Exception:
        pass

    return {
        "intake_id":             log_id,
        "channel":               channel,
        "requested_by":          requested_by,
        "urgency":               urgency,
        "parsed_items":          parsed_items,
        "inventory_results":     inv_results,
        "vendor_recommendations": vendor_recs[:9],
        "mentor_guidance":       mentor_guidance,
        "summary": {
            "total_items": len(parsed_items),
            "available":   sum(1 for r in inv_results if r["stock_status"] == "available"),
            "to_procure":  sum(1 for r in inv_results if r["stock_status"] != "available"),
            "needs_pr":    needs_pr,
        },
        "next_step":    "create_pr" if needs_pr else "fulfill_from_stock",
        "generated_at": now.isoformat(),
    }

@router.post("/create-pr", summary="Auto-create PR from intake result")
def create_pr_from_intake(data: dict, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """
    Create Purchase Request from parsed intake.
    Pre-fills all fields including vendor recommendations.
    """
    intake_id    = data.get("intake_id", "")
    hotel_id     = data.get("hotel_id", "")
    requested_by = data.get("requested_by", "system")
    urgency      = data.get("urgency", "normal")
    items        = data.get("items", [])
    vendors      = data.get("approved_vendors", [])

    if not items:
        raise HTTPException(400, "items list is required")

    now       = datetime.datetime.utcnow()
    pr_id     = str(uuid.uuid4())
    names     = [i.get("name","item")[:30] for i in items[:3]]
    title     = "AUTO-PR: " + ", ".join(names)
    if len(items) > 3:
        title += f" +{len(items)-3} more"

    lead_days     = {"urgent": 3, "normal": 7, "planned": 14}.get(urgency, 7)
    required_date = now + datetime.timedelta(days=lead_days)

    vendor_text = ""
    if vendors:
        vendor_text = " VENDORS: " + ", ".join(
            v.get("vendor_name","?") for v in vendors[:3]
        )

    description = (
        f"Channel: {data.get('channel','form')} | "
        f"By: {requested_by} | "
        f"Urgency: {urgency.upper()} | "
        f"Items: {len(items)}"
        + vendor_text
    )

    try:
        db.execute(text("""
            INSERT INTO purchase_requests
                (id, hotel_id, title, description, status, requested_by,
                 required_date, created_at, updated_at)
            VALUES
                (:id, :hid, :title, :desc, 'submitted', :rby,
                 :req_date, :now, :now)
        """), {
            "id": pr_id, "hid": hotel_id, "title": title[:200],
            "desc": description[:2000], "rby": requested_by,
            "req_date": required_date, "now": now,
        })
        if intake_id:
            try:
                db.execute(text("""
                    UPDATE procurement_intake_log
                    SET pr_id = :pr_id, status = 'pr_created'
                    WHERE id = :iid
                """), {"pr_id": pr_id, "iid": intake_id})
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
        "next_step":     "awaiting_purchasing_approval",
        "message":       "Purchase Request created and submitted for purchasing approval.",
        "approval_chain": [
            {"step": 1, "role": "Purchasing Manager", "status": "pending"},
            {"step": 2, "role": "Finance",            "status": "waiting"},
            {"step": 3, "role": "Requester",          "status": "waiting"},
        ],
    }

@router.get("/status/{intake_id}", summary="Full intake journey status")
def get_intake_status(intake_id: str, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """Track the full journey of a procurement request."""
    _ensure_intake_table(db)
    try:
        row = db.execute(text(
            "SELECT * FROM procurement_intake_log WHERE id = :id"
        ), {"id": intake_id}).fetchone()
        if not row:
            return {"intake_id": intake_id, "status": "not_found", "journey": []}

        intake = row_to_dict(row)
        pr_details = None
        if intake.get("pr_id"):
            pr_row = db.execute(text(
                "SELECT id, title, status, total_amount FROM purchase_requests WHERE id = :id"
            ), {"id": intake["pr_id"]}).fetchone()
            if pr_row:
                pr_details = row_to_dict(pr_row)

        return {
            "intake_id":  intake_id,
            "channel":    intake.get("channel"),
            "status":     intake.get("status"),
            "pr_details": pr_details,
            "journey": [
                {"step": "Request Received",    "done": True},
                {"step": "Items Parsed",        "done": True},
                {"step": "Inventory Checked",   "done": True},
                {"step": "PR Created",          "done": bool(intake.get("pr_id"))},
                {"step": "Purchasing Approved", "done": pr_details and pr_details.get("status") == "approved"},
                {"step": "PO Generated",        "done": pr_details and pr_details.get("status") == "po_created"},
                {"step": "Goods Received",      "done": False},
            ],
        }
    except Exception as e:
        return {"intake_id": intake_id, "status": "error", "error": str(e)}
