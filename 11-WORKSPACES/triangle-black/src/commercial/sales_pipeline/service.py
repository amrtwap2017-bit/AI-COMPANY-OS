"""
Service for Sales Pipeline Domain
"""
from typing import Dict, Any
from sqlalchemy.orm import Session
from src.commercial.sales_pipeline.repository import SalesPipelineRepository

class SalesPipelineService:
    def __init__(self, db: Session):
        self.repo = SalesPipelineRepository(db)

    def get_overview(self, hotel_id: str) -> Dict[str, Any]:
        stages = self.repo.get_pipeline_stages(hotel_id)
        metrics = self.repo.get_conversion_metrics(hotel_id)
        
        return {
            "hotel_id": hotel_id,
            "stages": stages,
            "metrics": metrics,
        }
