"""
Data Import Engine Service — Triangle Black SaaS v5.2
"""
import csv
import io
import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

class DataImportService:
    def __init__(self, db: Session):
        self.db = db

    def import_assets_csv(self, hotel_id: str, csv_content: str) -> Dict[str, Any]:
        imported_count = 0
        errors = []

        f = io.StringIO(csv_content.strip())
        reader = csv.DictReader(f)

        required_headers = {"name", "category", "criticality"}
        headers = set(reader.fieldnames or [])
        missing = required_headers - headers
        if missing:
            return {
                "success": False,
                "imported_count": 0,
                "errors": [f"Missing required columns in CSV header: {', '.join(missing)}"]
            }

        try:
            # 1. Resolve or create valid site_id for this hotel
            site_row = self.db.execute(text(
                "SELECT id FROM sites WHERE hotel_id = :h LIMIT 1"
            ), {"h": hotel_id}).fetchone()

            if site_row:
                site_id = site_row[0]
            else:
                site_id = f"site-{hotel_id[-8:]}" if len(hotel_id) >= 8 else "site-default"
                self.db.execute(text(
                    "INSERT INTO sites (id, hotel_id, name, location, is_active, created_at, updated_at) "
                    "VALUES (:sid, :hid, 'Main Compound', 'Default Site', true, NOW(), NOW()) "
                    "ON CONFLICT (id) DO NOTHING"
                ), {"sid": site_id, "hid": hotel_id})
                self.db.commit()

            # 2. Insert rows
            for idx, row in enumerate(reader, 1):
                name = row.get("name", "").strip()
                category = row.get("category", "Mechanical").strip()
                criticality = row.get("criticality", "medium").strip().lower()

                if not name:
                    errors.append(f"Row {idx}: Name column cannot be blank")
                    continue
                if criticality not in ["low", "medium", "high", "critical"]:
                    criticality = "medium"

                asset_id = f"ast-{uuid.uuid4().hex[:12]}"

                self.db.execute(text(
                    "INSERT INTO assets (id, hotel_id, site_id, name, category, criticality, status, created_at, updated_at) "
                    "VALUES (:id, :hid, :sid, :name, :cat, :crit, 'Operational', NOW(), NOW())"
                ), {
                    "id": asset_id,
                    "hid": hotel_id,
                    "sid": site_id,
                    "name": name,
                    "cat": category,
                    "crit": criticality
                })
                imported_count += 1

            self.db.commit()
            return {
                "success": len(errors) == 0,
                "imported_count": imported_count,
                "errors": errors
            }

        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "imported_count": 0,
                "errors": [f"Database error during import: {str(e)}"]
            }
