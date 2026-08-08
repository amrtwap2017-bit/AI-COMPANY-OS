"""
approval_center/repository.py — Sprint-078: DDD compliance
Cross-table query layer for unified approval queue.
RULE: Always filter by hotel_id — non-negotiable.
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List, Dict


def _row_to_dict(row) -> dict:
    if row is None:
        return {}
    if hasattr(row, "_mapping"):
        d = dict(row._mapping)
    elif hasattr(row, "__dict__"):
        d = {k: v for k, v in row.__dict__.items() if not k.startswith("_")}
    else:
        return {}
    return {k: (v.isoformat() if hasattr(v, "isoformat") else v)
            for k, v in d.items()}


def get_approval_queue(
    db: Session,
    hotel_id: str,
    limit: int = 10,
) -> List[dict]:
    """Get unified approval queue across all entity types."""
    h = {"hotel_id": hotel_id, "lim": limit}
    queue = []

    try:
        rows = db.execute(text("""
            SELECT id, title, total AS amount, 'quote' AS approval_type,
                   status, created_at, updated_at
            FROM quotes WHERE hotel_id=:hotel_id
            AND status IN ('review','sent')
            ORDER BY created_at DESC LIMIT :lim
        """), h).fetchall()
        queue.extend([_row_to_dict(r) for r in rows])
    except Exception:
        pass

    try:
        rows = db.execute(text("""
            SELECT id, pr_number AS title, requester, urgency,
                   0 AS amount, 'purchase_request' AS approval_type,
                   status, created_at, updated_at
            FROM purchase_requests WHERE hotel_id=:hotel_id
            AND status IN ('draft','pending')
            ORDER BY created_at DESC LIMIT :lim
        """), h).fetchall()
        queue.extend([_row_to_dict(r) for r in rows])
    except Exception:
        pass

    try:
        rows = db.execute(text("""
            SELECT id, po_number AS title, supplier_id, urgency,
                   total_amount AS amount, 'purchase_order' AS approval_type,
                   status, created_at, updated_at
            FROM purchase_orders WHERE hotel_id=:hotel_id
            AND status IN ('draft','pending')
            ORDER BY created_at DESC LIMIT :lim
        """), h).fetchall()
        queue.extend([_row_to_dict(r) for r in rows])
    except Exception:
        pass

    queue.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    return queue[:limit]


def get_approval_counts(
    db: Session,
    hotel_id: str,
) -> Dict[str, int]:
    """Get count of pending approvals per entity type."""
    h = {"hotel_id": hotel_id}
    counts = {"pending_quotes": 0, "pending_prs": 0, "pending_pos": 0}

    try:
        counts["pending_quotes"] = db.execute(text(
            "SELECT COUNT(*) FROM quotes "
            "WHERE hotel_id=:hotel_id AND status IN ('review','sent')"
        ), h).scalar() or 0
    except Exception:
        pass

    try:
        counts["pending_prs"] = db.execute(text(
            "SELECT COUNT(*) FROM purchase_requests "
            "WHERE hotel_id=:hotel_id AND status IN ('draft','pending')"
        ), h).scalar() or 0
    except Exception:
        pass

    try:
        counts["pending_pos"] = db.execute(text(
            "SELECT COUNT(*) FROM purchase_orders "
            "WHERE hotel_id=:hotel_id AND status IN ('draft','pending')"
        ), h).scalar() or 0
    except Exception:
        pass

    counts["total"] = sum(v for v in counts.values())
    return counts


def approve_item(
    db: Session,
    approval_id: str,
    approval_type: str,
    hotel_id: str,
    actor_id: Optional[str] = None,
) -> bool:
    """Approve a single item. Returns True if successful."""
    TABLE_MAP = {
        "quote": ("quotes", "approved"),
        "purchase_request": ("purchase_requests", "approved"),
        "purchase_order": ("purchase_orders", "approved"),
    }
    if approval_type not in TABLE_MAP:
        return False
    table, new_status = TABLE_MAP[approval_type]
    try:
        result = db.execute(text(f"""
            UPDATE {table} SET status=:status
            WHERE id=:id AND hotel_id=:hotel_id
        """), {"status": new_status, "id": approval_id, "hotel_id": hotel_id})
        db.commit()
        return result.rowcount > 0
    except Exception:
        db.rollback()
        return False


def reject_item(
    db: Session,
    approval_id: str,
    approval_type: str,
    hotel_id: str,
    reason: Optional[str] = None,
) -> bool:
    """Reject a single item. Returns True if successful."""
    TABLE_MAP = {
        "quote": ("quotes", "rejected"),
        "purchase_request": ("purchase_requests", "rejected"),
        "purchase_order": ("purchase_orders", "rejected"),
    }
    if approval_type not in TABLE_MAP:
        return False
    table, new_status = TABLE_MAP[approval_type]
    try:
        result = db.execute(text(f"""
            UPDATE {table} SET status=:status
            WHERE id=:id AND hotel_id=:hotel_id
        """), {"status": new_status, "id": approval_id, "hotel_id": hotel_id})
        db.commit()
        return result.rowcount > 0
    except Exception:
        db.rollback()
        return False
