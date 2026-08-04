# Enterprise Navigation Architecture v4

## Navigation principle

Navigation exposes workspaces and decisions, not an accumulation of pages. Each route must declare: capability, workflow, actor roles, entity scope, required permission, feature flag, tenant module and lifecycle status. Existing URLs remain as compatibility redirects until migration is complete.

## Target navigation

| Workspace | Primary objects and work | Existing route families to consolidate |
|---|---|---|
| Commercial | customers, leads, opportunities, quotations, contracts, renewals | `commercial`, `leads`, `quotes`, `contracts`, customer 360. |
| Projects | portfolio, projects, milestones, risks, delivery, handover | `projects-center`, `engineering`, project APIs. |
| Operations | command center, requests, work orders, dispatch, calendar, SLA | `operations`, legacy `work-orders`, `technicians`, `tasks`. |
| Supply Chain | demand, approvals, RFQs, suppliers, POs, receipts, inventory | `supply-chain`, legacy `inventory`, `purchase-*`, `warehouses`. |
| Maintenance | assets, plans, inspections, reliability, warranty | `maintenance`, `assets`, predictive maintenance/digital twin views. |
| Resources | people, crews, capacity, skills, time | technicians, agents, administration technicians, time tracking. |
| Finance | AR, AP, invoice matching, payments, cost and close | invoices, payment tracking, financial, analytics costs. |
| Executive | portfolio, KPI, risks, exceptions, reports | `executive`, analytics, reports, scorecards. |
| Platform | organization, users, policies, configuration, integrations, audit | administration, settings, integration, system. |
| AI | assistant inbox, recommendations, knowledge, agent governance | ai, hub, graph, signals, recommendations. |

## Route treatment

- Keep existing portal, client-portal and admin-portal URLs operational.
- Classify every existing route as `canonical`, `compatibility redirect`, `workflow view`, `platform view`, `experimental`, or `retirement candidate`.
- The current exact duplicate redirect pages are compatibility debt, not deletion targets. Create a redirect registry and deprecation telemetry before any consolidation.
- Client and supplier portals are role-specific experiences backed by the same domain APIs and policy layer; they are not independent domain owners.

## Standard page contract

Every canonical workspace page provides context/breadcrumb, page outcome, role-allowed actions, KPI scope, saved search/filter, pagination/virtualization where applicable, loading/empty/error states, responsive behavior, keyboard/accessibility support, and audit-safe deep links.

