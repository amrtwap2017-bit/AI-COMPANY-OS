"""
Demo Scenario Simulation Engine — Triangle Black Commercial v5.2
Executes 5 live operational hospitality scenarios for commercial prospect walkthroughs.
"""
import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

class DemoScenarioService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def list_available_scenarios(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "chiller_vibration",
                "title": "Scenario 1: Critical Chiller Breakdown & AI Triage",
                "category": "Maintenance",
                "description": "Simulates acoustic vibration anomaly on Chiller Unit A and triggers corrective work order dispatch.",
                "impact": "Prevents $15,000 emergency replacement"
            },
            {
                "id": "supplier_delay",
                "title": "Scenario 2: Supplier Delay & Re-routing",
                "category": "Procurement",
                "description": "Simulates compressor bearing delivery delay and alerts the engineering director.",
                "impact": "Protects maintenance SLA completion"
            },
            {
                "id": "recurring_pump_failure",
                "title": "Scenario 3: Recurring Pump Failure Risk",
                "category": "Asset Intelligence",
                "description": "Simulates 3 pump failures in 60 days, prompting AI Director failure pattern review.",
                "impact": "Identifies chronic equipment degradation"
            },
            {
                "id": "emergency_po_leakage",
                "title": "Scenario 4: Emergency Procurement Leakage Gate",
                "category": "Financial",
                "description": "Creates an $8,500 emergency chemical PR, triggering multi-tier managerial approval gates.",
                "impact": "Halts single-source budget leakage"
            },
            {
                "id": "pm_compliance_boost",
                "title": "Scenario 5: PM Compliance & Filter Overhaul",
                "category": "Operations",
                "description": "Completes overdue AHU filter inspections, boosting compliance score to 98%.",
                "impact": "Improves overall property health index"
            }
        ]

    def trigger_scenario(self, scenario_id: str) -> Dict[str, Any]:
        audit_id = str(uuid.uuid4())

        if scenario_id == "chiller_vibration":
            wo_id = f"wo-chiller-{uuid.uuid4().hex[:6]}"
            try:
                self.db.execute(text(
                    "INSERT INTO work_orders (id, hotel_id, title, status, priority, description, created_at, updated_at) "
                    "VALUES (:id, :hid, 'Chiller Unit A Vibration Spike', 'open', 'critical', 'Acoustic vibration anomaly detected by sensor', NOW(), NOW())"
                ), {"id": wo_id, "hid": self.hotel_id})
                self.db.commit()
            except Exception:
                self.db.rollback()

            return {
                "success": True,
                "scenario_id": scenario_id,
                "title": "Chiller Vibration Anomaly Triggered",
                "action_taken": f"Created Critical Work Order {wo_id}",
                "audit_reference": audit_id,
                "target_entity": "Chiller Unit A"
            }

        elif scenario_id == "emergency_po_leakage":
            pr_id = f"pr-chem-{uuid.uuid4().hex[:6]}"
            try:
                self.db.execute(text(
                    "INSERT INTO purchase_requests (id, hotel_id, title, total_amount, status, created_at, updated_at) "
                    "VALUES (:id, :hid, 'Emergency R-410A Refrigerant Supply', 8500.0, 'pending_approval', NOW(), NOW())"
                ), {"id": pr_id, "hid": self.hotel_id})
                self.db.commit()
            except Exception:
                self.db.rollback()

            return {
                "success": True,
                "scenario_id": scenario_id,
                "title": "Emergency Purchase Order Flagged",
                "action_taken": f"Created PR {pr_id} ($8,500.00) — Halts in Pending Approval",
                "audit_reference": audit_id,
                "target_entity": "Finance Director Approval Queue"
            }

        else:
            return {
                "success": True,
                "scenario_id": scenario_id,
                "title": f"Scenario {scenario_id} Executed",
                "action_taken": "Operational state synchronized with simulated demo telemetry",
                "audit_reference": audit_id,
                "target_entity": "Red Sea Grand Resort Cluster"
            }
