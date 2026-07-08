# Phase 03 — UX Architecture

> User experience design principles and patterns for Triangle Black.

## UX Principles

| Principle | Description |
|-----------|-------------|
| Task-focused | Every screen enables a specific business task |
| Progressive disclosure | Show what's needed, hide complexity |
| Consistent patterns | Same interaction patterns across all domains |
| Mobile-first responsive | All screens usable on tablet and mobile |
| Offline resilience | Graceful degradation when offline |
| Accessibility | WCAG 2.1 AA compliance |

## User Personas

| Persona | Role | Primary Tasks | Frequency |
|---------|------|---------------|-----------|
| Sales Rep | Commercial | Lead capture, qualification, quotation | Daily |
| Project Manager | Project Delivery | Milestone tracking, NCR management | Daily |
| Procurement Officer | Procurement | PO creation, supplier coordination | Daily |
| Site Supervisor | Project/Field | Daily reports, photos, NCR photos | Daily |
| Financial Controller | Financial Control | Invoicing, 3-way match, revenue | Weekly |
| CEO/Partner | Executive | Dashboard review, KPI monitoring | Daily |
| Maintenance Tech | Maintenance | Service request resolution | Daily |

## UX Flows

See `08-UX/` for detailed user journey maps and wireframes.

## Key UX Patterns

| Pattern | Description | Used In |
|---------|-------------|---------|
| Unified search | Global search across all entities | All screens |
| Inline editing | Edit fields directly in list views | Lead list, stock list |
| Batch actions | Select multiple items, perform action | Lead bulk assign, PO bulk approve |
| Approval queue | Centralized approval task list | All approval workflows |
| Activity timeline | Chronological event feed per entity | Lead detail, project detail |
| Drag-and-drop | Pipeline stages, kanban boards | Opportunity pipeline |
| Split view | List + detail on same screen | Lead management |
| Quick actions | Action buttons on list rows | All list screens |

## Design System

See [Design System](Design-System.md) for complete UI component specifications.

## Screen Specifications

See [Screen Architecture](Screen-Architecture.md) for detailed screen-by-screen specifications.
