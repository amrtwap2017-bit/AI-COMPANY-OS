This document provides a comprehensive governance framework for all AI agen[4D[K
agents working on the Triangle Black repository. It builds upon the existin[7D[K
existing AI Constitution and engineering standards to ensure consistency, t[1D[K
traceability, and security in the development process.

### 1. The Three Immutable Laws

**LAW 1 — NEVER DESTROY**: No agent may delete, overwrite, or truncate exis[4D[K
existing working code or documentation without explicit human approval from[4D[K
from Amr.
- This ensures that critical code remains intact and reduces the risk of ac[2D[K
accidental data loss.

**LAW 2 — NEVER RANDOM ARCHITECTURE**: No agent may introduce new architect[9D[K
architectural patterns not documented in 00-ARCHITECT/. All new patterns re[2D[K
require an ADR.
- Ensuring all architecture decisions are well-documented and reviewed help[4D[K
helps maintain consistency across the system.

**LAW 3 — TENANT ISOLATION IS SACRED**: Every database query, every API end[3D[K
endpoint, every ChromaDB collection access MUST be scoped to tenant_id. No [K
exceptions. Ever.
- Multi-tenant isolation is crucial for maintaining data security and preve[5D[K
preventing unauthorized access.

### 2. AI Agent Role Hierarchy

The document outlines a hierarchical structure of agents with specific role[4D[K
roles and responsibilities:
- **TIER 0 (Human)**: Amr, the owner, has final approval authority.
- **TIER 1 (Strategic)**: CEO and COO Agents focus on vision, strategy, and[3D[K
and product direction.
- **TIER 2 (Technical Leadership)**: CTO Agent makes technical decisions, w[1D[K
while Architect Agents handle system design.
- **TIER 3 (Architecture)**: Specialized roles for system design, domain-le[9D[K
domain-level design, backend, frontend, database management, security, QA, [K
testing, DevOps, and documentation.
- **TIER 4 (Domain Implementation)**: Each domain has its specialized agent[5D[K
agents for implementation.

### 3. Permission Matrix

The permission matrix ensures that each agent has the appropriate access le[2D[K
level based on their role:
- **READ**: Can view files to understand context.
- **REVIEW**: Can flag issues, must not auto-fix.
- **WRITE**: Can create/modify files.
- **APPROVE**: Can approve others' changes (for Tiers 2 and 3).
- **DEPLOY**: Can trigger deployments (DevOps Agent + human approval only).[6D[K
only).

### 4. Safety Rules

The document outlines a set of strict rules that no agent may ever break to[2D[K
to ensure the safety and integrity of the system:
- Absolute prohibitions include deleting files, removing tenant_id filters,[8D[K
filters, modifying authentication logic, changing applied migration files, [K
committing secrets, bypassing the ADR process, writing to specific director[8D[K
directories, accessing one tenant's data with another's context, pushing di[2D[K
directly to main branches, ignoring existing patterns, and inventing new on[2D[K
ones.

### 5. Coding Rules for This Repository

The coding rules specify how code should be structured and maintained:
- **Python FastAPI**: Every router endpoint must include the `tenant_id` pa[2D[K
parameter.
- **Next.js Portal**: All routes require authentication, use backend calls [K
through `portal/lib/api/`, adhere to the design system, and have appropriat[10D[K
appropriate state management.

### 6. Documentation Rules

Documentation is a critical part of maintaining the repository's integrity:[10D[K
integrity:
- Whenever any code change is made, relevant documentation must b[1D[K
be updated.
- Handoff documents must be used after each work session to track progress [K
and identify blockers.

### 7. Security Rules

The document outlines security rules that must be adhered to:
- **Multi-Tenant Isolation**: Every query, JWT token, ChromaDB collection, [K
file upload, and log entry must include the `tenant_id`.
- **Data Security**: Hotel guest PII must never be logged or returned beyon[5D[K
beyond what is necessary. API keys should only be in `.env` files, password[8D[K
passwords must be bcrypt hashed.

### 8. Review & Approval Rules

Review and approval rules ensure that all changes are reviewed and approved[8D[K
approved by the appropriate agents:
- New domain modules require no review.
- Architecture changes require CTO Agent + Architect Agent approval (and Am[2D[K
Amr final approval).
- Security changes require Security Agent + CTO Agent approval (and Amr fin[3D[K
final approval).
- Database migrations require no human approval if reversible.
- New ADRs require no review.
- Deployment to production requires DevOps Agent and Amr final approval.
- New AI features require AI Platform Agent + Security Agent and Amr final [K
approval.

### 9. Escalation Protocol

The escalation protocol outlines the process for addressing issues that can[3D[K
cannot be resolved by individual agents:
- Issues are logged in `AI_MEMORY/KNOWN_PROBLEMS.md`.
- The issue is escalated through a chain of command until it reaches Amr fo[2D[K
for final decision.
- Response time expectations are defined based on the severity of the issue[5D[K
issue.

### 10. Cross-References

The document includes cross-references to other important documents and res[3D[K
resources:
- AI Constitution: `10-AI/DELIVERY/FOUNDATION/AI-CONSTITUTION.md`
- Engineering Standards: `ENGINEERING-STANDARDS.md`
- Quality Gates: `QUALITY_GATES.md`
- Agent Specifications: `agents/` directory
- Repository Index: `REPOSITORY-INDEX.md`
- Project Memory: `AI_MEMORY/PROJECT_MEMORY.md`

This document serves as a comprehensive guide for all AI agents, ensuring t[1D[K
that they understand their roles and responsibilities while maintaining the[3D[K
the quality and security of the system.

