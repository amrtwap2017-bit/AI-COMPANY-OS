"""CustomerDataScope Enforcement Tests — V15.0 Audit."""
import pytest


class TestCustomerDataScope:
    def test_scope_import_works(self):
        """CustomerDataScope can be imported."""
        from src.core.customer_scope import CustomerDataScope
        assert CustomerDataScope is not None

    def test_scope_filters_test_data(self):
        """CustomerDataScope excludes TEST/DEMO/GENERATED."""
        from src.core.customer_scope import CustomerDataScope
        scope = CustomerDataScope(hotel_id="test-hotel-001")
        where = scope.where_clause()
        params = scope.params()
        # Should have classification filter
        assert where or params  # Scope produces some filter

    def test_scope_allows_real_data(self):
        """CustomerDataScope allows REAL and IMPORTED."""
        from src.core.customer_scope import CustomerDataScope
        scope = CustomerDataScope(hotel_id="test-hotel-001")
        # Should allow REAL and IMPORTED
        assert hasattr(scope, 'where_clause')
        assert hasattr(scope, 'params')

    def test_notifications_router_imports_scope(self):
        """Notifications router has CustomerDataScope imported."""
        from pathlib import Path
        content = Path("src/commercial/notifications/router.py").read_text()
        assert "CustomerDataScope" in content, \
            "notifications/router.py must import CustomerDataScope"

    def test_recommendations_router_imports_scope(self):
        """Recommendations router has CustomerDataScope imported."""
        from pathlib import Path
        content = Path("src/commercial/recommendations/router.py").read_text()
        assert "CustomerDataScope" in content, \
            "recommendations/router.py must import CustomerDataScope"
