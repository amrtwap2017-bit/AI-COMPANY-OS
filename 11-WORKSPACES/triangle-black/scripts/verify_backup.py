"""Triangle Black Backup Verification Script"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.database import engine
from sqlalchemy import text

TABLES = [
    "users", "hotels", "assets", "work_orders", "service_requests",
    "invoices", "contracts", "suppliers", "purchase_orders",
    "platform_events", "platform_audit_log", "workflow_instances",
    "twin_nodes", "twin_edges",
]

def verify():
    print("=== Triangle Black Backup Verification ===")
    errors = []
    with engine.connect() as conn:
        for table in TABLES:
            try:
                row = conn.execute(text("SELECT COUNT(*) FROM " + table)).fetchone()
                count = int(row[0]) if row else 0
                print("  OK: " + table + " (" + str(count) + " rows)")
            except Exception as e:
                print("  ERROR: " + table + " -- " + str(e))
                errors.append(table)
        try:
            conn.execute(text("SELECT 1")).fetchone()
            print("\n  DB connectivity: OK")
        except Exception as e:
            print("\n  DB connectivity: FAILED -- " + str(e))
            errors.append("connectivity")
    if errors:
        print("\nFAILED: " + str(len(errors)) + " issues: " + str(errors))
        sys.exit(1)
    else:
        print("\nPASSED: All " + str(len(TABLES)) + " tables verified.")

if __name__ == "__main__":
    verify()
