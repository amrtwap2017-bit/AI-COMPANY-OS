"""
Tests for Sprint U-002: DDD Module Expansion
Covers: sla_dashboard, customer_success, sales_pipeline (schemas, repo, service)
"""
import pytest
from pathlib import Path

SRC = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/commercial")

def test_sla_dashboard_ddd_structure():
    assert (SRC / "sla_dashboard/schemas.py").exists()
    assert (SRC / "sla_dashboard/repository.py").exists()
    assert (SRC / "sla_dashboard/service.py").exists()

def test_customer_success_ddd_structure():
    assert (SRC / "customer_success/schemas.py").exists()
    assert (SRC / "customer_success/repository.py").exists()
    assert (SRC / "customer_success/service.py").exists()

def test_sales_pipeline_ddd_structure():
    assert (SRC / "sales_pipeline/schemas.py").exists()
    assert (SRC / "sales_pipeline/repository.py").exists()
    assert (SRC / "sales_pipeline/service.py").exists()

def test_sla_dashboard_service_importable():
    from src.commercial.sla_dashboard.service import SLADashboardService
    from src.commercial.sla_dashboard.repository import SLADashboardRepository
    assert SLADashboardService is not None
    assert hasattr(SLADashboardService, "get_summary")

def test_customer_success_service_importable():
    from src.commercial.customer_success.service import CustomerSuccessService
    from src.commercial.customer_success.repository import CustomerSuccessRepository
    assert CustomerSuccessService is not None
    assert hasattr(CustomerSuccessService, "get_overview")

def test_sales_pipeline_service_importable():
    from src.commercial.sales_pipeline.service import SalesPipelineService
    from src.commercial.sales_pipeline.repository import SalesPipelineRepository
    assert SalesPipelineService is not None
    assert hasattr(SalesPipelineService, "get_overview")
