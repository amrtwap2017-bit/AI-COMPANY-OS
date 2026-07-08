# Sprint 009 — Project Closeout — Handover and Variations

## Goal
Build project closeout capabilities with handover documentation, variation order management, and final acceptance to complete projects and recognize final revenue.

## Capabilities
- PROJ-011 — Project Closeout — from Project Delivery
- PROJ-012 — Handover Documentation — from Project Delivery
- PROJ-013 — Variation Orders — from Project Delivery
- PROJ-014 — Final Acceptance — from Project Delivery
- PROJ-015 — Lessons Learned — from Project Delivery

## Context Pack Required
**Pack ID:** CP-Project-Delivery
**Total Documents:** 5

### Domain Documents
- `../02-DOMAIN-DOCS/02-Project-Delivery/Project-Closeout.md` — Project Closeout
- `../02-DOMAIN-DOCS/02-Project-Delivery/Handover-Process.md` — Handover Process
- `../02-DOMAIN-DOCS/02-Project-Delivery/Variation-Orders.md` — Variation Orders
- `../02-DOMAIN-DOCS/02-Project-Delivery/Final-Acceptance.md` — Final Acceptance

### Standards
- `../04-STANDARDS/API-Design-Guide.md` — API Design Guide
- `../04-STANDARDS/Document-Standards.md` — Document Standards

## Entities to Build
- ProjectCloseout — Project Delivery
- HandoverDocument — Project Delivery
- HandoverChecklist — Project Delivery
- VariationOrder — Project Delivery
- VariationLineItem — Project Delivery
- FinalAcceptance — Project Delivery
- AcceptanceCertificate — Project Delivery
- LessonsLearned — Project Delivery

## APIs to Build
- `/api/projects/{id}/closeout` — GET/POST — Closeout management
- `/api/projects/{id}/closeout/initiate` — POST — Initiate closeout
- `/api/projects/{id}/handover-documents` — GET/POST — Handover docs
- `/api/projects/{id}/handover-documents/{dId}` — GET/PUT/DELETE — Doc detail
- `/api/projects/{id}/handover-checklist` — GET/POST/PUT — Checklist
- `/api/projects/{id}/variations` — GET/POST — Variation orders
- `/api/projects/{id}/variations/{vId}` — GET/PUT — Variation detail
- `/api/projects/{id}/variations/{vId}/approve` — POST — Approve variation
- `/api/projects/{id}/final-acceptance` — GET/POST — Final acceptance
- `/api/projects/{id}/final-acceptance/certificate` — GET — Certificate PDF
- `/api/projects/{id}/lessons-learned` — GET/POST — Lessons learned
- `/api/projects/{id}/complete` — POST — Mark project complete

## Screens to Build
- `/projects/{id}/closeout` — Closeout overview dashboard
- `/projects/{id}/closeout/initiate` — Initiate closeout workflow
- `/projects/{id}/handover` — Handover document list
- `/projects/{id}/handover/documents/new` — Upload document
- `/projects/{id}/handover/checklist` — Handover checklist
- `/projects/{id}/variations` — Variation orders list
- `/projects/{id}/variations/new` — Create variation order
- `/projects/{id}/variations/{vId}` — Variation detail
- `/projects/{id}/final-acceptance` — Final acceptance form
- `/projects/{id}/final-acceptance/certificate` — Certificate view
- `/projects/{id}/lessons-learned` — Lessons learned entries

## AI Agents Assigned
- Backend Lead AI — Closeout, variation, acceptance APIs
- Frontend Lead AI — Closeout screens and workflows
- Database Architect AI — Variation and closeout schema
- Document AI — Handover documentation and certificate generation

## Dependencies
- Sprint 008 — Project Execution (engineering and quality data)

## Quality Gates
- Closeout cannot be initiated until all milestones are complete
- Variation order pricing recalculates project totals
- Handover checklist enforces mandatory items before final acceptance
- Acceptance certificate generates as a signed PDF
- Lessons learned data is captured and searchable

## Estimated Deliverables
- 3 backend modules (closeout, variation, acceptance)
- 11 frontend pages
- 50 unit tests
- 6 integration tests
- 4 documents
