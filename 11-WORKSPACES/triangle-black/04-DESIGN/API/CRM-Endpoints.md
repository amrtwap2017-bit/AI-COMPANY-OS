# CRM API Endpoints

## Leads

### List Leads

```
GET /api/v1/crm/leads
Query: ?page=1&limit=20&status=new,contacted&assignedTo=uuid&search=term&sort=-createdAt
Response: 200 { data: Lead[], meta: PaginationMeta }
Permissions: sales_rep+, manager+, admin+
```

### Get Lead

```
GET /api/v1/crm/leads/:id
Response: 200 { data: Lead }
Permissions: owner+, manager+, admin+
```

### Create Lead

```
POST /api/v1/crm/leads
Body: { firstName, lastName, email?, phone?, companyName?, jobTitle?, source, notes?, assignedTo? }
Response: 201 { data: Lead }
Permissions: sales_rep+, manager+, admin+
Validation: { firstName: required, lastName: required, email: email?, source: enum }
```

### Update Lead

```
PATCH /api/v1/crm/leads/:id
Body: { firstName?, lastName?, email?, ... }
Response: 200 { data: Lead }
Permissions: owner+, manager+, admin+
Business Rules:
  - Score auto-computed from activity recency
  - Status 'converted' only via convert endpoint
```

### Delete Lead

```
DELETE /api/v1/crm/leads/:id
Response: 204
Permissions: manager+, admin+
Note: Soft delete (sets deleted_at)
```

### Convert Lead to Opportunity

```
POST /api/v1/crm/leads/:id/convert
Body: { companyId?, companyName?, opportunityValue, closeDate }
Response: 201 { data: { lead: Lead, opportunity: Opportunity } }
Permissions: sales_rep+, manager+, admin+
Business Rules:
  - Sets lead.status = 'converted', lead.converted_at = now()
  - Creates opportunity with stage = 'qualification'
  - If companyId provided, links to existing company
  - If companyName provided, creates new company
```

### Bulk Assign

```
POST /api/v1/crm/leads/bulk/assign
Body: { ids: string[], assignedTo: string }
Response: 200 { data: { updated: number } }
Permissions: manager+, admin+
```

## Opportunities

### List Opportunities

```
GET /api/v1/crm/opportunities
Query: ?page=1&limit=20&stage=proposal,negotiation&assignedTo=uuid&companyId=uuid
Response: 200 { data: Opportunity[], meta: PaginationMeta }
Permissions: sales_rep+, manager+, admin+, viewer
```

### Get Opportunity

```
GET /api/v1/crm/opportunities/:id
Response: 200 { data: Opportunity & { lead, company, quotations } }
Permissions: owner+, manager+, admin+, viewer
```

### Create Opportunity

```
POST /api/v1/crm/opportunities
Body: { leadId?, companyId, name, value, stage?, probability?, closeDate, assignedTo? }
Response: 201 { data: Opportunity }
Permissions: sales_rep+, manager+, admin+
Business Rules:
  - probability auto-set from stage (qualification=10, analysis=25, proposal=50, negotiation=75, closed_won=100, closed_lost=0)
```

### Update Opportunity

```
PATCH /api/v1/crm/opportunities/:id
Body: { stage?, value?, probability?, ... }
Response: 200 { data: Opportunity }
Permissions: owner+, manager+, admin+
Business Rules (BR-CRM-03):
  - If stage changes to 'closed_lost', lostReason is required
  - If stage changes to 'closed_won', creates notification
```

### Delete Opportunity

```
DELETE /api/v1/crm/opportunities/:id
Response: 204
Permissions: manager+, admin+
Restrictions: Cannot delete if quotations or contracts exist
```

## Companies

### List Companies

```
GET /api/v1/crm/companies
Query: ?page=1&limit=20&search=term&industry=hospitality&status=active
Response: 200 { data: Company[], meta: PaginationMeta }
Permissions: sales_rep+, manager+, admin+, viewer
```

### Get Company

```
GET /api/v1/crm/companies/:id
Response: 200 { data: Company & { contacts, opportunities, projects } }
Permissions: sales_rep+, manager+, admin+, viewer
```

### Create Company

```
POST /api/v1/crm/companies
Body: { name, industry?, size?, website?, phone?, address?, notes? }
Response: 201 { data: Company }
Permissions: sales_rep+, manager+, admin+
Validation: { name: required }
```

### Update Company

```
PATCH /api/v1/crm/companies/:id
Body: { name?, industry?, ... }
Response: 200 { data: Company }
Permissions: owner+, manager+, admin+
```

### Delete Company

```
DELETE /api/v1/crm/companies/:id
Response: 204
Permissions: admin+
Restrictions: Cannot delete with active contracts or projects
```

## Contacts

### List Contacts by Company

```
GET /api/v1/crm/companies/:companyId/contacts
Query: ?page=1&limit=20
Response: 200 { data: Contact[], meta: PaginationMeta }
Permissions: sales_rep+, manager+, admin+, viewer
```

### Create Contact

```
POST /api/v1/crm/companies/:companyId/contacts
Body: { firstName, lastName, email?, phone?, jobTitle?, department?, isPrimary? }
Response: 201 { data: Contact }
Permissions: sales_rep+, manager+, admin+
Business Rules:
  - Only one primary contact per company (deactivate others)
```

### Update Contact

```
PATCH /api/v1/crm/contacts/:id
Body: { firstName?, lastName?, ... }
Response: 200 { data: Contact }
Permissions: owner+, manager+, admin+
```

### Delete Contact

```
DELETE /api/v1/crm/contacts/:id
Response: 204
Permissions: manager+, admin+
```

## Activities

### List Activities (polymorphic)

```
GET /api/v1/crm/activities?entityType=opportunity&entityId=uuid
Query: ?entityType=lead|opportunity|company|contact&entityId=uuid&activityType=call|email|meeting&page=1&limit=20
Response: 200 { data: Activity[], meta: PaginationMeta }
Permissions: owner+, manager+, admin+
```

### Create Activity

```
POST /api/v1/crm/activities
Body: { entityType, entityId, activityType, subject, description?, activityDate, durationMinutes?, assignedTo? }
Response: 201 { data: Activity }
Permissions: sales_rep+, manager+, admin+
```

### Update Activity

```
PATCH /api/v1/crm/activities/:id
Body: { subject?, description?, ... }
Response: 200 { data: Activity }
Permissions: owner+, manager+, admin+
```

### Delete Activity

```
DELETE /api/v1/crm/activities/:id
Response: 204
Permissions: owner+, manager+, admin+
```

## Pipeline Analytics

### Pipeline Summary

```
GET /api/v1/crm/pipeline
Response: 200 {
  data: {
    stages: [
      { stage: "qualification", count: 15, value: 450000 },
      { stage: "proposal", count: 8, value: 1200000 },
      ...
    ],
    totalPipeline: 3200000,
    wonThisMonth: 850000,
    lostThisMonth: 200000,
    conversionRate: 0.35
  }
}
Permissions: manager+, admin+, executive viewer
```

### Win/Loss Rate

```
GET /api/v1/crm/pipeline/win-loss?from=2026-01-01&to=2026-06-30
Response: 200 {
  data: {
    won: { count: 24, value: 4200000 },
    lost: { count: 12, value: 1800000 },
    rate: 0.67
  }
}
Permissions: manager+, admin+, executive viewer
```
