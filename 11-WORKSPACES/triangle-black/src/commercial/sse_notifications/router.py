from __future__ import annotations
"""
Triangle Black SSE (Server-Sent Events) Notification Push — Sprint 87
Replaces polling-based notifications with real-time push.
Uses FastAPI StreamingResponse with SSE protocol.
"""
import asyncio
import datetime
import json
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db

router = APIRouter(prefix="/sse", tags=["sse-notifications"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

async def _generate_signals(db: Session, hotel_id: str = None):
    """Generate real-time operational signals for SSE stream."""
    signals = []
    now = datetime.datetime.utcnow()

    # Critical unassigned WOs
    try:
        where = "AND hotel_id = :hotel_id" if hotel_id else ""
        rows = db.execute(text(f"""
            SELECT count(*) as cnt FROM work_orders
            WHERE priority = 'critical' AND status = 'open'
            AND technician_id IS NULL
            AND created_at < NOW() - INTERVAL '2 hours'
            {where}
        """), {"hotel_id": hotel_id} if hotel_id else {}).fetchone()
        cnt = int(row_to_dict(rows).get("cnt") or 0)
        if cnt > 0:
            signals.append({
                "type":     "critical_wo",
                "priority": "critical",
                "message":  f"{cnt} critical work orders unassigned for >2 hours",
                "count":    cnt,
            })
    except Exception:
        pass

    # Low stock
    try:
        rows = db.execute(text("""
            SELECT count(*) as cnt FROM inventory_items ii
            JOIN stock_balances sb ON sb.item_id = ii.id
            WHERE sb.quantity <= ii.min_stock
        """)).fetchone()
        cnt = int(row_to_dict(rows).get("cnt") or 0)
        if cnt > 0:
            signals.append({
                "type":     "low_stock",
                "priority": "high",
                "message":  f"{cnt} inventory items below minimum stock",
                "count":    cnt,
            })
    except Exception:
        pass

    # Overdue PMs
    try:
        rows = db.execute(text("""
            SELECT count(*) as cnt FROM maintenance_plans
            WHERE next_due_date < CURRENT_DATE AND status = 'active'
        """)).fetchone()
        cnt = int(row_to_dict(rows).get("cnt") or 0)
        if cnt > 0:
            signals.append({
                "type":     "pm_overdue",
                "priority": "high",
                "message":  f"{cnt} maintenance plans overdue",
                "count":    cnt,
            })
    except Exception:
        pass

    # Overdue invoices
    try:
        rows = db.execute(text("""
            SELECT count(*) as cnt FROM invoices
            WHERE status IN ('unpaid','overdue') AND due_date < NOW()
        """)).fetchone()
        cnt = int(row_to_dict(rows).get("cnt") or 0)
        if cnt > 0:
            signals.append({
                "type":     "invoice_overdue",
                "priority": "high",
                "message":  f"{cnt} invoices past due",
                "count":    cnt,
            })
    except Exception:
        pass

    return {
        "signals":    signals,
        "total":      len(signals),
        "critical":   sum(1 for s in signals if s["priority"] == "critical"),
        "high":       sum(1 for s in signals if s["priority"] == "high"),
        "timestamp":  now.isoformat(),
    }

async def _sse_event_generator(hotel_id: str = None, interval: int = 30):
    """
    Async generator for SSE stream.
    Sends operational signals every {interval} seconds.
    Client connects once and receives updates automatically.
    """
    from src.core.database import get_db as _get_db
    db = next(_get_db())

    try:
        iteration = 0
        while True:
            iteration += 1
            try:
                data = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: asyncio.run(_generate_signals(db, hotel_id))
                    if False  # Use sync call below
                    else _generate_signals_sync(db, hotel_id)
                )
                yield f"id: {iteration}\n"
                yield f"event: signals\n"
                yield f"data: {json.dumps(data)}\n"
                yield f"\n"
            except Exception as e:
                yield f"event: error\n"
                yield f"data: {json.dumps({'error': str(e)})}\n"
                yield f"\n"

            await asyncio.sleep(interval)
    finally:
        db.close()

def _generate_signals_sync(db, hotel_id=None):
    """Synchronous version of signal generation for SSE."""
    signals = []
    now = datetime.datetime.utcnow()
    queries = {
        "critical_wo":    ("critical unassigned WOs >2h",    "SELECT count(*) as cnt FROM work_orders WHERE priority='critical' AND status='open' AND technician_id IS NULL AND created_at < NOW() - INTERVAL '2 hours'"),
        "low_stock":      ("items below min stock",           "SELECT count(*) as cnt FROM inventory_items ii JOIN stock_balances sb ON sb.item_id=ii.id WHERE sb.quantity<=ii.min_stock"),
        "pm_overdue":     ("PM plans overdue",                "SELECT count(*) as cnt FROM maintenance_plans WHERE next_due_date < CURRENT_DATE AND status='active'"),
        "invoice_overdue":("invoices past due",               "SELECT count(*) as cnt FROM invoices WHERE status IN ('unpaid','overdue') AND due_date < NOW()"),
    }
    priority_map = {"critical_wo": "critical", "low_stock": "high", "pm_overdue": "high", "invoice_overdue": "high"}
    for key, (label, sql) in queries.items():
        try:
            row = db.execute(text(sql)).fetchone()
            cnt = int(row_to_dict(row).get("cnt") or 0)
            if cnt > 0:
                signals.append({"type": key, "priority": priority_map[key], "message": f"{cnt} {label}", "count": cnt})
        except Exception:
            pass
    return {
        "signals":   signals,
        "total":     len(signals),
        "critical":  sum(1 for s in signals if s["priority"] == "critical"),
        "high":      sum(1 for s in signals if s["priority"] == "high"),
        "timestamp": now.isoformat(),
        "version":   "sse-sprint87",
    }

@router.get("/notifications", summary="SSE notification stream")
async def sse_notifications(
    hotel_id: str = Query(default=None),
    interval: int = Query(default=30, ge=10, le=300),
):
    """
    Server-Sent Events stream for real-time notifications.
    Client subscribes once — receives push updates every {interval} seconds.
    No polling required.

    Usage: const es = new EventSource('/api/v1/sse/notifications');
           es.addEventListener('signals', e => console.log(JSON.parse(e.data)));
    """
    from src.core.database import get_db as _get_db

    async def event_stream():
        db = next(_get_db())
        iteration = 0
        try:
            while True:
                iteration += 1
                try:
                    data = _generate_signals_sync(db, hotel_id)
                    yield f"id: {iteration}\n"
                    yield f"event: signals\n"
                    yield f"data: {json.dumps(data)}\n"
                    yield f"\n"
                except Exception as e:
                    yield f"event: error\n"
                    yield f"data: {json.dumps({'error': str(e)})}\n"
                    yield f"\n"
                await asyncio.sleep(interval)
        except asyncio.CancelledError:
            pass
        finally:
            db.close()

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":               "no-cache",
            "Connection":                  "keep-alive",
            "X-Accel-Buffering":          "no",
            "Access-Control-Allow-Origin": "*",
        }
    )

@router.get("/notifications/snapshot", summary="Single snapshot of current signals")
def notification_snapshot(
    hotel_id: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """Returns current signals as JSON (same as SSE but single response)."""
    return _generate_signals_sync(db, hotel_id)
