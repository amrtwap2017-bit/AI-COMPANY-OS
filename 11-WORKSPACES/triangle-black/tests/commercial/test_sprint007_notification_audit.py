"""SPRINT-007: Notification consolidation audit"""
from pathlib import Path

ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
SRC  = ROOT / "src"
COMMERCIAL = SRC / "commercial"

def test_notification_audit_doc_exists():
    assert (ROOT / "docs/upgrade-analysis/07_NOTIFICATION_AUDIT.md").exists()

def test_notification_adr_exists():
    assert (ROOT / "docs/adr/ADR-002-NOTIFICATION-CONSOLIDATION.md").exists()

def test_audit_documents_all_10_modules():
    text = (ROOT / "docs/upgrade-analysis/07_NOTIFICATION_AUDIT.md").read_text()
    for module in ["notifications", "notification_engine", "email_notifications",
                   "email_service", "email_alert", "sse_notifications",
                   "system_notifications", "webhook_notifications"]:
        assert module in text, f"Module not documented: {module}"

def test_adr_has_migration_sequence():
    text = (ROOT / "docs/adr/ADR-002-NOTIFICATION-CONSOLIDATION.md").read_text()
    assert "Migration" in text
    assert "Rollback" in text

def test_notifications_module_still_has_model():
    assert (COMMERCIAL / "notifications/models.py").exists() or \
           (COMMERCIAL / "notification_engine/models.py").exists()

def test_notification_engine_still_has_router():
    assert (COMMERCIAL / "notification_engine/router.py").exists()

def test_no_notification_module_deleted():
    modules = ["notifications", "email_notifications", "email_service",
                "email_alert", "sse_notifications", "notification_engine"]
    for mod in modules:
        assert (COMMERCIAL / mod).exists(), f"Module unexpectedly deleted: {mod}"

def test_adr_status_is_proposed():
    text = (ROOT / "docs/adr/ADR-002-NOTIFICATION-CONSOLIDATION.md").read_text()
    assert "PROPOSED" in text or "Proposed" in text

def test_audit_has_risk_assessment():
    text = (ROOT / "docs/upgrade-analysis/07_NOTIFICATION_AUDIT.md").read_text()
    assert "Risk" in text or "risk" in text

def test_audit_recommends_no_deletion():
    text = (ROOT / "docs/upgrade-analysis/07_NOTIFICATION_AUDIT.md").read_text()
    assert "do NOT delete" in text or "not delete" in text.lower()
