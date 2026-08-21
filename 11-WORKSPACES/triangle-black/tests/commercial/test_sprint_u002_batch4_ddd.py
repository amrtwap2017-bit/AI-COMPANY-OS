"""
Tests for Sprint U-002: DDD Batch 4 Expansion
Covers: executive_kpi, executive_intelligence, goods_receipt_workflow,
        knowledge_graph, maintenance_enterprise, ai_mentor
"""
import pytest
from pathlib import Path

SRC = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/commercial")

def test_batch4_files_exist():
    modules = [
        "executive_kpi", "executive_intelligence", "goods_receipt_workflow",
        "knowledge_graph", "maintenance_enterprise", "ai_mentor"
    ]
    for m in modules:
        assert (SRC / m / "schemas.py").exists(), f"Missing schemas in {m}"
        assert (SRC / m / "repository.py").exists(), f"Missing repository in {m}"
        assert (SRC / m / "service.py").exists(), f"Missing service in {m}"

def test_executive_kpi_service():
    from src.commercial.executive_kpi.service import ExecutiveKPIService
    assert hasattr(ExecutiveKPIService, "get_kpi_summary")
    assert hasattr(ExecutiveKPIService, "get_balanced_scorecard")

def test_goods_receipt_workflow_service():
    from src.commercial.goods_receipt_workflow.service import GoodsReceiptWorkflowService
    assert hasattr(GoodsReceiptWorkflowService, "get_pending_receipts")
    assert hasattr(GoodsReceiptWorkflowService, "get_cycle_status")

def test_knowledge_graph_service():
    from src.commercial.knowledge_graph.service import KnowledgeGraphService
    assert hasattr(KnowledgeGraphService, "get_overview")
    assert hasattr(KnowledgeGraphService, "get_entity_relationships")

def test_maintenance_enterprise_service():
    from src.commercial.maintenance_enterprise.service import MaintenanceEnterpriseService
    assert hasattr(MaintenanceEnterpriseService, "get_dashboard_overview")
    assert hasattr(MaintenanceEnterpriseService, "get_pm_plans")

def test_ai_mentor_service():
    from src.commercial.ai_mentor.service import AIMentorService
    assert hasattr(AIMentorService, "get_guidance")
