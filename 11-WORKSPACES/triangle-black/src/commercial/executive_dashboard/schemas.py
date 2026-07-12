from pydantic import BaseModel

class ExecutiveDashboardResponse(BaseModel):
    active_leads: int
    pending_quotations: int
    open_work_orders: int
    overdue_invoices_count: int
    overdue_invoices_amount: int
    monthly_revenue: int
    low_stock_alerts: int
    active_projects: int
    sla_compliance_percentage: int
