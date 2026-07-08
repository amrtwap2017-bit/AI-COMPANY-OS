# 02-PROJECT-DELIVERY — Events

| Event | Trigger | Handler |
|-------|---------|---------|
| project.created | Contract activated | NotificationService, InventoryService (allocate budget) |
| milestone.completed | Milestone approved | NotificationService (client), FinancialService (revenue recognition) |
| milestone.approved | Client approves milestone | InvoiceService (generate milestone invoice) |
| ncr.created | NCR created | NotificationService (quality manager) |
| ncr.closed | NCR verified and closed | NotificationService |
| daily_report.submitted | Report created | NotificationService (PM if issues flagged) |
| project.handover_initiated | Handover started | DocumentService (compile handover docs) |
| project.completed | All milestones + handover signed | NotificationService, FinancialService (final reconciliation) |
