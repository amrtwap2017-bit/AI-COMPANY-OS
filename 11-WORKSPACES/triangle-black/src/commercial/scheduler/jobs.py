from __future__ import annotations
"""
Triangle Black Background Scheduler — Sprint 80 (clean rewrite)
Provides job functions callable by APScheduler or any cron system.
APScheduler integration is optional — backend starts without it.
"""
import datetime
from datetime import datetime as _dt
import logging
import uuid

logger = logging.getLogger("tb.scheduler")


def start_scheduler(app=None):
    """
    Start background scheduler on FastAPI startup.
    If APScheduler is available, registers 3 jobs.
    If not, runs in stub mode (jobs callable manually).
    """
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        from apscheduler.triggers.cron import CronTrigger

        scheduler = AsyncIOScheduler(timezone="Africa/Cairo")

        scheduler.add_job(
            job_check_reorder,
            CronTrigger(hour=6, minute=0, timezone="Africa/Cairo"),
            id="auto_reorder",
            replace_existing=True,
        )
        scheduler.add_job(
            job_critical_wo_check,
            CronTrigger(minute="*/30"),
            id="critical_wo_check",
            replace_existing=True,
        )
        scheduler.add_job(
            job_daily_sla_report,
            CronTrigger(hour=7, minute=0, timezone="Africa/Cairo"),
            id="daily_sla",
            replace_existing=True,
        )

        scheduler.start()
        logger.info("Scheduler started — 3 jobs registered (APScheduler)")
        return scheduler

    except ImportError:
        logger.info("APScheduler not installed — stub mode (jobs callable manually)")
        return None
    except Exception as e:
        logger.warning(f"Scheduler start failed: {e} — stub mode")
        return None


def stop_scheduler(scheduler=None):
    """Stop scheduler gracefully."""
    if scheduler is None:
        return
    try:
        if hasattr(scheduler, "shutdown") and scheduler.running:
            scheduler.shutdown()
            logger.info("Scheduler stopped")
    except Exception:
        pass


async def job_check_reorder():
    """
    Daily auto-reorder job (06:00 Cairo).
    Creates Purchase Requests for inventory items below minimum stock.
    """
    try:
        from src.core.database import get_db
        from sqlalchemy import text

        db = next(get_db())
        rows = db.execute(text(
            "SELECT ii.id, ii.name, ii.hotel_id, ii.min_stock, ii.reorder_qty, "
            "COALESCE(sb.quantity, 0) as current_stock "
            "FROM inventory_items ii "
            "LEFT JOIN stock_balances sb ON sb.item_id = ii.id "
            "WHERE COALESCE(sb.quantity, 0) <= ii.min_stock"
        )).fetchall()

        count = 0
        now = _dt.utcnow()

        for row in rows:
            item = dict(row._mapping) if hasattr(row, "_mapping") else {}
            qty = max(
                int(item.get("reorder_qty") or 0),
                int(item.get("min_stock") or 0) - int(item.get("current_stock") or 0)
            )
            if qty <= 0:
                continue
            try:
                db.execute(text(
                    "INSERT INTO purchase_requests "
                    "(id, hotel_id, title, description, status, requested_by, "
                    "required_date, created_at, updated_at) "
                    "VALUES (:id, :hotel_id, :title, :desc, 'submitted', 'scheduler', "
                    ":req_date, :now, :now)"
                ), {
                    "id":       str(uuid.uuid4()),
                    "hotel_id": item.get("hotel_id"),
                    "title":    f"SCHEDULED-REORDER: {item.get('name')} x{qty}",
                    "desc":     (f"Auto-generated. Stock: {item.get('current_stock')} "
                                 f"Min: {item.get('min_stock')} Reorder: {qty}"),
                    "req_date": now + datetime.timedelta(days=7),
                    "now":      now,
                })
                count += 1
            except Exception:
                pass

        if count > 0:
            db.commit()

        logger.info(f"Auto-reorder job: {count} PRs created")
        db.close()

    except Exception as e:
        logger.error(f"Auto-reorder job failed: {e}")


async def job_critical_wo_check():
    """
    Every 30 minutes: check for critical unassigned WOs > 2 hours old.
    Logs a warning for each — future: send email notification.
    """
    try:
        from src.core.database import get_db
        from sqlalchemy import text

        db = next(get_db())
        row = db.execute(text(
            "SELECT count(*) as cnt FROM work_orders "
            "WHERE priority = 'critical' "
            "AND status = 'open' "
            "AND technician_id IS NULL "
            "AND created_at < NOW() - INTERVAL '2 hours'"
        )).fetchone()

        cnt = int(
            (dict(row._mapping) if hasattr(row, "_mapping") else {}).get("cnt") or 0
        )
        if cnt > 0:
            logger.warning(f"ALERT: {cnt} critical WOs unassigned for >2 hours")

        db.close()

    except Exception as e:
        logger.error(f"Critical WO check failed: {e}")


async def job_daily_sla_report():
    """
    Daily 07:00: log SLA compliance summary for the current month.
    """
    try:
        from src.core.database import get_db
        from sqlalchemy import text

        db = next(get_db())
        row = db.execute(text(
            "SELECT count(*) as total, "
            "sum(CASE WHEN status IN ('completed','closed') THEN 1 ELSE 0 END) as done "
            "FROM work_orders "
            "WHERE created_at >= DATE_TRUNC('month', NOW())"
        )).fetchone()

        d = dict(row._mapping) if hasattr(row, "_mapping") else {}
        total = int(d.get("total") or 0)
        done  = int(d.get("done") or 0)
        rate  = round(done / total * 100, 1) if total > 0 else 0.0

        logger.info(f"Daily SLA: {done}/{total} completed ({rate}%) this month")
        db.close()

    except Exception as e:
        logger.error(f"Daily SLA report failed: {e}")
