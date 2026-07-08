# Sprint Maps — Program 2.5 Delivery Mapping

## Overview

This directory contains the sprint-by-sprint implementation sequence for Program 2.5 (Enterprise Delivery Mapping). Sprints are ordered using the **revenue-first** principle: capabilities that directly generate or accelerate revenue are built first, followed by operational and support capabilities.

## Sprint Allocation by Domain

| Domain | Sprints | Sprint IDs |
|--------|---------|------------|
| Commercial | 6 | 001–006 |
| Project Delivery | 4 | 007–009 (plus cross-cutting in 021) |
| Procurement | 3 | 010, 011 (partial), 021 (partial) |
| Supplier Management | 2 | 011 |
| Inventory | 2 | 012 |
| Financial Control | 3 | 013–015 |
| Maintenance | 2 | 016 |
| Document Management | 1 | 017 |
| Executive Intelligence | 2 | 018 |
| HR | 3 | 019–020 (plus 021 partial) |
| Cross-Cutting | 2 | 021 |

**Total: ~30 sprints across 22 sprint files + Sprint 0 (Setup)**

## Sprint-to-Context-Pack Mapping

| Sprint | Context Pack(s) Required |
|--------|-------------------------|
| Sprint 000 | CP-Authentication |
| Sprint 001 | CP-Authentication, CP-CRM-Leads |
| Sprint 002 | CP-CRM-Opportunities |
| Sprint 003 | CP-CRM-Leads (surveys) |
| Sprint 004 | CP-CRM-Quotations |
| Sprint 005 | CP-CRM-Contracts |
| Sprint 006 | CP-CRM-Quotations, CP-CRM-Contracts |
| Sprint 007 | CP-Project-Delivery |
| Sprint 008 | CP-Project-Delivery |
| Sprint 009 | CP-Project-Delivery |
| Sprint 010 | CP-Procurement |
| Sprint 011 | CP-Procurement, CP-Inventory |
| Sprint 012 | CP-Inventory |
| Sprint 013 | CP-Financial-Invoicing |
| Sprint 014 | CP-Financial-Invoicing |
| Sprint 015 | CP-Financial-Invoicing |
| Sprint 016 | CP-Maintenance |
| Sprint 017 | CP-Project-Delivery (documents) |
| Sprint 018 | CP-Executive-Dashboard |
| Sprint 019 | CP-HR-Employee |
| Sprint 020 | CP-HR-Timesheets |
| Sprint 021 | All (cross-cutting) |

## File Naming Convention

`Sprint-[XXX]-[Domain]-[Capability].md` where:
- `XXX` = three-digit sprint number (000 for setup)
- `Domain` = domain short name
- `Capability` = primary capability delivered

## Quality Gates

Every sprint must pass:
1. All unit tests pass (>80% coverage)
2. Integration tests pass for all new endpoints
3. API documentation matches implementation
4. Screen documentation matches implementation
5. No critical or high-security vulnerabilities
6. Peer review completed with at least 2 approvals
