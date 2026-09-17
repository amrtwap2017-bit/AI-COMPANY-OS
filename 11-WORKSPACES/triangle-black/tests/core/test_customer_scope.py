"""Tests for CustomerDataScope — centralized data filter."""

def test_customer_classifications():
    from src.core.customer_scope import CUSTOMER_CLASSIFICATIONS, EXCLUDED_CLASSIFICATIONS
    assert "REAL" in CUSTOMER_CLASSIFICATIONS
    assert "IMPORTED" in CUSTOMER_CLASSIFICATIONS
    assert "TEST" not in CUSTOMER_CLASSIFICATIONS
    assert "GENERATED" not in CUSTOMER_CLASSIFICATIONS
    assert "DEMO" in EXCLUDED_CLASSIFICATIONS

def test_scope_where_clause():
    from src.core.customer_scope import CustomerDataScope
    scope = CustomerDataScope(hotel_id="hotel-123")
    clause = scope.where_clause()
    assert "hotel-123" in clause
    assert "REAL" in clause
    assert "IMPORTED" in clause
    assert "TEST" not in clause
    assert "GENERATED" not in clause

def test_scope_params():
    from src.core.customer_scope import CustomerDataScope
    scope = CustomerDataScope.from_hotel_id("hotel-abc")
    params = scope.params()
    assert params["hotel_id"] == "hotel-abc"
    assert "REAL" in params["classifications"]
    assert "TEST" not in params["classifications"]

def test_classify_record():
    from src.core.customer_scope import classify_record
    assert classify_record(source="csv") == "IMPORTED"
    assert classify_record(source="portal", is_real_data=True) == "REAL"
    assert classify_record(source="seed") == "TEST"
    assert classify_record(source="ai") == "GENERATED"

def test_scope_all_data_includes_test():
    from src.core.customer_scope import CustomerDataScope
    scope = CustomerDataScope.all_data("hotel-admin")
    assert "TEST" in scope.classifications
    assert "GENERATED" in scope.classifications
