# Anti-Patterns

## Overview

This document catalogues common anti-patterns observed in AI-augmented delivery. Each entry documents the symptom, the underlying problem, and the recommended solution. The goal is to recognize and avoid these patterns proactively.

Anti-patterns are organized into the same categories as patterns for cross-reference.

---

## Anti-Pattern Format

```markdown
## Anti-Pattern Name

**Version**: 1.0.0
**Category**: <domain>
**Severity**: high | medium | low
**Last Updated**: YYYY-MM-DD

### Context
When this anti-pattern typically appears.

### Symptom
Observable signs that this anti-pattern is present.

### Problem
Why this approach is harmful — root cause and impact.

### Solution
How to recognize and correct this anti-pattern.

### Example
Concrete example of the anti-pattern (avoid this).

### Related Anti-Patterns
- [Related Anti-Pattern](./Anti-Patterns.md#anti-pattern-name)

### Related Patterns
- [Related Pattern](./Patterns.md#pattern-name)
```

---

## Architecture Anti-Patterns

### Context Dump

- **Version**: 1.0.0
- **Category**: Architecture
- **Severity**: High

**Context**: Providing context to agents at the start of a sprint or task.

**Symptom**: Agents produce irrelevant or low-quality output despite having access to extensive documentation. Token usage is excessively high.

**Problem**: Dumping all available context on an agent overwhelms its context window. The agent cannot distinguish between relevant and irrelevant information, leading to hallucinations, missed requirements, or incoherent output.

**Solution**: Use Layered Context Injection pattern. Load only task-relevant context. Structure context hierarchically: core context (always injected), supporting context (available on request), reference context (retrieved via search).

**Example**: Loading 50 pages of architectural documentation into a single agent prompt. Instead, inject only the relevant module description and allow the agent to request additional context.

