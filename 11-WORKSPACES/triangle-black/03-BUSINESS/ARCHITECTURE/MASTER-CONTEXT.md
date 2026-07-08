# MASTER CONTEXT — Triangle Black Digital Operations Ecosystem

This document is the entry point for anyone — human or AI — who needs to understand the full scope of Triangle Black's business, operations, and platform.

## Company Identity

| Field | Value |
|---|---|
| Legal Name | Triangle Black |
| Industry | Hospitality Engineering |
| Business Type | Operational Engineering Partner |
| Headquarters | Sharm El Sheikh, Egypt (starting) |
| Stage | Pre-revenue / Startup |
| Repository | TriangleBlack-Digital-Operations-Ecosystem |

## Core Statements

- **Purpose:** Transform hospitality operations from fragmented, reactive, and opaque processes into connected, data-driven, engineering-led operations.
- **Vision:** Become the most trusted operational engineering partner for the hospitality industry across the Middle East.
- **Mission:** Help hospitality businesses design, supply, build, maintain, optimize, and digitally manage their engineering operations.

## Business Model

Revenue sources (current):
- Engineering Supply (margin on materials/equipment)
- Engineering Contracting (labor + installation)
- Design Services (consulting/assessment)
- Project Management (oversight fees)
- Operational Partnership (retainer)

Revenue sources (future):
- Software Subscription (SaaS)
- AI Services (intelligent agents)
- Data Analytics (benchmarking/insights)

## Target Market

- **Beachhead:** Sharm El Sheikh hotels
- **Expansion 1:** Egypt (~USD 21.54B hospitality market)
- **Expansion 2:** Middle East
- **Expansion 3:** Global hospitality operations

## V1 MVP Modules

1. Public Website (lead generation)
2. CRM (leads, opportunities, companies, contacts)
3. Projects (execution, milestones, deliverables)
4. Quotations (RFQ → proposal → quotation → contract)
5. Client Portal (transparency, documents, reports)
6. Executive Dashboard (pipeline, revenue, KPIs)
7. Administration (users, roles, settings)

## Technology Stack (V1)

Ubuntu LTS → Docker Compose → Nginx → PostgreSQL (schema-per-tenant) → Prisma → Next.js → NestJS → Let's Encrypt → Cloudflare Free → GitHub Free + Actions → Local disk storage

## Repository Navigation

### By Role

| Role | Start Here |
|---|---|
| Founder / CEO | 01-Executive/, 02-Business/ |
| Product Manager | 07-Product/, 08-UX/ |
| Architect | 09-Architecture/, 05-Domain/ |
| Backend Engineer | 11-Backend/, 10-Database/, 13-API/ |
| Frontend Engineer | 12-Frontend/, 08-UX/ |
| DevOps | 14-Infrastructure/, 18-Deployment/ |
| AI Engineer | 16-AI/, 21-Knowledge-Base/ |
| Operations | 06-Operations/, 20-Operations-Manual/ |
| Engineer/Technician | 04-Hospitality-Knowledge/, 20-Operations-Manual/ |

### By Task

| Task | Documents |
|---|---|
| Understand the company | 01-Executive/, 02-Business/ |
| Research the market | 03-Market-Research/ |
| Learn hospitality domain | 04-Hospitality-Knowledge/ |
| Design a new feature | 05-Domain/ → 07-Product/ → 08-UX/ → 13-API/ → 10-Database/ |
| Implement a feature | 11-Backend/, 12-Frontend/ |
| Deploy to production | 14-Infrastructure/, 18-Deployment/ |
| Write operational SOP | 20-Operations-Manual/ |
| Plan the roadmap | 24-Roadmap/ |

## Document Numbering Convention

`{FOLDER}-{SEQUENCE}-{TITLE}`

Example: `01-Executive-02-Vision.md` (folder 01, sequence 02, title Vision)

## Status Legend

| Status | Meaning |
|---|---|
| Draft | Initial version, not yet reviewed |
| Review | Under review by stakeholders |
| Approved | Reviewed and approved |
| Superseded | Replaced by a newer version |
| Archived | No longer active, kept for reference |

## Cross-Reference Map

```
01-Executive ───→ 02-Business ───→ 05-Domain ───→ 07-Product
     ↓                 ↓                ↓              ↓
03-Market-Research  06-Operations   09-Architecture  08-UX
     ↓                                               ↓
04-Hospitality-Knowledge                          10-Database
                                                      ↓
                                                 11-Backend  12-Frontend
                                                      ↓         ↓
                                                    13-API ────┘
                                                      ↓
                                                 14-Infrastructure
                                                      ↓
                                                 15-Security  16-AI
                                                      ↓         ↓
                                                 17-Engineering
                                                      ↓
                                                 18-Deployment
                                                      ↓
                                                 19-Testing
                                                      ↓
                                                 20-Operations-Manual
```

## Architecture Decision Log

| ADR | Title | Status |
|---|---|---|
| 001 | Technology Stack | Approved |
| 002 | Database Selection | Approved |
| 003 | Frontend Framework | Approved |
| 004 | Backend Framework | Approved |
| 005 | Multi-Tenancy Strategy | Approved |
| 006 | API Design | Approved |
| 007 | Authentication | Approved |
| 008 | File Storage | Approved |
| 009 | Deployment Strategy | Approved |
| 010 | AI Integration Strategy | Draft |

## Key Contacts

| Role | Name (Placeholder) |
|---|---|
| Founder / CEO | TBD |
| CTO / Enterprise Architect | TBD |
| Product Director | TBD |
| Operations Director | TBD |
| Engineering Lead | TBD |

---

**Document ID:** TBOS-MASTER-CONTEXT | **Version:** 1.0 | **Last Updated:** 2026-06-30 | **Status:** Approved
