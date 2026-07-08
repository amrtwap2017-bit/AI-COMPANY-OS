# Artifact Definitions

> Defines what constitutes an artifact, artifact metadata requirements, and the artifact lifecycle.

## What is an Artifact?

An artifact is any persistent, traceable output produced by an AI agent within the Enterprise AI Delivery Framework. Artifacts are the primary units of work product and must meet defined quality and metadata standards.

### Artifact Characteristics

| Characteristic | Description |
|----------------|-------------|
| Persistent | Artifacts exist beyond the session that created them |
| Traceable | Every artifact links to a source requirement or decision |
| Owned | Every artifact has exactly one owner |
| Versioned | Changes are tracked through version history |
| Reviewable | Artifacts pass through defined quality gates |
| Auditable | All artifact actions are logged |

## Artifact Types

### Requirement Artifacts

| Type | ID Prefix | Example | Owner |
|------|-----------|---------|-------|
| Business Requirement | REQ | REQ-015: Payment Processing | Business Analyst AI |
| User Story | US | US-042: User views payment history | Product Owner AI |
| Acceptance Criteria | AC | AC-015-01: Payment completes within 5 seconds | Product Owner AI |
| Feature Specification | FS | FS-008: Refund Workflow Specification | Business Analyst AI |
| Epic | EPIC | EPIC-003: Payment Lifecycle | Business Analyst AI |

### Architecture Artifacts

| Type | ID Prefix | Example | Owner |
|------|-----------|---------|-------|
| Architecture Decision Record | ADR | ADR-012: Database Naming Conventions | Solution Architect AI |
| System Architecture Diagram | ARCH | ARCH-003: Payment System Architecture | Solution Architect AI |
| API Contract | API | API-022: POST /api/payments | Solution Architect AI |
| Database Schema | DB | DB-007: Payment Schema | Database Architect AI |
| Integration Map | INT | INT-004: Payment Gateway Integration | Solution Architect AI |
| Domain Model | DM | DM-002: Payment Domain Model | Solution Architect AI |

### Engineering Artifacts

| Type | ID Prefix | Example | Owner |
|------|-----------|---------|-------|
| Backend Module | BE | BE-015: Payment Module | Backend Lead AI |
| Frontend Component | FE | FE-032: Payment Form | Frontend Lead AI |
| Database Migration | MIG | MIG-008: Create Payment Table | Database Architect AI |
| Configuration | CFG | CFG-003: Payment Service Config | DevOps Architect AI |
| API Implementation | API-IMPL | API-022-IMPL: Payment Endpoint | Backend Lead AI |

### Quality Artifacts

| Type | ID Prefix | Example | Owner |
|------|-----------|---------|-------|
| Test Plan | TP | TP-005: Payment Test Plan | QA Director AI |
| Test Suite | TS | TS-015: Payment Unit Tests | QA Director AI |
| Quality Report | QR | QR-003: Sprint 4 Quality Report | QA Director AI |
| Performance Report | PR | PR-002: Payment API Performance | Performance Engineer AI |
| Security Review | SR | SR-004: Payment Security Review | Security Architect AI |

### Operations Artifacts

| Type | ID Prefix | Example | Owner |
|------|-----------|---------|-------|
| Deployment Script | DEP | DEP-006: Payment Service Deploy | DevOps Architect AI |
| CI/CD Pipeline | CI | CI-002: Payment Build Pipeline | DevOps Architect AI |
| Runbook | RB | RB-003: Payment Incident Response | DevOps Architect AI |
| Monitoring Dashboard | MON | MON-002: Payment Service Dashboard | DevOps Architect AI |

### Knowledge Artifacts

| Type | ID Prefix | Example | Owner |
|------|-----------|---------|-------|
| Documentation | DOC | DOC-042: Payment API Documentation | Documentation Engineer AI |
| Release Notes | RN | RN-005: Sprint 4 Release Notes | Documentation Engineer AI |
| Knowledge Base Entry | KB | KB-012: Payment Refund Pattern | Documentation Engineer AI |
| Lesson Learned | LL | LL-003: Database Migration Pitfalls | All agents |
| Pattern | PAT | PAT-005: Event-Driven Payment Processing | All agents |

## Artifact Metadata

Every artifact must include metadata in a standardized header (YAML front matter in markdown files, equivalent in other formats):

### Required Metadata

```yaml
---
artifact-id: Type-NNN
artifact-type: [Requirement / Architecture / Engineering / Quality / Operations / Knowledge]
title: Descriptive title
status: [Draft / Review / Approved / Deprecated / Archived]
owner: Agent Role
created-by: Agent Role
created-date: YYYY-MM-DD
version: MAJOR.MINOR
traceability:
  - source: REQ-NNN (or ADR-NNN, EPIC-NNN)
quality-gates:
  - gate: GATE-ID
    status: [Pending / Passed / Failed / Waived]
---
```

