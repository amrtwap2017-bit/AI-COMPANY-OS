# Entity Relationships

## Platform Schema

```
tenants  1──N  users
```

## Tenant Schema — CRM Module

```
leads  1──0..1  opportunities
companies  1──N  opportunities
companies  1──N  contacts
users (assigned_to)  1──N  leads
users (assigned_to)  1──N  opportunities

activities is polymorphic:
  (entity_type, entity_id) → leads|opportunities|companies|contacts
```

## Tenant Schema — Quotations Module

```
opportunities  1──0..N  rfqs
opportunities  1──0..N  quotations
companies  1──N  quotations
quotations  1──N  quotation_line_items
quotations  0..1──0..1  contracts (through quotation_id)

opportunities  1──0..N  contracts (through company)
companies  1──N  contracts
```

## Tenant Schema — Projects Module

```
contracts  1──0..N  projects
companies  1──N  projects
users (manager_id)  1──N  projects
projects  1──N  milestones
projects  1──N  project_files
milestones  1──N  project_files
projects  1──N  surveys
surveys  0..1──0..1  assessments
users (surveyor_id)  1──N  surveys
```

## Tenant Schema — Client Portal

```
companies  1──N  service_requests
portal_users  1──N  service_requests
users (assigned_to)  1──N  service_requests
users (id)  1──0..1  portal_users
```

## Tenant Schema — Document Management

```
companies  1──N  documents
users (uploaded_by)  1──N  documents
projects  1──N  documents (optional)
```

## Business Rules Enforced by Relationships

| Rule | Enforcement |
|------|-------------|
| A quotation belongs to one opportunity | FK → opportunities.id |
| A project must have a contract | FK → contracts.id, NOT NULL |
| A milestone belongs to one project | FK → projects.id |
| A contact must belong to a company | FK → companies.id, NOT NULL |
| An opportunity may optionally originate from a lead | FK → leads.id, SET NULL |
| A service request must come from a company | FK → companies.id, NOT NULL |
| Assessment requires a survey | FK → surveys.id |
