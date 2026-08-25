from __future__ import annotations
"""
Goods Receipt Workflow - Sprint 91
Completes the procurement loop:
  Receive Goods -> Inspect -> Update Stock -> Notify Requester -> Close PO
"""
import uuid, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id
import logging

logger = logging.getLogger("tb.goods_receipt")
router = APIRouter(prefix="/goods-receipt-workflow", tags=["goods-receipt-workflow"])

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

def _notify_receipt(po_id, message, db):
    """Send platform notification for receipt event."""
    try:
        db.execute(text("""
            INSERT INTO platform_notifications
                (id, type, title, message, priority, entity_type, entity_id, created_at)
            VALUES (:id, 'goods_receipt', :title, :msg, 'medium', 'purchase_order', :po_id, :now)
        """), {
            "id":    str(uuid.uuid4()),
            "title": "Goods Received",
            "msg":   message,
            "po_id": po_id,
            "now":   datetime.datetime.utcnow(),
        })
    except Exception:
        pass

@router.post("/receive/{po_id}", summary="Record goods receipt for PO")
def receive_goods(po_id: str, data: dict,
                   hotel_id: str = Depends(get_hotel_id),
                   db: Session = Depends(get_db)):
    """
    STEP 6 of procurement cycle: Receive goods from vendor.
    Updates stock balances and notifies requester.
    Body: { warehouse_id, received_by, items, notes, delivery_note_no }
    """
    po_row = db.execute(
        text("SELECT * FROM purchase_orders WHERE id = :id"), {"id": po_id}
    ).fetchone()
    if not po_row:
        raise HTTPException(404, "Purchase Order not found")

    po = row_to_dict(po_row)
    if po.get("status") not in ("sent","approved","confirmed"):
        return {"success": False, "message": f"PO status is {po.get('status')} - cannot receive"}

    now           = datetime.datetime.utcnow()
    gr_id         = str(uuid.uuid4())
    warehouse_id  = data.get("warehouse_id", "")
    received_by   = data.get("received_by", "warehouse_team")
    items         = data.get("items", [])
    notes         = data.get("notes", "")
    delivery_note = data.get("delivery_note_no", "")
    hotel_id      = po.get("hotel_id", "")

    # Create Goods Receipt record
    try:
        db.execute(text("""
            INSERT INTO goods_receipts
                (id, purchase_order_id, hotel_id, warehouse_id, received_by,
                 received_date, delivery_note_no, notes, status, created_at)
            VALUES (:id, :po_id, :hid, :wid, :rby, :now, :dn, :notes, 'complete', :now)
        """), {
            "id":    gr_id,
            "po_id": po_id,
            "hid":   hotel_id,
            "wid":   warehouse_id or None,
            "rby":   received_by,
            "now":   now,
            "dn":    delivery_note,
            "notes": notes,
        })
    except Exception as e:
        raise HTTPException(500, f"GR creation failed: {str(e)}")

    # Update stock balances for each received item
    stock_updates = []
    for item in items:
        item_id  = item.get("item_id", "")
        qty_recv = _safe_int(item.get("quantity_received") or item.get("quantity"))

        if not item_id or qty_recv <= 0:
            continue

        try:
            # Update or create stock balance
            existing = db.execute(text("""
                SELECT id, quantity FROM stock_balances
                WHERE item_id = :iid AND warehouse_id IS NOT DISTINCT FROM :wid
                LIMIT 1
            """), {"iid": item_id, "wid": warehouse_id or None}).fetchone()

            if existing:
                existing_data = row_to_dict(existing)
                new_qty = _safe_int(existing_data.get("quantity")) + qty_recv
                db.execute(text("""
                    UPDATE stock_balances SET quantity = :qty
                    WHERE id = :id
                """), {"qty": new_qty, "id": existing_data["id"]})
            else:
                db.execute(text("""
                    INSERT INTO stock_balances (id, item_id, warehouse_id, quantity)
                    VALUES (:id, :iid, :wid, :qty)
                """), {
                    "id":  str(uuid.uuid4()),
                    "iid": item_id,
                    "wid": warehouse_id or None,
                    "qty": qty_recv,
                })

            # Record stock movement
            db.execute(text("""
                INSERT INTO stock_movements
                    (id, item_id, warehouse_id, movement_type, quantity,
                     reference, notes, created_at)
                VALUES (:id, :iid, :wid, 'in', :qty, :ref, :notes, :now)
            """), {
                "id":   str(uuid.uuid4()),
                "iid":  item_id,
                "wid":  warehouse_id or None,
                "qty":  qty_recv,
                "ref":  f"GR-{gr_id[:8]} / PO-{po_id[:8]}",
                "notes": f"Received via PO {po.get('po_number','?')}",
                "now":  now,
            })

            stock_updates.append({
                "item_id":       item_id,
                "qty_received":  qty_recv,
                "status":        "stock_updated",
            })
        except Exception as e:
            stock_updates.append({
                "item_id": item_id,
                "qty_received": qty_recv,
                "status": "failed",
                "error": str(e)[:100],
            })

    # Mark PO as received
    db.execute(text("""
        UPDATE purchase_orders SET status = 'received', updated_at = :now WHERE id = :id
    """), {"now": now, "id": po_id})

    # Notify team
    msg = (
        f"Goods received for PO {po.get('po_number','?')}. "
        f"{len(stock_updates)} items processed. "
        f"Stock levels updated by {received_by}."
    )
    _notify_receipt(po_id, msg, db)
    logger.info(f"GR: PO {po_id[:8]} received - {len(stock_updates)} items")

    db.commit()

    return {
        "success":         True,
        "gr_id":           gr_id,
        "po_id":           po_id,
        "po_number":       po.get("po_number"),
        "received_by":     received_by,
        "items_processed": len(stock_updates),
        "stock_updates":   stock_updates,
        "po_status":       "received",
        "message":         f"Goods received. {len(stock_updates)} items added to stock.",
        "next_step":       "requester_notified",
        "received_at":     now.isoformat(),
    }

