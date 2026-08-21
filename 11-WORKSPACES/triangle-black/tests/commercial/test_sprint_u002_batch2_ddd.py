"""
Tests for Sprint U-002: DDD Batch 2 Expansion
Covers: predictive_maintenance, customer360, warehouse_intelligence
"""
import pytest
from pathlib import Path

SRC = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/commercial")

def test_predictive_maintenance_ddd_structure():
    assert (SRC / "predictive_maintenance/schemas.py").exists()
    assert (SRC / "predictive_maintenance/repository.py").exists()
    assert (SRC / "predictive_maintenance/service.py").exists()

def test_customer360_ddd_structure():
    assert (SRC / "customer360/schemas.py").exists()
    assert (SRC / "customer360/repository.py").exists()
    assert (SRC / "customer360/service.py").exists()

def test_warehouse_intelligence_ddd_structure():
    assert (SRC / "warehouse_intelligence/schemas.py").exists()
    assert (SRC / "warehouse_intelligence/repository.py").exists()
    assert (SRC / "warehouse_intelligence/service.py").exists()

def test_predictive_maintenance_service_methods():
    from src.commercial.predictive_maintenance.service import PredictiveMaintenanceService
    assert hasattr(PredictiveMaintenanceService, "get_health_overview")
    assert hasattr(PredictiveMaintenanceService, "calculate_health")

def test_customer360_service_methods():
    from src.commercial.customer360.service import Customer360Service
    assert hasattr(Customer360Service, "get_profile")

def test_warehouse_intelligence_service_methods():
    from src.commercial.warehouse_intelligence.service import WarehouseIntelligenceService
    assert hasattr(WarehouseIntelligenceService, "get_intelligence_summary")
