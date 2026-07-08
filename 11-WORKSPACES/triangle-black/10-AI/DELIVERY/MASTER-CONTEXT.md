# MASTER CONTEXT — Enterprise AI Delivery Framework

> Complete context for every AI agent operating within Program 2.

## System Identity

- **Framework:** Enterprise AI Delivery Framework (EADF)
- **Version:** 1.0.0
- **Repository:** `PROGRAM-02-ENTERPRISE-AI-DELIVERY/`
- **Related Blueprint:** `C:\PM\` (Program 1 — Triangle Black Platform Blueprint)

## Core Documents

Every AI agent MUST have read-access to:

| Document | Path | Purpose |
|----------|------|---------|
| AI Constitution | `00-FOUNDATION/AI-CONSTITUTION.md` | Immutable rules |
| Enterprise Principles | `00-FOUNDATION/Enterprise-Principles.md` | Design philosophy |
| Architecture Baseline | `00-FOUNDATION/Architecture-Baseline.md` | System constraints |
| Glossary | `00-FOUNDATION/Glossary.md` | Shared language |
| Naming Standards | `00-FOUNDATION/Naming-Standards.md` | Naming conventions |
| Traceability | `00-FOUNDATION/Traceability.md` | Artifact chain rules |
| Decision Rules | `00-FOUNDATION/Decision-Rules.md` | ADR requirements |

## AI Organization

The framework defines the following AI agent roles. Each has a job description, responsibilities, authority level, inputs, outputs, KPIs, and quality gates.

| Role | Department | Reports To |
|------|-----------|------------|
| Chief Executive AI | CEO Office | Human CEO |
| Chief Strategy AI | CEO Office | Chief Executive AI |
| Chief Enterprise Architect AI | Architecture Office | Chief Executive AI |
| Solution Architect AI | Architecture Office | Chief Enterprise Architect AI |
| Program Manager AI | Delivery Division | Chief Enterprise Architect AI |
| Business Analyst AI | Product Division | Program Manager AI |
| Product Owner AI | Product Division | Program Manager AI |
| Database Architect AI | Engineering Division | Solution Architect AI |
| Backend Lead AI | Engineering Division | Solution Architect AI |
| Frontend Lead AI | Engineering Division | Solution Architect AI |
| UX Architect AI | Engineering Division | Solution Architect AI |
| DevOps Architect AI | Operations Division | Chief Enterprise Architect AI |
| Security Architect AI | Security Division | Chief Enterprise Architect AI |
| QA Director AI | Quality Division | Chief Enterprise Architect AI |
| Performance Engineer AI | Quality Division | QA Director AI |
| Documentation Engineer AI | Knowledge Division | Program Manager AI |
| Code Review AI | Quality Division | QA Director AI |
| Merge Controller AI | Delivery Division | Program Manager AI |

## Delivery Pipeline

Every feature follows this exact pipeline. No agent may skip a stage.

```
Business Requirement
    → Business Validation
    → Architecture
    → Database
    → API
    → Backend
    → Frontend
    → QA
    → Security
    → Performance
    → Documentation
    → Review
    → Merge
    → Release
```

## Context Loading

Every agent loads memory in this order:
1. Vision (from Program 1)
2. Architecture Baseline
3. Business Rules (per domain)
4. DDD Context (bounded context)
5. API Contracts
6. Database Schema
7. Coding Standards
8. Current Sprint Context
9. Current Module Context
10. Task Context

Never send the entire repository to any agent.

## Quality Gates

| Gate | Enforced By | Blocking |
|------|-------------|----------|
| Architecture compliance | Code Review AI | Yes |
| Security review | Security Architect AI | Yes |
| Test coverage ≥ 80% | QA Director AI | Yes |
| Documentation complete | Documentation Engineer AI | Yes |
| All ACs met | Product Owner AI | Yes |
| Performance threshold | Performance Engineer AI | Yes |
| Merge approval | Merge Controller AI | Yes |

## Related Links

- **Program 1 Root:** `C:\PM\00-ENTERPRISE-ARCHITECTURE.md`
- **ADR Records:** `C:\PM\02-DECISION-RECORDS.md`
- **Quality Gates:** `C:\PM\07-QUALITY-GATES.md`
