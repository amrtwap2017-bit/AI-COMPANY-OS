# Sprint 006 — Commercial Portal — Client Self-Service

## Goal
Build the customer portal enabling clients to view quotations, contracts, project status, and submit requests through self-service.

## Capabilities
- CRM-023 — Customer Portal — from Commercial
- CRM-024 — Client Self-Service — from Commercial
- CRM-025 — Document Access — from Commercial
- CRM-026 — Support Ticketing — from Commercial

## Context Pack Required
**Pack ID:** CP-CRM-Quotations, CP-CRM-Contracts
**Total Documents:** 6

### Domain Documents
- `../02-DOMAIN-DOCS/01-Commercial/Customer-Portal.md` — Customer Portal
- `../02-DOMAIN-DOCS/01-Commercial/Self-Service.md` — Self-Service
- `../02-DOMAIN-DOCS/01-Commercial/Support-Ticketing.md` — Support Ticketing
- `../02-DOMAIN-DOCS/01-Commercial/Portal-Security.md` — Portal Security

### Standards
- `../04-STANDARDS/API-Design-Guide.md` — API Design Guide
- `../04-STANDARDS/Security-Standards.md` — Security Standards
- `../04-STANDARDS/UI-Patterns.md` — UI Patterns

## Entities to Build
- PortalUser — Commercial
- PortalSession — Commercial
- SupportTicket — Commercial
- TicketMessage — Commercial
- PortalDocument — Commercial
- Notification — Commercial
- PortalActivity — Commercial

## APIs to Build
- `/api/portal/login` — POST — Portal user login
- `/api/portal/register` — POST — Portal user registration
- `/api/portal/profile` — GET/PUT — Portal profile
- `/api/portal/quotations` — GET — List my quotations
- `/api/portal/quotations/{id}` — GET — Quotation detail
- `/api/portal/quotations/{id}/accept` — POST — Accept quotation
- `/api/portal/contracts` — GET — List my contracts
- `/api/portal/contracts/{id}` — GET — Contract detail
- `/api/portal/contracts/{id}/documents` — GET — Contract documents
- `/api/portal/projects` — GET — List my projects
- `/api/portal/projects/{id}` — GET — Project status
- `/api/portal/tickets` — GET/POST — Support tickets
- `/api/portal/tickets/{id}` — GET/PUT — Ticket detail
- `/api/portal/tickets/{id}/messages` — GET/POST — Ticket messages
- `/api/portal/notifications` — GET — User notifications
- `/api/portal/notifications/{id}/read` — POST — Mark read

## Screens to Build
- `/portal/login` — Portal login
- `/portal/register` — Portal registration
- `/portal/dashboard` — Portal dashboard
- `/portal/profile` — Profile management
- `/portal/quotations` — My quotations list
- `/portal/quotations/{id}` — Quotation detail with accept
- `/portal/contracts` — My contracts list
- `/portal/contracts/{id}` — Contract detail with documents
- `/portal/projects` — My projects list
- `/portal/projects/{id}` — Project status view
- `/portal/tickets` — Support tickets list
- `/portal/tickets/new` — Create support ticket
- `/portal/tickets/{id}` — Ticket detail with messages
- `/portal/notifications` — Notification center

## AI Agents Assigned
- Backend Lead AI — Portal, ticket, notification APIs
- Frontend Lead AI — All portal screens
- Database Architect AI — Portal user and session schema
- Security AI — Portal security and access control

## Dependencies
- Sprint 004 — Commercial Quotations
- Sprint 005 — Commercial Contracts

## Quality Gates
- Portal users can only see their own data
- Quotation acceptance triggers contract creation
- Ticket messages are real-time via WebSocket
- Portal session expires after inactivity
- All portal endpoints enforce rate limiting

## Estimated Deliverables
- 3 backend modules (portal, ticket, notification)
- 14 frontend pages
- 50 unit tests
- 7 integration tests
- 3 documents
