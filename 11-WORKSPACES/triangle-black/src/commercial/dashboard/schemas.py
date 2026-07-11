from pydantic import BaseModel

class ExecutiveDashboardResponse(BaseModel):
    active_leads: int
    quotes_pending_approval: int
    active_contracts: int
    open_work_orders: int
    overdue_invoices_count: int
    overdue_invoices_amount: float
    pending_purchase_orders: int
    low_stock_items: int