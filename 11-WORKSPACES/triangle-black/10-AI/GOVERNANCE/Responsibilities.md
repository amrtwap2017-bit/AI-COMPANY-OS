# AI Agent Responsibilities

> Defines which AI agent role is responsible for which artifact types across the delivery pipeline.

## Responsibility Matrix

| Artifact Type | Primary Owner | Contributors | Reviewers | Approvers |
|---------------|--------------|--------------|-----------|-----------|
| Business Requirements | Business Analyst AI | Product Owner AI | Program Manager AI | Product Owner AI |
| User Stories | Product Owner AI | Business Analyst AI | Program Manager AI | Program Manager AI |
| Acceptance Criteria | Product Owner AI | Business Analyst AI | QA Director AI | Program Manager AI |
| Architecture Decision Records | Solution Architect AI | Chief Enterprise Architect AI | Chief Enterprise Architect AI | Chief Enterprise Architect AI |
| System Architecture Diagrams | Solution Architect AI | Chief Enterprise Architect AI | Chief Enterprise Architect AI | Chief Enterprise Architect AI |
| API Contracts | Solution Architect AI | Backend Lead AI | Code Review AI | Solution Architect AI |
| Database Schemas | Database Architect AI | Solution Architect AI | Code Review AI | Solution Architect AI |
| Database Migrations | Database Architect AI | DevOps Architect AI | Code Review AI | Solution Architect AI |
| Backend Code | Backend Lead AI | Frontend Lead AI | Code Review AI | Merge Controller AI |
| Frontend Code | Frontend Lead AI | UX Architect AI | Code Review AI | Merge Controller AI |
| UI/UX Specifications | UX Architect AI | Frontend Lead AI | Product Owner AI | Solution Architect AI |
| Unit Tests | Backend Lead AI / Frontend Lead AI | QA Director AI | Code Review AI | QA Director AI |
| Integration Tests | QA Director AI | Backend Lead AI | Performance Engineer AI | QA Director AI |
| E2E Tests | QA Director AI | Performance Engineer AI | Code Review AI | QA Director AI |
| Performance Tests | Performance Engineer AI | QA Director AI | DevOps Architect AI | QA Director AI |
| Security Reviews | Security Architect AI | Code Review AI | Chief Enterprise Architect AI | Security Architect AI |
| Deployment Scripts | DevOps Architect AI | Backend Lead AI | Security Architect AI | DevOps Architect AI |
| CI/CD Configurations | DevOps Architect AI | Merge Controller AI | Security Architect AI | DevOps Architect AI |
| Documentation | Documentation Engineer AI | All agents | Product Owner AI | Program Manager AI |
| Release Notes | Documentation Engineer AI | Program Manager AI | Chief Enterprise Architect AI | Program Manager AI |
| API Documentation | Documentation Engineer AI | Backend Lead AI | Solution Architect AI | Documentation Engineer AI |
| Test Plans | QA Director AI | Performance Engineer AI | Program Manager AI | QA Director AI |
| Sprint Backlog | Program Manager AI | Product Owner AI | Chief Enterprise Architect AI | Chief Enterprise Architect AI |
| OKRs | Chief Executive AI | Chief Strategy AI | Chief Enterprise Architect AI | Chief Executive AI |
| Runbooks | DevOps Architect AI | Documentation Engineer AI | Security Architect AI | DevOps Architect AI |
| Knowledge Base | All agents | Documentation Engineer AI | Chief Enterprise Architect AI | Documentation Engineer AI |
| Quality Reports | QA Director AI | Performance Engineer AI | Program Manager AI | Chief Enterprise Architect AI |

## Role Definitions

### Primary Owner
The agent that creates and maintains the artifact. Responsible for its correctness, completeness, and timeliness.

### Contributor
Agents that provide input, data, or partial content to the artifact. Contributors are consulted but not accountable.

### Reviewer
Agents that must inspect the artifact for quality, consistency, and compliance before approval. Reviewers can block the artifact.

### Approver
The agent that gives final sign-off. The artifact cannot proceed to the next pipeline stage without approval.

## Artifact Type Categories

### Requirement Artifacts
Business Requirements, User Stories, Acceptance Criteria, Feature Specifications

### Architecture Artifacts
ADRs, System Architecture, API Contracts, Database Schemas, Integration Maps

### Engineering Artifacts
Backend Code, Frontend Code, Database Migrations, Configuration Files

### Quality Artifacts
Test Plans, Unit Tests, Integration Tests, E2E Tests, Performance Tests, Quality Reports

### Security Artifacts
Security Reviews, Threat Models, Vulnerability Assessments, Compliance Reports

### Operations Artifacts
Deployment Scripts, CI/CD Config, Runbooks, Monitoring Dashboards

### Knowledge Artifacts
Documentation, Release Notes, Knowledge Base Entries, Lessons Learned

## Responsibility Transfer

1. An agent may delegate artifact creation to a contributor but remains the primary owner
2. Ownership changes must be logged in the audit trail with rationale
3. The previous owner remains available for consultation for one full sprint after transfer
