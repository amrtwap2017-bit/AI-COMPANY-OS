import pytest
from sqlalchemy.orm import Session
from src.core.database import get_test_db
from .repository import ExecutiveDashboardRepository
from .schemas import ExecutiveDashboardResponse

@pytest.fixture(scope='module')
def test_executive_dashboard_repo(test_db: Session):
    repository = ExecutiveDashboardRepository(test_db)
    yield repository

def test_get_executive_dashboard(test_executive_dashboard_repo: ExecutiveDashboardRepository):
    dashboard = test_executive_dashboard_repo.get_executive_dashboard()
    assert isinstance(dashboard, ExecutiveDashboardResponse)

def test_update_executive_dashboard(test_executive_dashboard_repo: ExecutiveDashboardRepository):
    new_data = {
        'active_leads': 10,
        'pending_quotations': 5,
        'open_work_orders': 3,
        'overdue_invoices_count': 2,
        'overdue_invoices_amount': 1000,
        'monthly_revenue': 50000,
        'low_stock_alerts': 4,
        'active_projects': 6,
        'sla_compliance_percentage': 95
    }
    updated_dashboard = test_executive_dashboard_repo.update_executive_dashboard(new_data)
    assert isinstance(updated_dashboard, ExecutiveDashboardResponse)
    for key, value in new_data.items():
        assert getattr(updated_dashboard, key) == value