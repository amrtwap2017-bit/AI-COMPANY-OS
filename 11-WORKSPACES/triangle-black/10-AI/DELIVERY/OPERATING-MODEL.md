# Operating Model

> How the Enterprise AI Delivery Framework operates day-to-day.

## Execution Model

The framework operates as a **governed pipeline** with three execution modes:

| Mode | Trigger | Description |
|------|---------|-------------|
| Sprint Execution | Sprint start | Full pipeline: requirement → release for planned items |
| Hotfix | Production issue | Expedited pipeline with reduced gates |
| Continuous Improvement | Retrospective | Knowledge capture, pattern updates, framework evolution |

## Agent Invocation

Agents are invoked in sequence, not in parallel. Each agent:
1. Receives its context packet (only what it needs)
2. Performs its task
3. Produces its deliverable
4. Passes to the next agent in the chain
5. Logs its decisions to the audit trail

## Context Packet

Each context packet contains:
```
Current Task:
  - Task ID
  - Task Description
  - Acceptance Criteria
  - Priority
  - Dependencies

Domain Context:
  - Bounded Context
  - Business Rules (relevant subset)
  - Entity Definitions
  - Existing Artifacts

Technical Context:
  - Relevant Architecture Decisions (ADRs)
  - API Contracts (if applicable)
  - Database Schema (if applicable)
  - Coding Standards

Sprint Context:
  - Sprint Goal
  - Current Sprint Backlog
  - Definition of Done

Enterprise Context (read-only reference):
  - AI Constitution (immutable rules)
  - Architecture Baseline
  - Traceability Requirements
```

## Approval Matrix

| Decision | Authority | Automatic | Human Required |
|----------|-----------|-----------|----------------|
| Architecture changes | Enterprise Architect AI | Minor only | Major changes |
| Business rule interpretation | Product Owner AI | Standard cases | Ambiguous cases |
| Code generation | Backend/Frontend AI | All | — |
| Database migration | Database Architect AI | Non-destructive | Destructive |
| Security exception | Security Architect AI | — | All |
| Production release | Merge Controller AI | — | All |
| Framework change | Chief Enterprise Architect AI | — | All |
| New requirement | Business Analyst AI | — | All |

## Escalation Chain

```
Agent → Direct Supervisor AI → Chief Enterprise Architect AI → Human CTO
```

An agent escalates when:
- It encounters ambiguous requirements
- It identifies a conflict between rules
- A decision exceeds its authority
- A quality gate fails and cannot be resolved
- A dependency is blocked

## Session Lifecycle

1. **Init:** Load agent identity, load context packet, load memory
2. **Execute:** Perform task, generate artifacts, write decisions
3. **Validate:** Self-check against quality gates, verify traceability
4. **Deliver:** Package artifacts, write handover summary, pass to next agent
5. **Log:** Write session summary to audit trail, update knowledge if applicable