### Optional Metadata

```yaml
---
reviewers:
  - Agent Role
approver: Agent Role
approved-date: YYYY-MM-DD
supersedes: ART-NNN
superseded-by: ART-NNN
tags:
  - domain: domain-name
  - sprint: sprint-number
description: Brief description of the artifact
change-summary: Summary of changes from previous version
---
```

## Artifact Lifecycle

```
                    ┌──────────────┐
                    │    Draft     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Review     │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼───┐  ┌────▼────┐  ┌───▼────────┐
     │  Approved  │  │Rejected │  │ Needs Work │
     └────────┬───┘  └─────────┘  └───┬────────┘
              │                        │
     ┌────────▼───┐                   │
     │Implemented │                   │
     └────────┬───┘                   │
              │                       │
     ┌────────▼───┐                  │
     │  Active    │◄─────────────────┘
     └────────┬───┘
              │
     ┌────────▼───┐
     │ Deprecated │
     └────────┬───┘
              │
     ┌────────▼───┐
     │  Archived  │
     └────────────┘
```

### Lifecycle States Detail

| State | Description | Actions Permitted |
|-------|-------------|-------------------|
| **Draft** | Initial creation; work in progress | Create, Edit, Delete by owner |
| **Review** | Submitted for review; locked for editing | Read, Comment, Approve, Reject, Request Changes |
| **Approved** | Review passed; ready for implementation | Read, Implement |
| **Rejected** | Review failed; will not be implemented | Read, Archive, Resubmit |
| **Needs Work** | Review feedback requires changes | Read, Edit by owner, Resubmit |
| **Implemented** | Content/decision has been realized | Read, Update (with re-review) |
| **Active** | Current and authoritative | Read, Reference, Supersede |
| **Deprecated** | Superseded or obsolete; maintained for reference | Read (with deprecation notice) |
| **Archived** | Historical record; no longer active | Read by request only |

### Stage Transitions

| From | To | Trigger | Authority |
|------|----|---------|-----------|
| Draft | Review | Owner submits for review | Owner |
| Review | Approved | Approver signs off | Approver |
| Review | Rejected | Approver rejects | Approver |
| Review | Needs Work | Reviewer requests changes | Reviewer |
| Needs Work | Review | Owner resubmits | Owner |
| Approved | Implemented | Implementation complete | Implementer |
| Implemented | Active | Verification complete | Owner |
| Active | Deprecated | Superseded by new artifact | Owner with approval |
| Deprecated | Archived | Archival period reached | Program Manager AI |
| Rejected | Archived | Final rejection | Program Manager AI |

## Artifact Naming

### File Naming Convention
```
{artifact-type}-{sequential-number}-{kebab-case-title}.{extension}
```

Examples:
- `REQ-015-Payment-Processing.md`
- `ADR-012-Database-Naming-Conventions.md`
- `BE-015-Payment-Module.ts`

### Directory Organization
Artifacts are stored in their respective pipeline stage directory:
```
PROGRAM-02-ENTERPRISE-AI-DELIVERY/
├── 00-FOUNDATION/         # Global artifacts
├── 01-AI-ORGANIZATION/    # Agent specifications
├── 02-AI-GOVERNANCE/      # Governance artifacts
├── 03-COMMUNICATION/      # Communication artifacts
├── 04-DELIVERY-PIPELINE/  # Pipeline artifacts
├── 05-STANDARDS/          # Standards artifacts
├── 06-TEMPLATES/          # Template artifacts
├── 07-PROMPTS/            # Prompt artifacts
├── 08-QUALITY/            # Quality artifacts
├── 09-AUTOMATION/         # Automation artifacts
├── 10-METRICS/            # Metrics artifacts
├── 11-EXECUTION/          # Execution artifacts
├── 12-KNOWLEDGE/          # Knowledge artifacts
```

## Artifact Relationships

Artifacts may relate to each other in the following ways:

| Relationship | Description | Example |
|-------------|-------------|---------|
| **Trace** | Artifact A traces to Artifact B | `BE-015` traces to `REQ-015` |
| **Depends** | Artifact A depends on Artifact B | `FE-032` depends on `API-022` |
| **Implements** | Artifact A implements Artifact B | `BE-015` implements `ADR-012` |
| **Supersedes** | Artifact A replaces Artifact B | `ADR-018` supersedes `ADR-012` |
| **References** | Artifact A references Artifact B | `DOC-042` references `API-022` |
| **Validates** | Artifact A validates Artifact B | `TS-015` validates `BE-015` |

## Artifact Deletion

Artifacts are never permanently deleted. Instead:
1. Artifacts are marked as **Deprecated** when superseded
2. After 6 months in Deprecated state, artifacts are **Archived**
3. Archived artifacts are moved to a compressed archive store
4. Permanent deletion requires Chief Enterprise Architect AI approval
5. The deletion is logged in the audit trail with rationale
