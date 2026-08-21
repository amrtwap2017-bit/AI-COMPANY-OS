"""
Repository for Goods Receipt Workflow Domain
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

class GoodsReceiptWorkflowRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_pending_pos(self, hotel_id: str) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT id, title, vendor_id, total_amount, status, created_at
            FROM purchase_orders
            WHERE hotel_id = :hid
              AND status = 'approved'
            ORDER BY created_at DESC
        """), {"hid": hotel_id}).fetchall()
        return [dict(r._mapping) for r in rows]

    def get_cycle_status(self, pr_id: str, hotel_id: str) -> Optional[Dict[str, Any]]:
        row = self.db.execute(text("""
            SELECT pr.id AS pr_id, pr.status AS pr_status, pr.title,
                   po.id AS po_id, po.status AS po_status,
                   gr.id AS gr_id, gr.status AS gr_status
            FROM purchase_requests pr
            LEFT JOIN purchase_orders po ON po.request_id = pr.id
            LEFT JOIN goods_receipts gr ON gr.purchase_order_id = po.id
            WHERE pr.id = :pr_id AND pr.hotel_id = :hid
        """), {"pr_id": pr_id, "hid": hotel_id}).fetchone()
        return dict(row._mapping) if row else None
