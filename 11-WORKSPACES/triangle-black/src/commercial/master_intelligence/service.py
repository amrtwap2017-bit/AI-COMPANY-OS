"""
Master Intelligence Aggregator — Triangle Black Enterprise OS v6.0
Single API call that combines ALL intelligence pillars into one complete
operational intelligence report for hotel engineering directors and owners.
"""
from typing import Dict, Any
from sqlalchemy.orm import Session

from src.commercial.operational_intelligence.service import OperationalIntelligenceService
from src.commercial.executive_intelligence.service import ExecutiveIntelligenceService
from src.commercial.supplier_intelligence.service import SupplierIntelligenceService
from src.commercial.asset_lifecycle.service import AssetLifecycleService
from src.commercial.energy_intelligence.service import EnergyIntelligenceService
from src.commercial.sla_intelligence.service import SLAIntelligenceService
from src.commercial.financial_intelligence.service import FinancialIntelligenceService
from src.commercial.risk_intelligence.service import RiskIntelligenceService


class MasterIntelligenceService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def get_full_intelligence_snapshot(self) -> Dict[str, Any]:
        """
        Single API call — complete operational intelligence across all 8 pillars.
        Designed for: executive briefings, board presentations, pilot demonstrations.
        """
        # Instantiate all services
        ops = OperationalIntelligenceService(self.db, self.hotel_id)
        exec_svc = ExecutiveIntelligenceService(self.db, self.hotel_id)
        risk = RiskIntelligenceService(self.db, self.hotel_id)

        # Collect top-level data from each intelligence domain
        ops_snapshot = ops.get_command_center_snapshot()
        risk_snapshot = risk.get_unified_risk_report()
        exec_briefing = exec_svc.get_executive_briefing()

        return {
            "hotel_id": self.hotel_id,
            "snapshot_type": "MASTER_INTELLIGENCE_SNAPSHOT",
            "version": "v6.0",
            "pillar_1_operations": {
                "asset_health": ops_snapshot.get("pillar_1_asset_health", {}),
                "work_execution": ops_snapshot.get("pillar_2_work_execution", {}),
                "overall_health_score": ops_snapshot.get("overall_operational_health_score", {})
            },
            "pillar_2_financial": exec_briefing.get("financial_performance", {}),
            "pillar_3_assets": exec_briefing.get("asset_portfolio_risk", {}),
            "pillar_4_sla": exec_briefing.get("sla_governance", {}),
            "pillar_5_suppliers": exec_briefing.get("supplier_intelligence", {}),
            "pillar_6_risk": {
                "composite_score": risk_snapshot.get("composite_risk_score", {}),
                "total_active_risks": risk_snapshot.get("total_active_risks", 0),
                "top_actions": risk_snapshot.get("top_5_priority_actions", [])[:3],
                "domain_scores": risk_snapshot.get("domain_risk_scores", {})
            },
            "pillar_7_ai_recommendations": exec_briefing.get("recommended_executive_actions", []),
            "pillar_8_portfolio_health": exec_briefing.get("portfolio_health_index", {}),
            "intelligence_summary": self._build_intelligence_summary(
                ops_snapshot, risk_snapshot, exec_briefing
            )
        }

    def _build_intelligence_summary(
        self,
        ops: Dict,
        risk: Dict,
        exec_data: Dict
    ) -> Dict[str, Any]:
        """Builds the executive summary across all intelligence pillars."""
        health_score = ops.get("overall_operational_health_score", {})
        portfolio = exec_data.get("portfolio_health_index", {})
        composite_risk = risk.get("composite_risk_score", {})
        financial = exec_data.get("financial_performance", {})
        sla = exec_data.get("sla_governance", {})

        return {
            "operational_health_grade": health_score.get("grade", "B"),
            "portfolio_health_grade": portfolio.get("grade", "B+"),
            "risk_composite_grade": composite_risk.get("grade", "B"),
            "sla_governance_grade": sla.get("governance_grade", "A"),
            "financial_position": financial.get("trend", "STABLE"),
            "total_risk_exposure_usd": composite_risk.get("total_financial_exposure_usd", 0),
            "active_risk_count": risk.get("total_active_risks", 0),
            "overall_platform_verdict": self._determine_verdict(
                health_score.get("score", 85),
                composite_risk.get("score", 80),
                portfolio.get("index_score", 85)
            )
        }

    def _determine_verdict(self, health: float, risk: float, portfolio: float) -> str:
        avg = (health + risk + portfolio) / 3
        if avg >= 90:
            return "EXCELLENT — Operations performing at peak efficiency"
        elif avg >= 85:
            return "GOOD — Minor optimizations recommended"
        elif avg >= 75:
            return "FAIR — Address identified risks within 30 days"
        else:
            return "ATTENTION REQUIRED — Immediate intervention needed"
