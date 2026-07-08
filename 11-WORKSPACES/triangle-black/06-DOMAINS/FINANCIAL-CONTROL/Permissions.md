# 06-FINANCIAL-CONTROL — Permissions

| Permission | Action | Roles |
|------------|--------|-------|
| invoice:create | Create invoice | FINANCE_CLERK |
| invoice:send | Send invoice | FINANCE_CLERK, FINANCE_CONTROLLER |
| invoice:approve | Approve invoice | FINANCE_CONTROLLER, FINANCE_MANAGER |
| invoice:writeoff | Write off | FINANCE_MANAGER |
| payment:record | Record payment | FINANCE_CLERK |
| payment:approve | Approve payment | FINANCE_CONTROLLER |
| supplier-invoice:enter | Enter supplier invoice | FINANCE_CLERK |
| supplier-invoice:match | Match 3-way | FINANCE_CONTROLLER |
| gl:view | View GL | FINANCE_CONTROLLER, FINANCE_MANAGER |
| project-pnl:view | View project P&L | PROJECT_MANAGER, FINANCE_CONTROLLER |
