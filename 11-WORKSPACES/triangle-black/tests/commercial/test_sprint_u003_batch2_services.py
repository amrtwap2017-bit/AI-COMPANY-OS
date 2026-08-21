"""
Tests for Sprint U-003: Core Application Service Layer Batch 2
Covers: SupplierService, PurchaseRequestService, GoodsReceiptService,
        QuotationService, LeadManagementService, ProjectService
"""
import pytest
from pathlib import Path

SRC = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/commercial")

def test_service_files_batch2_exist():
    mods = ["suppliers", "purchase_requests", "goods_receipts", "quotation", "lead_management", "projects"]
    for m in mods:
        assert (SRC / m / "service.py").exists(), f"Missing service.py in {m}"

def test_supplier_service_methods():
    from src.commercial.suppliers.service import SupplierService
    assert hasattr(SupplierService, "get_supplier")
    assert hasattr(SupplierService, "create_supplier")
    assert hasattr(SupplierService, "update_rating")

def test_purchase_request_service_methods():
    from src.commercial.purchase_requests.service import PurchaseRequestService
    assert hasattr(PurchaseRequestService, "get_by_id")
    assert hasattr(PurchaseRequestService, "create_request")
    assert hasattr(PurchaseRequestService, "approve_request")

def test_goods_receipt_service_methods():
    from src.commercial.goods_receipts.service import GoodsReceiptService
    assert hasattr(GoodsReceiptService, "get_by_id")
    assert hasattr(GoodsReceiptService, "create_receipt")

def test_quotation_service_methods():
    from src.commercial.quotation.service import QuotationService
    assert hasattr(QuotationService, "get_by_id")
    assert hasattr(QuotationService, "approve_quote")

def test_lead_service_methods():
    from src.commercial.lead_management.service import LeadManagementService
    assert hasattr(LeadManagementService, "get_by_id")
    assert hasattr(LeadManagementService, "qualify_lead")

def test_project_service_methods():
    from src.commercial.projects.service import ProjectService
    assert hasattr(ProjectService, "get_by_id")
    assert hasattr(ProjectService, "complete_project")
