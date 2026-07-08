# Patterns

## Overview

This document catalogs reusable solutions to common problems encountered during AI-augmented delivery. Each pattern follows a structured format: name, context, problem, solution, consequences, and example.

Patterns are organized by domain and are referenced by agents during task execution and by humans during design and review.

---

## Pattern Format

```markdown
## Pattern Name

**Version**: 1.0.0
**Category**: <domain>
**Last Updated**: YYYY-MM-DD

### Context
When and why this pattern applies.

### Problem
The specific problem this pattern solves.

### Solution
Step-by-step description of the solution.

### Consequences
Benefits and trade-offs of applying this pattern.

### Example
Concrete example of the pattern in use.

### Related Patterns
- [Related Pattern 1](./Patterns.md#pattern-name)
```

---

## Architecture Patterns

### Agent-Contextualized Architecture

- **Version**: 1.0.0
- **Context**: Designing system architecture with AI agents that need to understand and navigate the codebase.
- **Problem**: Agents generate code that conflicts with existing architecture because they lack awareness of the full system design.
- **Solution**: Create a machine-readable architecture document (YAML/JSON) that agents can load as context. Include module boundaries, data flow, dependency direction, and interface contracts. Reference this document in every task prompt.
- **Consequences**: +Improved agent output consistency, +Reduced architecture violations, -Requires maintaining architecture document alongside code.
- **Example**: A `architecture.yaml` file with modules, their responsibilities, allowed dependencies, and data flow diagrams.

### Layered Context Injection

- **Version**: 1.0.0
- **Context**: Providing agents with sufficient context without exceeding token limits.
- **Problem**: Agents receive too much context (exceeding context window) or too little (producing poor output).
- **Solution**: Structure context in layers: Layer 1 (always loaded): task description, acceptance criteria, current file. Layer 2 (loaded on demand): related files, design docs. Layer 3 (retrieval): full codebase, reference materials.
- **Consequences**: +Optimal context utilization, +Reduced token waste, +Better agent focus, -Requires context management infrastructure.
- **Example**: Task prompt loads Layer 1 automatically; agent requests Layer 2 via tool call when needed.

---

## Database Patterns

### Schema-as-Code with Agent Validation

- **Version**: 1.0.0
- **Context**: Managing database schema changes in an agent-driven workflow.
- **Problem**: Agents propose schema changes that violate normalization rules, indexing strategy, or migration ordering.
- **Solution**: Define schema in declarative migration files. Agents propose changes, but a validation agent checks against rules (normalization, naming, migration order). Only validated schemas proceed to review.
- **Consequences**: +Consistent schema quality, +Migration order preserved, +Reduced human review effort, -Requires validation rules to be maintained.
- **Example**: Migration files with `up.sql`/`down.sql`; validation agent checks naming, column types, and index coverage.

### Contextual Query Generation

- **Version**: 1.0.0
- **Context**: Generating database queries that respect existing data patterns.
- **Problem**: Agents generate queries with wrong table names, column names, or join conditions because they lack schema context.
- **Solution**: Inject schema definition (tables, columns, relationships, indexes) into agent context before query generation. Use a schema metadata file generated from the database.
- **Consequences**: +Accurate queries, +Reduced debugging time, -Schema must be kept in sync with database.
- **Example**: `schema.yaml` generated from `pg_dump --schema-only` then converted to structured format for agent consumption.

---

## API Patterns

### Contract-First Agent Development

- **Version**: 1.0.0
- **Context**: Building APIs where multiple agents work on different endpoints.
- **Problem**: Agents produce inconsistent API contracts — mismatched request/response formats, inconsistent error handling, incompatible versioning.
- **Solution**: Define API contracts (OpenAPI/Swagger) before implementation begins. Agents generate code from contracts using code generation tools. Review ensures code matches contract.
- **Consequences**: +Consistent API surface, +Parallel agent work on endpoints, +Generated client SDK, -Requires upfront contract design.
- **Example**: OpenAPI 3.0 specification defined; agents use `openapi-generator` to produce server stubs and client libraries.

### Agent-Human API Review Gate

- **Version**: 1.0.0
- **Context**: Reviewing API changes for security, performance, and design quality.
- **Problem**: Agent-generated API code passes unit tests but contains security vulnerabilities or design issues.
- **Solution**: A review gate with automated checks (linting, security scanning, breaking change detection) followed by human review of contract changes. Breaking changes require ADL approval.
- **Consequences**: +Security vulnerabilities caught early, +Breaking changes controlled, +Slightly longer review cycle for API changes.
- **Example**: CI pipeline runs spectral linting on OpenAPI spec, checks for breaking changes, then routes to human reviewer.

---

## UI Patterns

### Component-First Generation

