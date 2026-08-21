"""
Schemas for Predictive Maintenance Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class AssetHealthScore(BaseModel):
    asset_id: str
    asset_name: str
    category: str
    criticality: str
    health_score: float
    health_grade: str
    risk_level: str
    days_since_maintenance: int
    corrective_wos_90d: int

class CategoryRiskSummary(BaseModel):
    category: str
    total_assets: int
    avg_health_score: float
    critical_risk_count: int
    high_risk_count: int

class PredictiveMaintenanceSummary(BaseModel):
    hotel_id: str
    overall_health_score: float
    total_assets_monitored: int
    high_risk_assets: List[AssetHealthScore] = []
    category_summary: List[CategoryRiskSummary] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)
