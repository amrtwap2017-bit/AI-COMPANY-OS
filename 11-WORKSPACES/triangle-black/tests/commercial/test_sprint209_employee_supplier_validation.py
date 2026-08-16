"""Sprint-209: Employee and Supplier schema validation tests"""
import pytest
from pydantic import ValidationError

# ── EMPLOYEE TESTS ────────────────────────────────────────────────────────────
def test_employee_create_valid():
    from src.commercial.employees.schemas import EmployeeCreate
    e = EmployeeCreate(name="Ahmed Hassan", email="ahmed@tbhotel.com", department="Engineering")
    assert e.name == "Ahmed Hassan"
    assert e.email == "ahmed@tbhotel.com"
    assert e.status == "active"

def test_employee_create_normalises_email():
    from src.commercial.employees.schemas import EmployeeCreate
    e = EmployeeCreate(name="Sara Ali", email="  SARA@TBHOTEL.COM  ")
    assert e.email == "sara@tbhotel.com"

def test_employee_create_rejects_invalid_email():
    from src.commercial.employees.schemas import EmployeeCreate
    with pytest.raises(ValidationError):
        EmployeeCreate(name="Test User", email="not-an-email")

def test_employee_create_rejects_short_name():
    from src.commercial.employees.schemas import EmployeeCreate
    with pytest.raises(ValidationError):
        EmployeeCreate(name="A")

def test_employee_create_rejects_negative_salary():
    from src.commercial.employees.schemas import EmployeeCreate
    with pytest.raises(ValidationError):
        EmployeeCreate(name="Test User", salary=-1000.0)

def test_employee_create_rounds_salary():
    from src.commercial.employees.schemas import EmployeeCreate
    e = EmployeeCreate(name="Test User", salary=5000.555)
    assert e.salary == 5000.56

def test_employee_create_normalises_status_case():
    from src.commercial.employees.schemas import EmployeeCreate
    e = EmployeeCreate(name="Test User", status="ACTIVE")
    assert e.status == "active"

def test_employee_create_rejects_invalid_status():
    from src.commercial.employees.schemas import EmployeeCreate
    with pytest.raises(ValidationError):
        EmployeeCreate(name="Test User", status="fired")

def test_employee_update_allows_partial():
    from src.commercial.employees.schemas import EmployeeUpdate
    upd = EmployeeUpdate(status="on_leave")
    assert upd.status == "on_leave"
    assert upd.name is None

def test_employee_response_accepts_none_fields():
    from src.commercial.employees.schemas import EmployeeResponse
    resp = EmployeeResponse()
    assert resp.name is None

# ── SUPPLIER TESTS ────────────────────────────────────────────────────────────
def test_supplier_create_valid():
    from src.commercial.suppliers.schemas import SupplierCreate
    s = SupplierCreate(company_name="Arctic HVAC Solutions", status="active", risk_level="low")
    assert s.company_name == "Arctic HVAC Solutions"
    assert s.status == "active"

def test_supplier_create_normalises_status():
    from src.commercial.suppliers.schemas import SupplierCreate
    s = SupplierCreate(company_name="Test Supplier", status="ACTIVE")
    assert s.status == "active"

def test_supplier_create_rejects_invalid_status():
    from src.commercial.suppliers.schemas import SupplierCreate
    with pytest.raises(ValidationError) as exc:
        SupplierCreate(company_name="Test", status="approved")
    assert "status" in str(exc.value).lower()

def test_supplier_create_rejects_invalid_risk_level():
    from src.commercial.suppliers.schemas import SupplierCreate
    with pytest.raises(ValidationError):
        SupplierCreate(company_name="Test", risk_level="extreme")

def test_supplier_create_rejects_rating_out_of_range():
    from src.commercial.suppliers.schemas import SupplierCreate
    with pytest.raises(ValidationError):
        SupplierCreate(company_name="Test", rating=6.0)

def test_supplier_create_rejects_negative_rating():
    from src.commercial.suppliers.schemas import SupplierCreate
    with pytest.raises(ValidationError):
        SupplierCreate(company_name="Test", rating=-1.0)

def test_supplier_create_rounds_rating():
    from src.commercial.suppliers.schemas import SupplierCreate
    s = SupplierCreate(company_name="Test", rating=4.555)
    assert s.rating == 4.6

def test_supplier_create_rejects_invalid_email():
    from src.commercial.suppliers.schemas import SupplierCreate
    with pytest.raises(ValidationError):
        SupplierCreate(company_name="Test", email="bad-email")

def test_supplier_create_rejects_short_company_name():
    from src.commercial.suppliers.schemas import SupplierCreate
    with pytest.raises(ValidationError):
        SupplierCreate(company_name="A")

def test_supplier_update_allows_partial():
    from src.commercial.suppliers.schemas import SupplierUpdate
    upd = SupplierUpdate(risk_level="high")
    assert upd.risk_level == "high"
    assert upd.company_name is None

def test_supplier_update_rejects_invalid_risk():
    from src.commercial.suppliers.schemas import SupplierUpdate
    with pytest.raises(ValidationError):
        SupplierUpdate(risk_level="unknown")

def test_supplier_response_accepts_none_fields():
    from src.commercial.suppliers.schemas import SupplierResponse
    resp = SupplierResponse(company_name="Test Supplier")
    assert resp.id is None