**Related Pattern**: [Layered Context Injection](./Patterns.md#layered-context-injection)

### Agent Islands

- **Version**: 1.0.0
- **Category**: Architecture
- **Severity**: High

**Context**: Multiple agents working independently on different parts of a system.

**Symptom**: Agents produce code that does not integrate. Duplicate implementations of shared logic. Inconsistent naming, patterns, and conventions across modules.

**Problem**: Agents operate in isolation without shared context or coordination. Each agent makes independent design decisions without awareness of other agents' work.

**Solution**: Implement the Agent Swarm with Orchestrator pattern. An orchestrator agent maintains the shared architecture context, assigns tasks, and resolves conflicts. Regular synchronization points ensure agents remain aligned.

**Example**: Agent A implements `UserService.CreateUser` while Agent B implements `UserService.NewUser` with similar logic. Coordination would have consolidated these.

**Related Pattern**: [Agent Swarm with Orchestrator](./Patterns.md#agent-swarm-with-orchestrator)

---

## Database Anti-Patterns

### Schema Drift

- **Version**: 1.0.0
- **Category**: Database
- **Severity**: High

**Context**: Multiple agents creating database migrations or schema changes.

**Symptom**: Migration conflicts, missing columns, incorrect foreign keys, inconsistent naming. Schema in code differs from schema in database.

**Problem**: Agents create migrations without centralized coordination. Migration ordering is not managed. Schema changes are applied without understanding the full data model.

**Solution**: Use Schema-as-Code with Agent Validation pattern. Generate schema definitions from a single source of truth. Use a validation agent to check all migrations before acceptance. Maintain a migration ordering document.

**Example**: Agent A creates migration `add_user_roles` and Agent B creates `add_role_permissions` independently, but B's migration depends on A's table. Without ordering, both migrations fail.

**Related Pattern**: [Schema-as-Code with Agent Validation](./Patterns.md#schema-as-code-with-agent-validation)

### Query Without Context

- **Version**: 1.0.0
- **Category**: Database
- **Severity**: Medium

**Context**: Agents generating database queries for new features.

**Symptom**: Queries reference non-existent tables or columns. JOIN conditions are incorrect. Query performance is poor.

**Problem**: Agent generates queries based on assumptions rather than actual schema knowledge. Without schema context, the agent guesses table and column names.

**Solution**: Inject the relevant schema subset into agent context before query generation. Use the Contextual Query Generation pattern. Consider a read-only query validator agent that tests queries against a staging database.

**Example**: Agent generates `SELECT * FROM users WHERE user_id = ?` but the actual column is `id`. Schema injection would prevent this.

**Related Pattern**: [Contextual Query Generation](./Patterns.md#contextual-query-generation)

---

## API Anti-Patterns

### Contract Proliferation

- **Version**: 1.0.0
- **Category**: API
- **Severity**: High

**Context**: Multiple agents creating or modifying API endpoints.

**Symptom**: Inconsistent endpoint naming, non-standard error responses, different authentication approaches, versioning mismatches. API surface grows without design coherence.

**Problem**: Agents independently design API contracts without a shared standard or review process. Each agent optimizes for its task rather than the overall API design.

**Solution**: Use Contract-First Agent Development pattern. Define all contracts in a shared specification before implementation. A design agent reviews all contract changes for consistency. Implement the Agent-Human API Review Gate for breaking changes.

**Example**: One agent creates `GET /api/users/:id`, another creates `POST /api/v2/users/create`. Different versioning schemes in the same API.

**Related Pattern**: [Contract-First Agent Development](./Patterns.md#contract-first-agent-development)

### Security Blind Spot

- **Version**: 1.0.0
- **Category**: API
- **Severity**: Critical

**Context**: Agents generating API endpoints without explicit security requirements.

**Symptom**: Missing authentication checks, exposed internal endpoints, SQL injection vulnerabilities, insufficient input validation.

**Problem**: Agents focus on functional requirements and do not proactively implement security measures. Security is treated as a separate concern rather than embedded in the generation process.

**Solution**: Include security requirements in every API task prompt. Use automated security scanning (SAST) in the CI pipeline. Implement a dedicated security agent that reviews all endpoint implementations.

**Example**: Agent creates an admin endpoint without authentication because the task did not explicitly require it. Task prompts must always include security requirements.

**Related Anti-Pattern**: [Requirements Gap](./Anti-Patterns.md#requirements-gap)

---

## UI Anti-Patterns

### Styling Soup

- **Version**: 1.0.0
- **Category**: UI
- **Severity**: Medium

**Context**: Agents generating UI components without style guidance.

**Symptom**: Inconsistent spacing, colors, typography, and layout. Mixing CSS approaches (inline styles, CSS modules, utility classes). Visual design does not match the design system.

**Problem**: Each agent uses its own styling approach. Without a defined component library or design tokens, agents make independent styling decisions.

**Solution**: Use Component-First Generation pattern. Provide agents with the component library, design tokens, and example implementations. A linting agent checks style compliance. New component proposals must use design tokens.

**Example**: Agent creates a button with inline `style={{background: '#007bff'}}` when the design system already defines `className="btn btn-primary"`.

**Related Pattern**: [Component-First Generation](./Patterns.md#component-first-generation)

### Accessibility Afterthought

- **Version**: 1.0.0
- **Category**: UI
- **Severity**: High

**Context**: Agents generating UI without accessibility requirements.

**Symptom**: Missing alt text, incorrect heading hierarchy, non-focusable interactive elements, missing ARIA labels, color contrast failures.

**Problem**: Accessibility is treated as a separate task rather than embedded in UI generation. Agents generate visually correct but inaccessible components.

**Solution**: Include WCAG requirements in every UI task acceptance criteria. Use the Agent-Tested Accessibility pattern. Run automated accessibility checks in CI.

**Example**: Agent creates a data table with no `scope` attributes on headers, no `aria-label` on sort buttons, and focus management for modals. All of these should be included by default.

**Related Pattern**: [Agent-Tested Accessibility](./Patterns.md#agent-tested-accessibility)

---

## Testing Anti-Patterns

### Happy Path Only

- **Version**: 1.0.0
- **Category**: Testing
- **Severity**: High

**Context**: Agents writing tests for code they just generated.

**Symptom**: Tests cover only the expected success path. Error states, edge cases, null inputs, and boundary conditions are untested. Coverage is high but effectiveness is low.

**Problem**: Agents tend to test what the code does rather than what it should prevent. Testing agents need explicit guidance to cover negative cases.

**Solution**: Use a dedicated testing agent with a checklist of test categories: success path, error handling, edge cases, boundary values, performance, and security. Require mutation testing to validate test effectiveness.

**Example**: A function `divide(a, b)` is tested with `divide(10, 2)` → 5, but not tested with `b = 0`, or non-numeric inputs.

**Related Pattern**: [Agent-Generated Test Suite](./Patterns.md#agent-generated-test-suite)

### Review Bottleneck

- **Version**: 1.0.0
- **Category**: Testing
- **Severity**: Medium

**Context**: All agent output must be reviewed by humans before merging.

**Symptom**: Human reviewers are overwhelmed. Review queue grows. Merge times increase. Quality suffers as reviewers rush through the backlog.

**Problem**: Every piece of agent output requires human review, but human capacity is fixed. As agent throughput increases, the review bottleneck worsens.

**Solution**: Implement a tiered review system: automated checks for all output, agent peer review for medium-risk items, human review only for high-risk or complex items. Risk classification should be automated.

**Example**: A team of 2 humans reviews output from 5 agents. Each agent produces 3 items per day = 15 reviews per day. Human capacity is 10 reviews per day. Queue grows indefinitely.

**Related Pattern**: [Multi-Agent Review Cycle](./Patterns.md#multi-agent-review-cycle)

---

## Workflow Anti-Patterns

### Chaos Swarm

- **Version**: 1.0.0
- **Category**: Workflow
- **Severity**: Critical

**Context**: Multiple agents working on the same codebase without coordination.

**Symptom**: Frequent merge conflicts, duplicate work, inconsistent decisions, agents overwriting each other's changes. Team spends more time resolving conflicts than creating value.

**Problem**: No centralized coordination mechanism. Agents are dispatched to work without a shared understanding of who is doing what. The system defaults to last-write-wins.

**Solution**: Implement Pipeline-Segmented Execution and Agent Swarm with Orchestrator patterns. The orchestrator maintains the task assignment log, coordinates file access, and manages handoffs.

**Example**: Agent A and Agent B both modify `config.ts` at the same time. Agent A's changes are overwritten by Agent B. The orchestrator would have sequenced these changes or assigned ownership.

**Related Pattern**: [Pipeline-Segmented Execution](./Patterns.md#pipeline-segmented-execution), [Agent Swarm with Orchestrator](./Patterns.md#agent-swarm-with-orchestrator)

### Requirements Gap

- **Version**: 1.0.0
- **Category**: Workflow
- **Severity**: High

**Context**: Assigning tasks to agents without sufficient requirements.

**Symptom**: Agent output does not meet expectations. Multiple rework cycles. Agent produces creative but incorrect solutions. Acceptance criteria are missed.

**Problem**: Requirements are ambiguous or incomplete. Agents fill gaps with assumptions, and those assumptions are often wrong. Agents do not proactively seek clarification like humans would.

**Solution**: Apply the Definition of Ready checklist rigorously. Require clear acceptance criteria for every task. Include examples (good and bad). Configure agents to flag ambiguities rather than assume.

**Example**: Task: "Add a search feature to the users page." Agent implements client-side search for 10 users when the requirement was server-side search for 1M users. Acceptance criteria would have clarified this.

**Related Anti-Pattern**: [Agent Islands](./Anti-Patterns.md#agent-islands)

---

## Anti-Pattern Index

| # | Anti-Pattern Name | Category | Severity |
|---|-------------------|----------|----------|
| 1 | Context Dump | Architecture | High |
| 2 | Agent Islands | Architecture | High |
| 3 | Schema Drift | Database | High |
| 4 | Query Without Context | Database | Medium |
| 5 | Contract Proliferation | API | High |
| 6 | Security Blind Spot | API | Critical |
| 7 | Styling Soup | UI | Medium |
| 8 | Accessibility Afterthought | UI | High |
| 9 | Happy Path Only | Testing | High |
| 10 | Review Bottleneck | Testing | Medium |
| 11 | Chaos Swarm | Workflow | Critical |
| 12 | Requirements Gap | Workflow | High |
