"""
Import Batch Tracking Service
Prevents partial import disasters and enables duplicate detection.

BEFORE: Customer uploads 5,000 WOs → fails at 3,200 → 1,800 missing, no trace
AFTER:  Every import has a batch_id → status → row counts → error summary
"""
from __future__ import annotations
import hashlib
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text


class ImportBatchService:
    """Tracks every import operation for auditability and idempotency."""

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id
        self._ensure_table()

    def _ensure_table(self):
        """Create import_batches table if not exists."""
        try:
            self.db.execute(text("""
                CREATE TABLE IF NOT EXISTS import_batches (
                    id              VARCHAR(36) PRIMARY KEY,
                    hotel_id        VARCHAR(100) NOT NULL,
                    entity_type     VARCHAR(50) NOT NULL,
                    filename        VARCHAR(500),
                    file_hash       VARCHAR(64),
                    status          VARCHAR(20) DEFAULT 'started',
                    rows_total      INTEGER DEFAULT 0,
                    rows_imported   INTEGER DEFAULT 0,
                    rows_skipped    INTEGER DEFAULT 0,
                    rows_failed     INTEGER DEFAULT 0,
                    started_at      TIMESTAMP DEFAULT NOW(),
                    completed_at    TIMESTAMP,
                    created_by      VARCHAR(200),
                    error_summary   TEXT,
                    data_classification VARCHAR(30) DEFAULT 'IMPORTED',
                    source          VARCHAR(100) DEFAULT 'customer_upload',
                    notes           TEXT
                )
            """))
            self.db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_import_batches_hotel
                ON import_batches(hotel_id, entity_type, started_at)
            """))
            self.db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_import_batches_hash
                ON import_batches(hotel_id, file_hash)
                WHERE file_hash IS NOT NULL
            """))
            self.db.commit()
        except Exception:
            self.db.rollback()

    @staticmethod
    def compute_file_hash(content: str) -> str:
        """SHA-256 of file content for duplicate detection."""
        return hashlib.sha256(content.encode("utf-8", errors="ignore")).hexdigest()

    def check_duplicate(self, file_hash: str, entity_type: str) -> Optional[Dict[str, Any]]:
        """Check if this exact file was already imported successfully."""
        row = self.db.execute(text("""
            SELECT id, status, rows_imported, rows_total, completed_at
            FROM import_batches
            WHERE hotel_id = :h AND file_hash = :hash
            AND entity_type = :entity AND status = 'completed'
            ORDER BY completed_at DESC LIMIT 1
        """), {"h": self.hotel_id, "hash": file_hash, "entity": entity_type}).fetchone()

        if row:
            d = dict(row._mapping)
            return {
                "duplicate": True,
                "batch_id": d["id"],
                "rows_imported": d["rows_imported"],
                "completed_at": str(d["completed_at"]),
                "message": f"This file was already imported ({d['rows_imported']} records). batch_id={d['id']}",
            }
        return None

    def start_batch(
        self,
        entity_type: str,
        rows_total: int,
        filename: Optional[str] = None,
        file_hash: Optional[str] = None,
        created_by: str = "system",
        data_classification: str = "IMPORTED",
        source: str = "customer_upload",
    ) -> Dict[str, Any]:
        """Create a new import batch record."""
        import uuid
        batch_id = str(uuid.uuid4())
        now = datetime.utcnow()

        try:
            self.db.execute(text("""
                INSERT INTO import_batches
                (id, hotel_id, entity_type, filename, file_hash, status,
                 rows_total, started_at, created_by, data_classification, source)
                VALUES (:id, :h, :entity, :filename, :hash, 'started',
                        :rows_total, :now, :created_by, :cls, :source)
            """), {
                "id": batch_id, "h": self.hotel_id,
                "entity": entity_type, "filename": filename,
                "hash": file_hash, "rows_total": rows_total,
                "now": now, "created_by": created_by,
                "cls": data_classification, "source": source,
            })
            self.db.commit()
            return {
                "success": True,
                "batch_id": batch_id,
                "entity_type": entity_type,
                "rows_total": rows_total,
                "status": "started",
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)[:150]}

    def complete_batch(
        self,
        batch_id: str,
        rows_imported: int,
        rows_skipped: int = 0,
        rows_failed: int = 0,
        error_summary: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Mark batch as completed with final row counts."""
        status = "completed" if rows_failed == 0 else "partial"
        if rows_imported == 0 and rows_failed > 0:
            status = "failed"

        try:
            self.db.execute(text("""
                UPDATE import_batches
                SET status = :status,
                    rows_imported = :imported,
                    rows_skipped = :skipped,
                    rows_failed = :failed,
                    completed_at = NOW(),
                    error_summary = :errors
                WHERE id = :id AND hotel_id = :h
            """), {
                "status": status, "imported": rows_imported,
                "skipped": rows_skipped, "failed": rows_failed,
                "errors": error_summary, "id": batch_id, "h": self.hotel_id,
            })
            self.db.commit()
            return {
                "success": True,
                "batch_id": batch_id,
                "status": status,
                "rows_imported": rows_imported,
                "rows_skipped": rows_skipped,
                "rows_failed": rows_failed,
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)[:150]}

    def invalidate_batch(self, batch_id: str, reason: str = "Manual rollback") -> Dict[str, Any]:
        """Mark batch as rolled back (data should be considered invalid)."""
        try:
            result = self.db.execute(text("""
                UPDATE import_batches
                SET status = 'rolled_back',
                    error_summary = :reason,
                    completed_at = NOW()
                WHERE id = :id AND hotel_id = :h
                AND status NOT IN ('rolled_back')
                RETURNING id, entity_type, rows_imported
            """), {"reason": reason, "id": batch_id, "h": self.hotel_id}).fetchone()

            self.db.commit()
            if result:
                d = dict(result._mapping)
                return {
                    "success": True,
                    "batch_id": batch_id,
                    "status": "rolled_back",
                    "entity_type": d["entity_type"],
                    "rows_affected": d["rows_imported"],
                    "warning": "Records remain in DB — manual cleanup required if needed",
                }
            return {"success": False, "error": "Batch not found or already rolled back"}
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)[:150]}

    def list_batches(self, entity_type: Optional[str] = None, limit: int = 20) -> list:
        """List recent import batches for this hotel."""
        where = "WHERE hotel_id = :h"
        params: Dict[str, Any] = {"h": self.hotel_id, "limit": limit}
        if entity_type:
            where += " AND entity_type = :entity"
            params["entity"] = entity_type

        rows = self.db.execute(text(f"""
            SELECT id, entity_type, filename, status, rows_total, rows_imported,
                   rows_skipped, rows_failed, started_at, completed_at,
                   data_classification, created_by
            FROM import_batches
            {where}
            ORDER BY started_at DESC
            LIMIT :limit
        """), params).fetchall()

        return [dict(r._mapping) for r in rows]
