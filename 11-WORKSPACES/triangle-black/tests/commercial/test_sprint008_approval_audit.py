"""SPRINT-008: Approval consolidation audit"""
from pathlib import Path

ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
SRC  = ROOT / "src"
COMMERCIAL = SRC / "commercial"

def test_approval_audit_doc_exists():
    assert (ROOT / "docs/upgrade-analysis/08_APPROVAL_AUDIT.md").exists()

def test_approval_adr_exists():
    assert (ROOT / "docs/adr/ADR-003-APPROVAL-CONSOLIDATION.md").exists()

def test_audit_documents_all_3_modules():
    text = (ROOT / "docs/upgrade-analysis/08_APPROVAL_AUDIT.md").read_text()
    for module in ["approval_center", "approval_chain", "approval_requests"]:
        assert module in text, f"Module not documented: {module}"

def test_audit_identifies_correct_ownership():
    text = (ROOT / "docs/upgrade-analysis/08_APPROVAL_AUDIT.md").read_text()
    assert "approval_requests" in text
    assert "workflow" in text.lower() or "WorkflowEngine" in text

def test_adr_has_migration_and_rollback():
    text = (ROOT / "docs/adr/ADR-003-APPROVAL-CONSOLIDATION.md").read_text()
    assert "Migration" in text
    assert "Rollback" in text

def test_adr_status_is_proposed():
    text = (ROOT / "docs/adr/ADR-003-APPROVAL-CONSOLIDATION.md").read_text()
    assert "PROPOSED" in text

def test_no_approval_module_deleted():
    for mod in ["approval_center", "approval_chain", "approval_requests"]:
        assert (COMMERCIAL / mod).exists(), f"Module deleted: {mod}"

def test_approval_center_has_no_own_table():
    if (COMMERCIAL / "approval_center/models.py").exists():
        text = (COMMERCIAL / "approval_center/models.py").read_text()
        assert "__tablename__" not in text, \
            "approval_center should not own a table — it is a read aggregation"

def test_approval_chain_has_router():
    assert (COMMERCIAL / "approval_chain/router.py").exists()

def test_approval_requests_has_router():
    assert (COMMERCIAL / "approval_requests/router.py").exists()
