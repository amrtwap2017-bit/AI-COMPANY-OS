"""
Data Import Engine Service — Triangle Black SaaS v5.2
Parses, validates, and atomically imports customer asset portfolios via CSV text.
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
        
        # Read CSV context safely
        f = io.StringIO(csv_content.strip())
        reader = csv.DictReader(f)
        
        # Validate header fields
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
            for idx, row in enumerate(reader, 1):
                name = row.get("name", "").strip()
                category = row.get("category", "Mechanical").strip()
                criticality = row.get("criticality", "medium").strip().lower()

                # Basic validation
                if not name:
                    errors.append(f"Row {idx}: Name column cannot be blank")
                    continue
                if criticality not in ["low", "medium", "high", "critical"]:
                    criticality = "medium"

                asset_id = f"ast-{uuid.uuid4().hex[:12]}"

                # Insert asset cleanly
                self.db.execute(text(
                    "INSERT INTO assets (id, hotel_id, name, category, criticality, status, is_active, created_at, updated_at) "
                    "VALUES (:id, :hid, :name, :cat, :crit, 'Operational', true, NOW(), NOW())"
                ), {
                    "id": asset_id,
                    "hid": hotel_id,
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
                "errors": [f"Transaction aborted due to fatal database error: {str(e)}"]
            }
