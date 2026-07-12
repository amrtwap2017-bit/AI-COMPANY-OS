from sqlalchemy import Column, Integer, String
from src.core.base import Base

class ExecutiveDashboard(Base):
    __tablename__ = 'executive_dashboard'
    id = Column(Integer, primary_key=True)
    active_leads = Column(Integer, default=0)
    pending_quotations = Column(Integer, default=0)
    open_work_orders = Column(Integer, default=0)
    overdue_invoices_count = Column(Integer, default=0)
    overdue_invoices_amount = Column(Integer, default=0)
    monthly_revenue = Column(Integer, default=0)
    low_stock_alerts = Column(Integer, default=0)
    active_projects = Column(Integer, default=0)
    sla_compliance_percentage = Column(Integer, default=0)
