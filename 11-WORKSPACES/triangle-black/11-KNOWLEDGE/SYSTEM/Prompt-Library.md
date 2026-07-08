# Prompt Library

## Overview

The Prompt Library is the centralized index of all prompt templates used within the EADF. Prompts are organized by agent role and task type, with versioning, usage notes, and best practices. This library ensures consistency, reusability, and continuous improvement of prompt effectiveness.

---

## Organization

Prompts are organized by:

1. **Agent Role**: The agent role that uses the prompt
2. **Task Type**: The type of task the prompt addresses
3. **Pipeline Stage**: Where in the delivery pipeline the prompt applies

---

## Prompt Index

### Agent Role: Architect Agent

| # | Prompt Name | Task Type | Stage | Version |
|---|-------------|-----------|-------|---------|
| ARC-001 | Architecture Design Generation | Design | Design | 1.1.0 |
| ARC-002 | Architecture Review Checklist | Review | Review | 1.0.0 |
| ARC-003 | Tech Stack Recommendation | Decision | Planning | 1.0.0 |

### Agent Role: Developer Agent

| # | Prompt Name | Task Type | Stage | Version |
|---|-------------|-----------|-------|---------|
| DEV-001 | Feature Implementation | Implementation | Execution | 2.0.0 |
| DEV-002 | Bug Fix | Fix | Execution | 1.2.0 |
| DEV-003 | Code Refactoring | Improvement | Execution | 1.1.0 |
| DEV-004 | Unit Test Generation | Testing | Execution | 1.3.0 |
| DEV-005 | Integration Test Generation | Testing | Execution | 1.0.0 |
| DEV-006 | API Endpoint Implementation | Implementation | Execution | 1.2.0 |
| DEV-007 | Database Migration Script | Implementation | Execution | 1.0.0 |

### Agent Role: Reviewer Agent

| # | Prompt Name | Task Type | Stage | Version |
|---|-------------|-----------|-------|---------|
| REV-001 | Code Review Checklist | Review | Review | 1.1.0 |
| REV-002 | Design Doc Review | Review | Review | 1.0.0 |
| REV-003 | Security Review | Review | Review | 1.2.0 |
| REV-004 | Performance Review | Review | Review | 1.0.0 |

### Agent Role: QA Agent

| # | Prompt Name | Task Type | Stage | Version |
|---|-------------|-----------|-------|---------|
| QA-001 | Test Plan Generation | Testing | Planning | 1.1.0 |
| QA-002 | Test Case Generation | Testing | Execution | 1.3.0 |
| QA-003 | Test Execution Report | Testing | Review | 1.0.0 |
| QA-004 | Regression Test Selection | Testing | Execution | 1.0.0 |

### Agent Role: Documentation Agent

| # | Prompt Name | Task Type | Stage | Version |
|---|-------------|-----------|-------|---------|
| DOC-001 | API Documentation Generation | Documentation | Execution | 1.1.0 |
| DOC-002 | README Generation | Documentation | Execution | 1.0.0 |
| DOC-003 | Release Notes Generation | Documentation | Review | 1.0.0 |
| DOC-004 | Architecture Documentation | Documentation | Execution | 1.0.0 |

### Agent Role: Analyst Agent

| # | Prompt Name | Task Type | Stage | Version |
|---|-------------|-----------|-------|---------|
| ANL-001 | Requirements Analysis | Analysis | Planning | 1.1.0 |
| ANL-002 | Impact Assessment | Analysis | Planning | 1.0.0 |
| ANL-003 | Dependency Analysis | Analysis | Planning | 1.0.0 |
| ANL-004 | Technical Debt Assessment | Analysis | Review | 1.0.0 |

### Agent Role: Orchestrator Agent

| # | Prompt Name | Task Type | Stage | Version |
|---|-------------|-----------|-------|---------|
| ORC-001 | Task Decomposition | Planning | Planning | 1.2.0 |
| ORC-002 | Agent Assignment | Planning | Planning | 1.0.0 |
| ORC-003 | Progress Summary | Reporting | Execution | 1.0.0 |
| ORC-004 | Blocker Triage | Coordination | Execution | 1.0.0 |

---

## Prompt Template Format

Each prompt template in the library follows this structure:

```markdown
---
id: <ROLE-NNN>
name: <Prompt Name>
version: <semver>
author: @name
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: active | deprecated | archived
agent-role: <Agent Role>
task-type: <Task Type>
pipeline-stage: <Stage>
tags: [tag1, tag2]
model-requirements: <optional model requirements>
---

# <Prompt Name>

## Context

<Background information, system instructions, role definition>

## Objective

<Clear statement of what this prompt should accomplish>

## Inputs

- <Input artifact 1>
- <Input artifact 2>

## Task Instructions

<Step-by-step instructions for the agent>

## Output Format

<Expected output structure, format, and schema>

## Constraints

- <Constraint 1>
- <Constraint 2>

## Examples

<Optional few-shot examples>

## Quality Criteria

- [ ] <Criterion 1>
- [ ] <Criterion 2>

## Related Prompts

- <Linked prompt ID>
```

---

## Usage Best Practices

### Selection

- Choose the prompt matching the agent role and task type
- Use the most recent version of the prompt
- Verify the prompt's model requirements match the target agent's model
- Review the prompt's constraints before execution

### Customization

- Do not modify prompt templates directly; create task-specific overrides
- Overrides are documented in the task's context section
- Successful overrides should be proposed for inclusion in the next prompt version

### Execution

- Inject the prompt at the beginning of the agent's context
- Ensure all required input artifacts are available before invoking
- Monitor token usage for prompt overhead
- Capture agent output for quality evaluation

### Evaluation

- After each sprint, review prompt effectiveness with QS
- Track: completion rate, rework rate, quality score
- Propose improvements based on analysis
- Update prompt version with approved changes

---

## Version History

| Prompt ID | Version | Date | Change | Author |
|-----------|---------|------|--------|--------|
| DEV-001 | 2.0.0 | 2026-06-15 | Restructured for layered context pattern | TAL |
| DEV-001 | 1.1.0 | 2026-04-20 | Added quality criteria checklist | QS |
| DEV-001 | 1.0.0 | 2026-03-01 | Initial version | ADL |
| QA-002 | 1.3.0 | 2026-06-10 | Added edge case coverage requirement | QS |
| QA-002 | 1.2.0 | 2026-05-15 | Reduced few-shot examples for token efficiency | TAL |

---

## Deprecation Policy

| Status | Definition | Action |
|--------|------------|--------|
| Active | Current recommended version | Used for all new tasks |
| Deprecated | Superseded but still functional | Do not use for new tasks; migrate existing |
| Archived | No longer supported | Removed from active library; stored in archive |

---

## Prompt Performance Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Completion rate | % of tasks completed without rework | ≥ 85% |
| Average quality score | Human-rated output quality (1–5) | ≥ 4.0 |
| Token efficiency | Tokens used per unit of output | Decreasing trend |
| Version adoption | % of tasks using latest version | ≥ 90% |

---

## Adding or Updating Prompts

1. Draft the prompt using the template format above
2. Assign the next available ID (or increment version for updates)
3. Submit to TAL for review
4. Test with sample tasks in a sandbox environment
5. Validate quality criteria are measurable
6. Announce version change to the team
7. Update this index with the new entry
