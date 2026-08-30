"""
Data Import Engine Service — Triangle Black V6-C02
Upgrade: preview, validate, suppliers, PM plans, audit trail
"""
from __future__ import annotations
import csv
import io
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger("tb.data_import")

ASSET_REQUIRED = {"name"}
ASSET_OPTIONAL = {"category", "criticality", "location", "serial_number",
                  "manufacturer", "model", "status"}

SUPPLIER_REQUIRED = {"name"}
SUPPLIER_OPTIONAL = {"category", "contact_email", "contact_phone",
                     "contact_name", "city", "country"}

PM_REQUIRED = {"asset_name", "frequency_days"}
PM_OPTIONAL = {"next_due_date", "description", "priority"}

VALID_CRITICALITY = {"low", "medium", "high", "critical"}
VALID_STATUS      = {"operational", "maintenance", "decommissioned", "standby"}


def _parse_csv(csv_content: str) -> tuple[list[str], list[dict]]:
    """Parse CSV string → (headers, rows). Returns empty on failure."""
    try:
        f = io.StringIO(csv_content.strip())
        reader = csv.DictReader(f)
        headers = list(reader.fieldnames or [])
        rows = [dict(r) for r in reader]
        return headers, rows
    except Exception as e:
        return [], []


class DataImportService:
    def __init__(self, db: Session):
        self.db = db

    # ── PREVIEW ──────────────────────────────────────────────────────────────

    def preview_csv(self, csv_content: str, entity: str = "assets") -> Dict[str, Any]:
        """Parse CSV and return first 10 rows + schema detection. No DB write."""
        headers, rows = _parse_csv(csv_content)
        if not headers:
            return {"valid": False, "error": "Cannot parse CSV — check file format",
                    "headers": [], "preview_rows": [], "total_rows": 0}

        required = ASSET_REQUIRED if entity == "assets" else \
                   SUPPLIER_REQUIRED if entity == "suppliers" else PM_REQUIRED
        optional = ASSET_OPTIONAL if entity == "assets" else \
                   SUPPLIER_OPTIONAL if entity == "suppliers" else PM_OPTIONAL

        missing_required = [h for h in required if h not in headers]
        unknown_cols = [h for h in headers if h not in required | optional]

        return {
            "valid": len(missing_required) == 0,
            "entity": entity,
            "headers": headers,
            "required_present": [h for h in required if h in headers],
            "missing_required": missing_required,
            "optional_present": [h for h in optional if h in headers],
            "unknown_columns": unknown_cols,
            "total_rows": len(rows),
            "preview_rows": rows[:10],
            "note": f"Showing first {min(10, len(rows))} of {len(rows)} rows",
        }

    # ── VALIDATE ONLY ────────────────────────────────────────────────────────

    def validate_csv(self, hotel_id: str, csv_content: str,
                     entity: str = "assets") -> Dict[str, Any]:
        """Validate CSV content fully. Returns errors per row. NO DB write."""
        headers, rows = _parse_csv(csv_content)
        if not headers:
            return {"valid": False, "errors": ["Cannot parse CSV"],
                    "error_count": 1, "valid_row_count": 0, "total_rows": 0}

        errors = []
        valid_rows = 0

        if entity == "assets":
            for idx, row in enumerate(rows, 1):
                row_errors = []
                name = row.get("name", "").strip()
                crit = row.get("criticality", "medium").strip().lower()
                stat = row.get("status", "operational").strip().lower()

                if not name:
                    row_errors.append("name is required")
                if crit and crit not in VALID_CRITICALITY:
                    row_errors.append(
                        f"criticality '{crit}' invalid — use: {', '.join(VALID_CRITICALITY)}"
                    )
                if stat and stat not in VALID_STATUS:
                    row_errors.append(
                        f"status '{stat}' invalid — use: {', '.join(VALID_STATUS)}"
                    )
                if row_errors:
                    errors.append({"row": idx, "data": row, "errors": row_errors})
                else:
                    valid_rows += 1

        elif entity == "suppliers":
            for idx, row in enumerate(rows, 1):
                row_errors = []
                name = row.get("name", "").strip()
                if not name:
                    row_errors.append("name is required")
                email = row.get("contact_email", "").strip()
                if email and "@" not in email:
                    row_errors.append(f"contact_email '{email}' is not a valid email")
                if row_errors:
                    errors.append({"row": idx, "data": row, "errors": row_errors})
                else:
                    valid_rows += 1

        elif entity == "pm-plans":
            for idx, row in enumerate(rows, 1):
                row_errors = []
                asset_name = row.get("asset_name", "").strip()
                freq = row.get("frequency_days", "").strip()
                if not asset_name:
                    row_errors.append("asset_name is required")
                if not freq:
                    row_errors.append("frequency_days is required")
                elif not freq.isdigit():
                    row_errors.append(f"frequency_days must be a number, got '{freq}'")
                if row_errors:
                    errors.append({"row": idx, "data": row, "errors": row_errors})
                else:
                    valid_rows += 1

        return {
            "valid": len(errors) == 0,
            "entity": entity,
            "total_rows": len(rows),
            "valid_row_count": valid_rows,
            "error_count": len(errors),
            "errors": errors,
            "ready_to_import": len(errors) == 0 and valid_rows > 0,
        }

    # ── IMPORT ASSETS ────────────────────────────────────────────────────────

    def import_assets_csv(self, hotel_id: str, csv_content: str,
                          dry_run: bool = False) -> Dict[str, Any]:
        """Import assets from CSV. dry_run=True validates without committing."""
        validation = self.validate_csv(hotel_id, csv_content, "assets")
        if not validation["valid"] and validation["error_count"] > 0:
            return {
                "success": False,
                "dry_run": dry_run,
                "imported_count": 0,
                "errors": validation["errors"],
                "error_summary": [
                    f"Row {e['row']}: {'; '.join(e['errors'])}"
                    for e in validation["errors"][:10]
                ],
            }

        _, rows = _parse_csv(csv_content)
        imported_count = 0
        errors = []

        try:
            # Resolve or create site
            site_row = self.db.execute(
                text("SELECT id FROM sites WHERE hotel_id = :h LIMIT 1"),
                {"h": hotel_id}
            ).fetchone()

            if site_row:
                site_id = site_row[0]
            else:
                site_id = f"site-{hotel_id[-8:]}" if len(hotel_id) >= 8 else "site-default"
                self.db.execute(text(
                    "INSERT INTO sites (id, hotel_id, name, location, is_active, created_at, updated_at)"
                    " VALUES (:sid, :hid, 'Main Compound', 'Default', true, NOW(), NOW())"
                    " ON CONFLICT (id) DO NOTHING"
                ), {"sid": site_id, "hid": hotel_id})

            for idx, row in enumerate(rows, 1):
                name = row.get("name", "").strip()
                if not name:
                    errors.append(f"Row {idx}: name is blank — skipped")
                    continue

                criticality = row.get("criticality", "medium").strip().lower()
                if criticality not in VALID_CRITICALITY:
                    criticality = "medium"

                status = row.get("status", "operational").strip().lower()
                if status not in VALID_STATUS:
                    status = "operational"

                asset_id = f"ast-{uuid.uuid4().hex[:12]}"

                if not dry_run:
                    self.db.execute(text(
                        "INSERT INTO assets"
                        " (id, hotel_id, site_id, name, category, criticality,"
                        "  status, created_at, updated_at)"
                        " VALUES (:id, :hid, :sid, :name, :cat, :crit, :stat, NOW(), NOW())"
                    ), {
                        "id": asset_id,
                        "hid": hotel_id,
                        "sid": site_id,
                        "name": name,
                        "cat": row.get("category", "General").strip() or "General",
                        "crit": criticality,
                        "stat": status,
                    })

                imported_count += 1

            if not dry_run:
                self.db.commit()
                self._record_audit(hotel_id, "assets", imported_count, len(rows))

            return {
                "success": True,
                "dry_run": dry_run,
                "imported_count": imported_count,
                "total_rows": len(rows),
                "skipped_count": len(rows) - imported_count,
                "errors": errors,
            }

        except Exception as e:
            self.db.rollback()
            logger.error(f"Asset import failed for {hotel_id}: {e}")
            return {
                "success": False,
                "dry_run": dry_run,
                "imported_count": 0,
                "errors": [f"Database error: {str(e)[:200]}"],
            }

    # ── IMPORT SUPPLIERS ─────────────────────────────────────────────────────

    def import_suppliers_csv(self, hotel_id: str, csv_content: str,
                             dry_run: bool = False) -> Dict[str, Any]:
        """Import suppliers from CSV."""
        validation = self.validate_csv(hotel_id, csv_content, "suppliers")
        if not validation["valid"] and validation["error_count"] > 0:
            return {"success": False, "dry_run": dry_run,
                    "imported_count": 0, "errors": validation["errors"]}

        _, rows = _parse_csv(csv_content)
        imported_count = 0
        errors = []

        try:
            for idx, row in enumerate(rows, 1):
                name = row.get("name", "").strip()
                if not name:
                    errors.append(f"Row {idx}: name blank — skipped")
                    continue

                if not dry_run:
                    sup_id = f"sup-{uuid.uuid4().hex[:12]}"
                    sup_code = f"SUP-{sup_id[-6:].upper()}"
                    self.db.execute(text(
                        "INSERT INTO suppliers"
                        " (id, hotel_id, supplier_code, company_name, category,"
                        "  email, phone, contact_person,"
                        "  status, supplier_type, preferred_flag, risk_level,"
                        "  created_at, updated_at)"
                        " VALUES (:id, :hid, :code, :cname, :cat,"
                        "  :email, :phone, :cperson,"
                        "  :status, :stype, :pflag, :risk,"
                        "  NOW(), NOW())"
                    ), {
                        "id": sup_id,
                        "hid": hotel_id,
                        "code": sup_code,
                        "cname": name,
                        "cat": row.get("category", "General").strip() or "General",
                        "email": row.get("contact_email", row.get("email", "")).strip(),
                        "phone": row.get("contact_phone", row.get("phone", "")).strip(),
                        "cperson": row.get("contact_name", row.get("contact_person", "")).strip(),
                        "status": "active",
                        "stype": "product",
                        "pflag": False,
                        "risk": "low",
                    })
                imported_count += 1

            if not dry_run:
                self.db.commit()
                self._record_audit(hotel_id, "suppliers", imported_count, len(rows))

            return {
                "success": True, "dry_run": dry_run,
                "imported_count": imported_count,
                "total_rows": len(rows),
                "errors": errors,
            }

        except Exception as e:
            self.db.rollback()
            return {"success": False, "dry_run": dry_run,
                    "imported_count": 0, "errors": [str(e)[:200]]}

    # ── IMPORT PM PLANS ─────────────────────────────────────────────────────

    def import_pm_plans_csv(self, hotel_id: str, csv_content: str,
                            dry_run: bool = False) -> dict:
        """
        Import PM plans from CSV.
        Required columns: title, plan_type
        Optional: asset_name, frequency, next_due_date, owner, notes

        asset_name used to look up asset_node_id from assets table.
        If asset_name not found: plan imported without asset link (warning).
        """
        import json
        VALID_PLAN_TYPES = {"preventive", "corrective", "inspection",
                           "statutory", "condition-based", "emergency"}
        VALID_FREQUENCIES = {"daily", "weekly", "monthly", "quarterly",
                            "semi-annual", "yearly", "annual", "biannual"}

        headers, rows = _parse_csv(csv_content)
        if not headers:
            return {"success": False, "dry_run": dry_run,
                    "imported_count": 0, "errors": ["Cannot parse CSV"]}

        # Validate required columns
        missing = [h for h in ["title", "plan_type"] if h not in headers]
        if missing:
            return {"success": False, "dry_run": dry_run,
                    "imported_count": 0,
                    "errors": [f"Missing required columns: {', '.join(missing)}"]}

        imported_count = 0
        errors = []
        warnings = []

        try:
            for idx, row in enumerate(rows, 1):
                title = row.get("title", "").strip()
                plan_type = row.get("plan_type", "preventive").strip().lower()
                asset_name = row.get("asset_name", "").strip()
                frequency = row.get("frequency", "monthly").strip().lower()
                next_due_date = row.get("next_due_date", "").strip()
                owner = row.get("owner", "").strip()
                notes = row.get("notes", "").strip()

                # Validate
                if not title:
                    errors.append({"row": idx, "errors": ["title is required"]})
                    continue
                if plan_type not in VALID_PLAN_TYPES:
                    plan_type = "preventive"  # graceful default
                if frequency not in VALID_FREQUENCIES:
                    frequency = "monthly"    # graceful default

                # Look up asset by name
                asset_node_id = None
                if asset_name:
                    try:
                        asset_row = self.db.execute(
                            text("SELECT id FROM assets WHERE hotel_id=:h "
                                 "AND LOWER(name) LIKE LOWER(:n) LIMIT 1"),
                            {"h": hotel_id, "n": f"%{asset_name}%"}
                        ).fetchone()
                        if asset_row:
                            asset_node_id = asset_row[0]
                        else:
                            warnings.append(f"Row {idx}: asset '{asset_name}' not found — plan created unlinked")
                    except Exception:
                        self.db.rollback()

                if not dry_run:
                    pm_id = str(uuid.uuid4())
                    self.db.execute(text("""
                        INSERT INTO maintenance_plans
                          (id, hotel_id, asset_node_id, title, plan_type,
                           frequency, next_due_date, status, owner, notes,
                           created_at, updated_at)
                        VALUES
                          (:id, :hid, :asset, :title, :plan_type,
                           :frequency, :next_due, 'active', :owner, :notes,
                           NOW(), NOW())
                    """), {
                        "id": pm_id,
                        "hid": hotel_id,
                        "asset": asset_node_id,
                        "title": title,
                        "plan_type": plan_type,
                        "frequency": frequency,
                        "next_due": next_due_date or None,
                        "owner": owner or None,
                        "notes": notes or None,
                    })

                imported_count += 1

            if not dry_run:
                self.db.commit()
                self._record_audit(hotel_id, "pm_plans", imported_count, len(rows))

            return {
                "success": True,
                "dry_run": dry_run,
                "imported_count": imported_count,
                "total_rows": len(rows),
                "skipped_count": len(errors),
                "warnings": warnings,
                "errors": errors,
            }

        except Exception as e:
            self.db.rollback()
            logger.error(f"PM plans import failed for {hotel_id}: {e}")
            return {
                "success": False, "dry_run": dry_run,
                "imported_count": 0,
                "errors": [f"Database error: {str(e)[:200]}"],
            }

        # ── IMPORT HISTORY ───────────────────────────────────────────────────────

    def get_import_history(self, hotel_id: str, limit: int = 20) -> List[Dict]:
        """Return recent import audit records for this hotel."""
        try:
            rows = self.db.execute(text("""
                SELECT entity_type, imported_count, total_rows,
                       created_at, status
                FROM import_audit_log
                WHERE hotel_id = :h
                ORDER BY created_at DESC
                LIMIT :lim
            """), {"h": hotel_id, "lim": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception:
            return []

    def _record_audit(self, hotel_id: str, entity: str,
                      imported: int, total: int) -> None:
        """Record import to audit log (best effort — never fail import)."""
        try:
            self.db.execute(text("""
                INSERT INTO import_audit_log
                  (id, hotel_id, entity_type, imported_count, total_rows,
                   status, created_at)
                VALUES
                  (:id, :hid, :entity, :imported, :total, 'completed', NOW())
            """), {
                "id": str(uuid.uuid4()),
                "hid": hotel_id,
                "entity": entity,
                "imported": imported,
                "total": total,
            })
            self.db.commit()
        except Exception:
            pass  # Audit failure must never break the import
