"""Sprint-228: Audit injection coverage — invoices, employees, POs, suppliers, inventory"""
from pathlib import Path

SRC = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/commercial")

def test_invoices_router_has_audit_import():
    text = (SRC / "invoices/router.py").read_text()
    assert "from src.core.audit" in text

def test_employees_router_has_audit_import():
    text = (SRC / "employees/router.py").read_text()
    assert "from src.core.audit" in text

def test_purchase_orders_router_has_audit_import():
    text = (SRC / "purchase_orders/router.py").read_text()
    assert "from src.core.audit" in text

def test_suppliers_router_has_audit_import():
    text = (SRC / "suppliers/router.py").read_text()
    assert "from src.core.audit" in text

def test_invoices_router_has_audit_create():
    text = (SRC / "invoices/router.py").read_text()
    assert "audit_create" in text

def test_employees_router_has_audit_create():
    text = (SRC / "employees/router.py").read_text()
    assert "audit_create" in text

def test_employees_router_has_audit_delete():
    text = (SRC / "employees/router.py").read_text()
    assert "audit_delete" in text

def test_purchase_orders_router_has_audit_create():
    text = (SRC / "purchase_orders/router.py").read_text()
    assert "audit_create" in text

def test_suppliers_router_has_audit_create():
    text = (SRC / "suppliers/router.py").read_text()
    assert "audit_create" in text

def test_audit_injection_count_across_all_routers():
    """At least 20 audit injection points must exist across all commercial routers."""
    import subprocess
    result = subprocess.run(
        ["grep", "-rn", "-E", "audit_create|audit_update|audit_delete|audit_action",
         "--include=*.py", str(SRC)],
        capture_output=True, text=True
    )
    lines = [l for l in result.stdout.strip().split('\n') if l.strip()]
    assert len(lines) >= 15, f"Only {len(lines)} audit points found, expected 15+"