- **Version**: 1.0.0
- **Context**: Building user interfaces with AI agents.
- **Problem**: Agents generate inconsistent UI code — varying component patterns, styling approaches, and accessibility compliance.
- **Solution**: Define a component library with coded examples. Agents are instructed to use only approved components. New component proposals must go through a review process.
- **Consequences**: +Consistent UI, +Faster agent output, +Accessibility built in, -Component library must be maintained and documented.
- **Example**: A Storybook component library with documented props, states, and accessibility notes. Agents reference Storybook stories as examples.

### Agent-Tested Accessibility

- **Version**: 1.0.0
- **Context**: Ensuring UI components meet accessibility standards.
- **Problem**: Agents generate UI that fails WCAG compliance — missing alt text, poor contrast, incorrect ARIA attributes.
- **Solution**: Include accessibility requirements in every UI task. Run automated accessibility checks (axe-core, Lighthouse) in CI. A dedicated accessibility agent reviews UI output before human review.
- **Consequences**: +WCAG compliance by default, +Reduced accessibility debt, +Slower generation (accessibility checks in pipeline).
- **Example**: Task acceptance criteria includes "WCAG 2.1 AA compliance"; pipeline runs `jest-axe`; accessibility agent checks ARIA patterns.

---

## Testing Patterns

### Agent-Generated Test Suite

- **Version**: 1.0.0
- **Context**: Generating comprehensive tests for agent-written code.
- **Problem**: Agents write production code but create minimal tests, leaving coverage gaps.
- **Solution**: After code generation, a dedicated testing agent analyzes the code and generates unit, integration, and edge-case tests. The testing agent has access to coverage requirements and test patterns.
- **Consequences**: +Higher coverage, +Better edge case coverage, -Two agent passes required per task, -May generate redundant tests.
- **Example**: Coding agent writes `payment-service.ts`; testing agent writes `payment-service.test.ts` with unit tests, integration tests, and edge cases.

### Multi-Agent Review Cycle

- **Version**: 1.0.0
- **Context**: Reviewing agent output for correctness and quality.
- **Problem**: Single-agent reviews miss issues; human review is the bottleneck.
- **Solution**: Implement a two-stage review: Stage 1 — automated checks (linting, type checking, test execution). Stage 2 — peer agent review using review criteria checklist. If both pass, route to human for final approval.
- **Consequences**: +Faster review cycle, +Issues caught earlier, -Requires well-defined review criteria, -May miss subtle domain-specific issues.
- **Example**: Agent A writes code → CI runs checks → Agent B reviews against checklist → Human approves or sends back.

---

## Workflow Patterns

### Pipeline-Segmented Execution

- **Version**: 1.0.0
- **Context**: Organizing agent work across multiple stages in a delivery pipeline.
- **Problem**: Agents work independently without coordination, causing rework and integration issues.
- **Solution**: Segment work into pipeline stages (Requirements → Design → Implementation → Testing → Review → Deploy). Each stage has defined inputs, outputs, and handoff criteria. Agents pass artifacts between stages through a shared context.
- **Consequences**: +Clear stage ownership, +Traceable artifact flow, +Early error detection, -Stage gate can cause delays if handoff criteria are strict.
- **Example**: Design agent outputs design doc → stored in stage artifact → implementation agent reads design doc → generates code → testing agent reads code → generates tests.

### Agent Swarm with Orchestrator

- **Version**: 1.0.0
- **Context**: Coordinating multiple agents working on interdependent tasks.
- **Problem**: Agents conflict on shared resources, duplicate work, or create inconsistent decisions.
- **Solution**: An orchestrator agent manages task assignment, resource access, and conflict resolution. Orchestrator maintains the shared state, dispatches tasks, and resolves conflicts using predefined rules.
- **Consequences**: +Coordinated multi-agent work, +Reduced conflicts, +Single point of coordination, -Orchestrator becomes a bottleneck and single point of failure.
- **Example**: Orchestrator agent reads sprint backlog, assigns tasks to specialized agents, tracks completion, resolves conflicts when two agents need the same file.

---

## Pattern Index

| # | Pattern Name | Category | Version |
|---|-------------|----------|---------|
| 1 | Agent-Contextualized Architecture | Architecture | 1.0.0 |
| 2 | Layered Context Injection | Architecture | 1.0.0 |
| 3 | Schema-as-Code with Agent Validation | Database | 1.0.0 |
| 4 | Contextual Query Generation | Database | 1.0.0 |
| 5 | Contract-First Agent Development | API | 1.0.0 |
| 6 | Agent-Human API Review Gate | API | 1.0.0 |
| 7 | Component-First Generation | UI | 1.0.0 |
| 8 | Agent-Tested Accessibility | UI | 1.0.0 |
| 9 | Agent-Generated Test Suite | Testing | 1.0.0 |
| 10 | Multi-Agent Review Cycle | Testing | 1.0.0 |
| 11 | Pipeline-Segmented Execution | Workflow | 1.0.0 |
| 12 | Agent Swarm with Orchestrator | Workflow | 1.0.0 |
