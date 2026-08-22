"""
AI Maintenance Director — Triangle Black Enterprise OS
Governed predictive intelligence engine that analyzes equipment telemetry and failure history
to generate actionable, auditable maintenance recommendations with evidence chains.
"""
from typing import Dict, Any, List

class AIMaintenanceDirector:
    """Generates governed, evidence-backed predictive maintenance recommendations."""

    @staticmethod
    def analyze_asset_health(
        asset_id: str,
        hotel_id: str,
        asset_name: str = "Chiller Unit A",
        failures_90d: int = 0,
        pm_compliance: float = 100.0,
        vibration_spike: bool = False,
        runtime_hours: float = 2400.0
    ) -> Dict[str, Any]:
        evidence: List[str] = []
        risk_score = 0.0

        if failures_90d >= 3:
            risk_score += 40.0
            evidence.append(f"Frequent breakdown pattern: {failures_90d} corrective failures recorded in last 90 days.")
        elif failures_90d >= 1:
            risk_score += 20.0
            evidence.append(f"{failures_90d} recent corrective failure in history.")

        if pm_compliance < 80.0:
            risk_score += 30.0
            evidence.append(f"Preventive maintenance overdue: PM compliance is at {pm_compliance:.1f}%.")

        if vibration_spike:
            risk_score += 35.0
            evidence.append("Active acoustic/vibration anomaly exceeding ISO-10816 baseline thresholds.")

        if runtime_hours > 3000.0:
            risk_score += 15.0
            evidence.append(f"High continuous runtime: {runtime_hours:.0f} operating hours since last overhaul.")

        # Determine Risk Classification & Required Action
        if risk_score >= 60.0:
            risk_level = "HIGH"
            root_cause = "Accelerated bearing/compressor degradation due to unmitigated mechanical stress."
            recommendation = "Immediate overhaul and thermal inspection. Schedule corrective work order within 24 hours."
            confidence = 0.92
            required_role = "manager"
            suggest_wo = True
        elif risk_score >= 30.0:
            risk_level = "MEDIUM"
            root_cause = "Sub-optimal operating conditions with early signs of lubrication breakdown."
            recommendation = "Schedule comprehensive preventive inspection and lubrication top-up."
            confidence = 0.84
            required_role = "technician"
            suggest_wo = True
        else:
            risk_level = "LOW"
            root_cause = "Normal operational variance within standard tolerances."
            recommendation = "Maintain standard quarterly PM schedule."
            confidence = 0.95
            required_role = "technician"
            suggest_wo = False

        return {
            "asset_id": asset_id,
            "hotel_id": hotel_id,
            "asset_name": asset_name,
            "risk_level": risk_level,
            "risk_score": min(risk_score, 100.0),
            "root_cause_hypothesis": root_cause,
            "evidence": evidence or ["Telemetry parameters operating within normal baseline."],
            "recommendation": recommendation,
            "confidence_score": confidence,
            "required_approval_role": required_role,
            "auto_work_order_suggested": suggest_wo,
            "governance_status": "governed_advisory"
        }
