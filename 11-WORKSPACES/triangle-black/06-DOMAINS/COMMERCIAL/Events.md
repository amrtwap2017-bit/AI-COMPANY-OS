# 01-COMMERCIAL — Events

## Domain Events

| Event | Trigger | Handler |
|-------|---------|---------|
| lead.created | POST /leads | LeadScoreAgent, NotificationService, AuditService |
| lead.converted | POST /leads/:id/convert | OpportunityService (auto-create), AuditService |
| lead.assigned | Auto-assignment | NotificationService (notify assignee) |
| opportunity.stage_changed | PATCH /opportunities/:id | PipelineService (recalc forecast), NotificationService |
| survey.scheduled | POST /surveys | NotificationService (notify engineer) |
| survey.completed | POST /surveys/:id/submit | NotificationService (notify manager for approval) |
| survey.approved | POST /surveys/:id/approve | OpportunityService (ready for quotation) |
| quotation.created | POST /quotations | AuditService |
| quotation.submitted | POST /quotations/:id/submit | NotificationService (notify managers for approval) |
| quotation.approved | POST /quotations/:id/approve | NotificationService (notify sales rep), ContractService (create option) |
| quotation.sent | POST /quotations/:id/send | NotificationService (notify client via email) |
| quotation.client_approved | POST /quotations/:id/client-approve | ContractService (auto-create contract) |
| quotation.expired | Cron (daily) | NotificationService (notify sales rep) |
| contract.created | POST /contracts | AuditService |
| contract.signed | POST /contracts/:id/sign | NotificationService, DocumentService |
| contract.activated | POST /contracts/:id/activate | ProjectService (auto-create project), NotificationService |
| contract.terminated | POST /contracts/:id/terminate | ProjectService (flag projects), NotificationService |