@router.post("/partial-receive/{po_id}", summary="Partial delivery receipt")
def partial_receive(po_id: str, data: dict,
                    hotel_id: str = Depends(get_hotel_id),
                    db: Session = Depends(get_db)):
    """Receive partial delivery - PO stays open until fully received."""
    # Use same logic but mark PO as 'partial_delivery'
    result = receive_goods(po_id, data, db)
    if result.get("success"):
        # Override status to partial
        db.execute(text("""
            UPDATE purchase_orders SET status = 'partial_delivery', updated_at = :now WHERE id = :id
        """), {"now": datetime.datetime.utcnow(), "id": po_id})
        db.commit()
        result["po_status"] = "partial_delivery"
        result["message"]   = result["message"] + " PO remains open for remaining items."
        result["next_step"] = "awaiting_remaining_delivery"
    return result

@router.get("/pending-receipts", summary="POs waiting for goods receipt")
def pending_receipts(
    hotel_id: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """List all POs sent to vendors but not yet received."""
    where  = "WHERE po.status IN ('sent','confirmed','partial_delivery')"
    params = {}
    if hotel_id:
        where  += " AND po.hotel_id = :hotel_id"
        params["hotel_id"] = hotel_id

    try:
        rows = db.execute(text(f"""
            SELECT po.id, po.po_number, po.title, po.status,
                   po.total_amount, po.expected_delivery_date,
                   po.created_at,
                   iv.name as vendor_name, iv.phone as vendor_phone,
                   DATE_PART('day', NOW() - po.created_at) as days_since_order,
                   DATE_PART('day', NOW() - po.expected_delivery_date) as days_overdue
            FROM purchase_orders po
            LEFT JOIN inventory_vendors iv ON iv.id = po.vendor_id
            {where}
            ORDER BY po.expected_delivery_date ASC NULLS LAST
            LIMIT 50
        """), params).fetchall()
    except Exception as e:
        return {"pending": [], "error": str(e)}

    pending = [row_to_dict(r) for r in rows]
    overdue = [p for p in pending if (p.get("days_overdue") or 0) > 0]

    return {
        "pending":       pending,
        "total":         len(pending),
        "overdue":       len(overdue),
        "overdue_items": overdue,
        "generated_at":  datetime.datetime.utcnow().isoformat(),
    }

@router.get("/cycle-status/{pr_id}", summary="Complete procurement cycle status")
def cycle_status(pr_id: str,
                 hotel_id: str = Depends(get_hotel_id),
                 db: Session = Depends(get_db)):
    """
    Full procurement cycle view for a PR.
    Shows every step from intake to goods received.
    """
    pr_row = db.execute(
        text("SELECT * FROM purchase_requests WHERE id = :id"), {"id": pr_id}
    ).fetchone()
    if not pr_row:
        raise HTTPException(404, "PR not found")

    pr = row_to_dict(pr_row)

    # Get PO if created
    po = {}
    try:
        po_row = db.execute(text("""
            SELECT po.id, po.po_number, po.status, po.total_amount,
                   po.expected_delivery_date,
                   iv.name as vendor_name
            FROM purchase_orders po
            LEFT JOIN inventory_vendors iv ON iv.id = po.vendor_id
            WHERE po.title LIKE :pr_ref
            LIMIT 1
        """), {"pr_ref": f"%{pr_id[:8]}%"}).fetchone()
        po = row_to_dict(po_row) if po_row else {}
    except Exception:
        pass

    # Get GR if received
    gr = {}
    if po.get("id"):
        try:
            gr_row = db.execute(text("""
                SELECT id, received_date, received_by, status
                FROM goods_receipts
                WHERE purchase_order_id = :po_id
                LIMIT 1
            """), {"po_id": po["id"]}).fetchone()
            gr = row_to_dict(gr_row) if gr_row else {}
        except Exception:
            pass

    # Build cycle steps
    pr_status = pr.get("status","")
    steps = [
        {"step": 1, "name": "Request Submitted",    "done": True,
         "details": f"By {pr.get('requested_by','?')}"},
        {"step": 2, "name": "Inventory Checked",    "done": True,
         "details": "AI parsed and checked stock"},
        {"step": 3, "name": "PR Created",           "done": True,
         "details": f"Status: {pr_status}"},
        {"step": 4, "name": "Purchasing Approved",  "done": pr_status in ["approved","po_created","received"],
         "details": "Purchasing Manager approval"},
        {"step": 5, "name": "Finance Approved",     "done": pr_status in ["approved","po_created","received"],
         "details": "Finance approval"},
        {"step": 6, "name": "PO Generated",         "done": bool(po),
         "details": f"PO: {po.get('po_number','pending')}"},
        {"step": 7, "name": "PO Sent to Vendor",    "done": po.get("status") in ("sent","received","partial_delivery"),
         "details": f"Vendor: {po.get('vendor_name','?')}"},
        {"step": 8, "name": "Goods Received",       "done": bool(gr) or po.get("status") == "received",
         "details": f"Received: {str(gr.get('received_date','pending'))[:10]}"},
        {"step": 9, "name": "Stock Updated",        "done": bool(gr),
         "details": "Inventory levels updated"},
        {"step":10, "name": "Cycle Complete",       "done": bool(gr),
         "details": "Requester notified"},
    ]

    completed = sum(1 for s in steps if s["done"])

    return {
        "pr_id":         pr_id,
        "pr_title":      pr.get("title"),
        "pr_status":     pr_status,
        "requested_by":  pr.get("requested_by"),
        "po":            po,
        "goods_receipt": gr,
        "cycle_steps":   steps,
        "completed_steps": completed,
        "total_steps":   len(steps),
        "completion_pct": round(completed / len(steps) * 100, 0),
        "is_complete":   bool(gr),
        "generated_at":  datetime.datetime.utcnow().isoformat(),
    }
