"""
Tests for Sprint U-003: Core Application Service Layer
Covers: AssetService, ContractService, InvoiceService, PurchaseOrderService
"""
import pytest
from pathlib import Path

SRC = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/commercial")

def test_service_files_exist():
    assert (SRC / "assets/service.py").exists()
    assert (SRC / "contracts/service.py").exists()
    assert (SRC / "invoices/service.py").exists()
    assert (SRC / "purchase_orders/service.py").exists()

def test_asset_service_methods():
    from src.commercial.assets.service import AssetService
    assert hasattr(AssetService, "get_asset")
    assert hasattr(AssetService, "create_asset")
    assert hasattr(AssetService, "update_asset")
    assert hasattr(AssetService, "record_failure")

def test_contract_service_methods():
    from src.commercial.contracts.service import ContractService
    assert hasattr(ContractService, "get_contract")
    assert hasattr(ContractService, "create_contract")
    assert hasattr(ContractService, "renew_contract")

def test_invoice_service_methods():
    from src.commercial.invoices.service import InvoiceService
    assert hasattr(InvoiceService, "get_invoice")
    assert hasattr(InvoiceService, "create_invoice")
    assert hasattr(InvoiceService, "mark_as_paid")

def test_purchase_order_service_methods():
    from src.commercial.purchase_orders.service import PurchaseOrderService
    assert hasattr(PurchaseOrderService, "get_by_id")
    assert hasattr(PurchaseOrderService, "list_orders")
    assert hasattr(PurchaseOrderService, "approve_order")
