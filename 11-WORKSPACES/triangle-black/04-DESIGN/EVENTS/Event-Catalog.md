# Event Catalog

## CRM Events

| Event | Trigger | Handlers | Payload |
|-------|---------|----------|---------|
| lead.created | POST /leads | NotificationService (assigned_to), AuditService | { leadId, assignedTo, createdBy } |
| lead.converted | POST /leads/:id/convert | NotificationService, OpportunityService (auto-create) | { leadId, opportunityId } |
| opportunity.stage_changed | PATCH /opportunities/:id | NotificationService, PipelineService | { opportunityId, from, to, changedBy } |

## Quotation Events

| Event | Trigger | Handlers | Payload |
|-------|---------|----------|---------|
| quotation.submitted | POST /quotations/:id/submit | NotificationService (notify managers), AuditService | { quotationId, total, companyId } |
| quotation.approved | POST /quotations/:id/approve | NotificationService (notify sales rep), ContractService (auto-create option) | { quotationId, approvedBy } |
| quotation.rejected | POST /quotations/:id/reject | NotificationService (notify sales rep) | { quotationId, reason, rejectedBy } |
| quotation.expiring | Cron (daily) | NotificationService (notify sales rep) | { quotationId, companyId, daysLeft } |

## Contract Events

| Event | Trigger | Handlers | Payload |
|-------|---------|----------|---------|
| contract.signed | POST /contracts/:id/sign | NotificationService, ProjectService (create option) | { contractId, companyId, value } |
| contract.activated | POST /contracts/:id/activate | NotificationService | { contractId, companyId } |
| contract.expiring | Cron (30-day check) | NotificationService (notify admin) | { contractId, endDate, daysLeft } |

## Project Events

| Event | Trigger | Handlers | Payload |
|-------|---------|----------|---------|
| project.created | POST /projects | NotificationService (notify manager) | { projectId, code, managerId } |
| milestone.completed | POST /milestones/:id/complete | NotificationService (notify manager for approval) | { milestoneId, projectId, completedBy } |
| milestone.approved | POST /milestones/:id/approve | ProjectService (recalc completion%), NotificationService | { milestoneId, projectId } |
| project.completed | PATCH /projects/:id/status (→completed) | NotificationService (notify company), DocumentService | { projectId, companyId } |

## Client Portal Events

| Event | Trigger | Handlers | Payload |
|-------|---------|----------|---------|
| service_request.submitted | POST /portal/service-requests | NotificationService (notify admin/manager) | { requestId, companyId, type, priority } |
| service_request.acknowledged | PATCH by admin | NotificationService (notify client) | { requestId, assignedTo } |
| service_request.resolved | PATCH by engineer | NotificationService (notify client for confirmation) | { requestId, resolvedBy } |

## Event Handler Implementation

```typescript
// Using @nestjs/event-emitter (simple in-process event bus)
@Injectable()
export class LeadCreatedListener {
  @OnEvent('lead.created')
  async handle(payload: LeadCreatedEvent) {
    await this.notificationService.notifyAssignedUser(payload.assignedTo, {
      type: 'lead_assigned',
      title: 'New lead assigned',
      body: `Lead ${payload.leadId} has been assigned to you`,
      link: `/crm/leads/${payload.leadId}`,
    });
    await this.auditService.write({
      tableName: 'leads',
      recordId: payload.leadId,
      action: 'create',
      changedBy: payload.createdBy,
    });
  }
}
```
