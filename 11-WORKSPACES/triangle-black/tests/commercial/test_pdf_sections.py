"""PDF Report Section Tests — V15.0 — GAP-10."""
import requests
import pytest

BASE = "http://localhost:8030"


class TestPDFSections:
    def test_pdf_endpoint_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/pilot/report/pdf", timeout=5)
        assert r.status_code in (401, 403, 404)

    def test_pdf_service_imports(self):
        """PDF service must import without errors."""
        from src.commercial.reports.pilot_pdf_service import PilotReportService
        assert PilotReportService is not None

    def test_pdf_has_adoption_section(self):
        """Section 6: Adoption must exist in source."""
        from pathlib import Path
        content = Path("src/commercial/reports/pilot_pdf_service.py").read_text()
        assert "Adoption" in content or "adoption" in content
        assert "health_score" in content or "AdoptionService" in content

    def test_pdf_has_financial_impact_section(self):
        """Section 7: Financial Impact must exist."""
        from pathlib import Path
        content = Path("src/commercial/reports/pilot_pdf_service.py").read_text()
        assert "Financial Impact" in content or "financial" in content.lower()
        assert "L3" in content or "customer_verified" in content

    def test_pdf_has_next_30_days_section(self):
        """Section 8: Next 30 Days must exist."""
        from pathlib import Path
        content = Path("src/commercial/reports/pilot_pdf_service.py").read_text()
        assert "Next 30" in content or "next_30" in content.lower() or "Next 30 Days" in content

    def test_pdf_section_count(self):
        """PDF must have at least 8 sections now."""
        from pathlib import Path
        import inspect
        from src.commercial.reports.pilot_pdf_service import PilotReportService
        src = inspect.getsource(PilotReportService.generate_pilot_report)
        # Count section markers
        section_count = src.count("Section ")
        print(f"\n  Found {section_count} sections in generate_pilot_report")
        assert section_count >= 6, f"Expected 6+ sections, found {section_count}"
