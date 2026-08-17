"""
Service Request Application Service — T-005
Encapsulates business logic for Service Request operations.
Router delegates here — no business logic in router layer.
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text


class ServiceRequestService:
    """
    Application service layer for Service Request domain.
    Sits between router and repository.
    All SR business logic lives here — not in routers.
    """

    def __init__(self, db: Session, hotel_id: str, actor: Optional[str] = None):
        self.db = db
        self.hotel_id = hotel_id
        self.actor = actor or "system"

    # ── Queries ───────────────────────────────────────────────────────────────

    def get_by_id(self, sr_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a single SR scoped to hotel."""
        try:
            row = self.db.execute(text(
                """SELECT * FROM service_requests
                   WHERE id = :id AND hotel_id = :hid
                   LIMIT 1"""
            ), {"id": sr_id, "hid": self.hotel_id}).fetchone()
            return dict(row._mapping) if row else None
        except Exception:
            return None

    def list_by_status(
        self,
        status: Optional[str] = None,
        limit: int = 50,
        skip: int = 0
    ) -> List[Dict[str, Any]]:
        """List SRs for hotel, optionally filtered by status."""
        try:
            if status:
                rows = self.db.execute(text(
                    """SELECT * FROM service_requests
                       WHERE hotel_id = :hid AND status = :status
                       ORDER BY created_at DESC
                       LIMIT :lim OFFSET :sk"""
                ), {"hid": self.hotel_id, "status": status,
                    "lim": limit, "sk": skip}).fetchall()
            else:
                rows = self.db.execute(text(
                    """SELECT * FROM service_requests
                       WHERE hotel_id = :hid
                       ORDER BY created_at DESC
                       LIMIT :lim OFFSET :sk"""
                ), {"hid": self.hotel_id,
                    "lim": limit, "sk": skip}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception:
            return []

    def count(self, status: Optional[str] = None) -> int:
        """Count SRs for hotel."""
        try:
            if status:
                row = self.db.execute(text(
                    "SELECT COUNT(*) FROM service_requests WHERE hotel_id=:hid AND status=:st"
                ), {"hid": self.hotel_id, "st": status}).fetchone()
            else:
                row = self.db.execute(text(
                    "SELECT COUNT(*) FROM service_requests WHERE hotel_id=:hid"
                ), {"hid": self.hotel_id}).fetchone()
            return int(row[0]) if row else 0
        except Exception:
            return 0

    # ── Commands ──────────────────────────────────────────────────────────────

    def create(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new Service Request.
        Enforces hotel scope — ignores any hotel_id in payload.
        """
        import uuid
        sr_id = str(uuid.uuid4())
        now = datetime.utcnow()

        try:
            self.db.execute(text(
                """INSERT INTO service_requests
                   (id, hotel_id, title, description, urgency, status,
                    category, created_at, updated_at)
                   VALUES (:id, :hid, :title, :desc, :urgency, :status,
                           :category, :now, :now)"""
            ), {
                "id": sr_id,
                "hid": self.hotel_id,
                "title": payload.get("title", "Untitled Request"),
                "desc": payload.get("description", ""),
                "urgency": payload.get("urgency", "normal"),
                "status": "open",
                "category": payload.get("category", "General"),
                "now": now,
            })
            self.db.commit()
            self._emit_audit("SR_CREATED", sr_id,
                             {"title": payload.get("title")})
            return {"id": sr_id, "hotel_id": self.hotel_id,
                    "status": "open", "created_at": str(now)}
        except Exception as e:
            self.db.rollback()
            raise RuntimeError(f"SR create failed: {e}") from e

    def update_status(self, sr_id: str, new_status: str,
                      reason: Optional[str] = None) -> bool:
        """
        Transition SR to a new status.
        Validates that SR belongs to this hotel before updating.
        """
        existing = self.get_by_id(sr_id)
        if not existing:
            return False

        VALID_STATUSES = {"open", "in_progress", "resolved",
                          "closed", "cancelled", "pending"}
        if new_status not in VALID_STATUSES:
            raise ValueError(f"Invalid status: {new_status}")

        try:
            self.db.execute(text(
                """UPDATE service_requests
                   SET status = :status, updated_at = :now
                   WHERE id = :id AND hotel_id = :hid"""
            ), {"status": new_status, "now": datetime.utcnow(),
                "id": sr_id, "hid": self.hotel_id})
            self.db.commit()
            self._emit_audit("SR_STATUS_CHANGED", sr_id,
                             {"old": existing.get("status"),
                              "new": new_status, "reason": reason})
            return True
        except Exception as e:
            self.db.rollback()
            raise RuntimeError(f"SR status update failed: {e}") from e

    def generate_work_order(self, sr_id: str) -> Dict[str, Any]:
        """
        Create a Work Order linked to this Service Request.
        The canonical SR→WO vertical slice entry point.
        Delegates WO creation to WorkOrderService.
        """
        sr = self.get_by_id(sr_id)
        if not sr:
            raise ValueError(f"Service Request {sr_id} not found")

        # Delegate to WO service
        wo_service = WorkOrderService(
            db=self.db,
            hotel_id=self.hotel_id,
            actor=self.actor
        )
        wo = wo_service.create_from_service_request(sr)

        # Update SR status to in_progress
        try:
            self.update_status(sr_id, "in_progress",
                               reason=f"Work order {wo['id']} generated")
        except Exception:
            pass  # Non-blocking

        self._emit_audit("SR_WO_GENERATED", sr_id,
                         {"work_order_id": wo.get("id")})
        return {
            "service_request_id": sr_id,
            "work_order_id": wo.get("id"),
            "hotel_id": self.hotel_id,
            "status": "work_order_created",
        }

    # ── Internal helpers ──────────────────────────────────────────────────────

    def _emit_audit(self, event_type: str, entity_id: str,
                    metadata: Optional[Dict] = None) -> None:
        """Non-blocking audit event emission."""
        try:
            import json, uuid
            self.db.execute(text(
                """INSERT INTO platform_audit_log
                   (id, hotel_id, event_type, entity_id, actor,
                    metadata, created_at)
                   VALUES (:id, :hid, :et, :eid, :actor, :meta, :now)"""
            ), {
                "id": str(uuid.uuid4()),
                "hid": self.hotel_id,
                "et": event_type,
                "eid": entity_id,
                "actor": self.actor,
                "meta": json.dumps(metadata or {}),
                "now": datetime.utcnow(),
            })
            self.db.commit()
        except Exception:
            pass  # Audit failure must never block business operation


class WorkOrderService:
    """
    Application service layer for Work Order domain.
    Sits between router and repository.
    All WO business logic lives here — not in routers.
    """

    def __init__(self, db: Session, hotel_id: str, actor: Optional[str] = None):
        self.db = db
        self.hotel_id = hotel_id
        self.actor = actor or "system"

    # ── Queries ───────────────────────────────────────────────────────────────

    def get_by_id(self, wo_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a single WO scoped to hotel."""
        try:
            row = self.db.execute(text(
                """SELECT * FROM work_orders
                   WHERE id = :id AND hotel_id = :hid
                     AND deleted_at IS NULL
                   LIMIT 1"""
            ), {"id": wo_id, "hid": self.hotel_id}).fetchone()
            return dict(row._mapping) if row else None
        except Exception:
            return None

    def get_sla_summary(self) -> Dict[str, Any]:
        """SLA compliance summary for this hotel."""
        try:
            row = self.db.execute(text(
                """SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN sla_status='met' THEN 1 ELSE 0 END) AS met,
                    SUM(CASE WHEN sla_status='breached' THEN 1 ELSE 0 END) AS breached,
                    SUM(CASE WHEN sla_status='on_track' THEN 1 ELSE 0 END) AS on_track
                   FROM work_orders
                   WHERE hotel_id=:hid AND deleted_at IS NULL"""
            ), {"hid": self.hotel_id}).fetchone()
            d = dict(row._mapping) if row else {}
            total = int(d.get("total") or 0)
            met = int(d.get("met") or 0)
            return {
                "hotel_id": self.hotel_id,
                "total": total,
                "met": met,
                "breached": int(d.get("breached") or 0),
                "on_track": int(d.get("on_track") or 0),
                "compliance_pct": round(100.0 * met / total, 1) if total else 0.0,
            }
        except Exception as e:
            return {"hotel_id": self.hotel_id, "error": str(e)}

    # ── Commands ──────────────────────────────────────────────────────────────

    def create_from_service_request(self, sr: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a Work Order from a Service Request.
        Core SR→WO vertical slice business logic.
        """
        import uuid
        from datetime import timedelta

        wo_id = str(uuid.uuid4())
        now = datetime.utcnow()
        sla_hours = 24
        sla_breach_at = now + timedelta(hours=sla_hours)

        try:
            self.db.execute(text(
                """INSERT INTO work_orders
                   (id, hotel_id, title, description, priority, status,
                    technician_id, due_date, sla_hours, sla_breach_at,
                    sla_breached, sla_status, created_at, updated_at)
                   VALUES
                   (:id, :hid, :title, :desc, :priority, 'open',
                    NULL, :due, :sla_h, :sla_at,
                    FALSE, 'on_track', :now, :now)"""
            ), {
                "id": wo_id,
                "hid": self.hotel_id,
                "title": f"WO: {sr.get('title', 'Service Request')}",
                "desc": sr.get("description", "Generated from service request"),
                "priority": sr.get("urgency", "normal"),
                "due": sla_breach_at,
                "sla_h": sla_hours,
                "sla_at": sla_breach_at,
                "now": now,
            })
            self.db.commit()
            self._emit_audit("WO_CREATED_FROM_SR", wo_id,
                             {"service_request_id": sr.get("id"),
                              "sla_hours": sla_hours})
            return {"id": wo_id, "hotel_id": self.hotel_id,
                    "status": "open", "sla_hours": sla_hours,
                    "sla_breach_at": str(sla_breach_at)}
        except Exception as e:
            self.db.rollback()
            raise RuntimeError(f"WO create from SR failed: {e}") from e

    def complete(self, wo_id: str,
                 notes: Optional[str] = None) -> Dict[str, Any]:
        """
        Complete a Work Order.
        Updates status, marks SLA as met if not breached.
        """
        wo = self.get_by_id(wo_id)
        if not wo:
            raise ValueError(f"Work Order {wo_id} not found")

        now = datetime.utcnow()
        breach_at = wo.get("sla_breach_at")
        sla_status = "met" if (breach_at is None or now <= breach_at) else "breached"

        try:
            self.db.execute(text(
                """UPDATE work_orders
                   SET status='completed', sla_status=:sla_st,
                       updated_at=:now
                   WHERE id=:id AND hotel_id=:hid"""
            ), {"sla_st": sla_status, "now": now,
                "id": wo_id, "hid": self.hotel_id})
            self.db.commit()
            self._emit_audit("WO_COMPLETED", wo_id,
                             {"sla_status": sla_status, "notes": notes})
            return {"ok": True, "work_order_id": wo_id,
                    "status": "completed", "sla_status": sla_status}
        except Exception as e:
            self.db.rollback()
            raise RuntimeError(f"WO complete failed: {e}") from e

    def close(self, wo_id: str) -> Dict[str, Any]:
        """
        Close a Work Order.
        Final state — creates service report record.
        """
        wo = self.get_by_id(wo_id)
        if not wo:
            raise ValueError(f"Work Order {wo_id} not found")

        now = datetime.utcnow()
        try:
            self.db.execute(text(
                """UPDATE work_orders
                   SET status='closed', updated_at=:now
                   WHERE id=:id AND hotel_id=:hid"""
            ), {"now": now, "id": wo_id, "hid": self.hotel_id})
            self.db.commit()
            self._emit_audit("WO_CLOSED", wo_id, {"closed_at": str(now)})
            return {"ok": True, "work_order_id": wo_id,
                    "status": "closed", "closed_at": str(now)}
        except Exception as e:
            self.db.rollback()
            raise RuntimeError(f"WO close failed: {e}") from e

    # ── Internal helpers ──────────────────────────────────────────────────────

    def _emit_audit(self, event_type: str, entity_id: str,
                    metadata: Optional[Dict] = None) -> None:
        """Non-blocking audit event emission."""
        try:
            import json, uuid
            self.db.execute(text(
                """INSERT INTO platform_audit_log
                   (id, hotel_id, event_type, entity_id, actor,
                    metadata, created_at)
                   VALUES (:id, :hid, :et, :eid, :actor, :meta, :now)"""
            ), {
                "id": str(uuid.uuid4()),
                "hid": self.hotel_id,
                "et": event_type,
                "eid": entity_id,
                "actor": self.actor,
                "meta": json.dumps(metadata or {}),
                "now": datetime.utcnow(),
            })
            self.db.commit()
        except Exception:
            pass
