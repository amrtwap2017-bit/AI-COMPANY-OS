# BDD Scenario Standards

## Overview

Behavior-Driven Development (BDD) scenarios provide executable specifications that bridge communication between product owners, engineers, and QA. Scenarios are written in the Given/When/Then format and serve as both documentation and test specifications.

## Standard Format

```
Given [precondition / context]
  And [additional precondition]
When [action / trigger]
  And [additional action]
Then [expected outcome]
  And [additional outcome]
```

### Structural Rules

- **Given** establishes the initial state and context. All preconditions necessary for the scenario to execute.
- **When** describes the triggering action performed by the actor.
- **Then** specifies the observable outcomes and post-conditions.
- **And** extends any of the three sections with additional conditions or assertions.
- Each step should describe a single logical condition or action.
- Avoid compound steps (e.g., "When user logs in and navigates to settings" should be two steps).

## Scenario Templates

### 1. Standard Flow Template

```
Given [actor] is authenticated and authorized
  And [initial system state exists]
When [actor performs the primary action]
Then [expected system response occurs]
  And [the data or state is updated correctly]
```

**Example:**
```
Given an authenticated Platform Administrator
  And an agent "A-107" is registered in the system
When the administrator assigns the "Auditor" role to agent "A-107"
Then the agent's role is updated to "Auditor"
  And an audit log entry is created
```

### 2. Error Flow Template

```
Given [actor] attempts [action]
  And [error condition is present]
When [action is executed]
Then [error response is returned]
  And [system state remains unchanged]
  And [error is logged]
```

**Example:**
```
Given a system with 0 available compute nodes
When a user submits a pipeline execution request
Then the response returns HTTP 503 Service Unavailable
  And an error message "No compute resources available" is displayed
  And the pipeline remains in "pending" state
```

### 3. Edge Case Template

```
Given [boundary condition or unusual state]
When [action is performed]
Then [system handles the boundary gracefully]
```

**Example:**
```
Given a payload of exactly 10 MB (the maximum allowed size)
When the agent submits the payload for processing
Then the payload is accepted
  And processing begins within 2 seconds
```

### 4. Permission Check Template

```
Given [actor] has insufficient permissions
  And [resource] exists
When [actor attempts privileged action on resource]
Then [access is denied]
  And [audit log records the unauthorized attempt]
```

**Example:**
```
Given a user with "Viewer" role
  And a pipeline "Prod-Deploy" exists
When the user attempts to modify the pipeline configuration
Then the response returns HTTP 403 Forbidden
  And an audit log entry "Unauthorized modify attempt" is recorded
```

### 5. Data Validation Template

```
Given [actor] submits [data] to [endpoint]
  And the data violates [validation rule]
When [submission is processed]
Then [validation error is returned]
  And [data is not persisted]
  And [specific field-level error is provided]
```

**Example:**
```
Given an administrator submits a role creation request
  And the role name contains special characters "Admin!@#"
When the request is processed
Then a validation error "Role name must contain only alphanumeric characters" is returned
  And the role "Admin!@#" is not created
  And the role catalog remains unchanged
```

## Scenario Writing Guidelines

- Each scenario must describe exactly one behavior path.
- Use concrete data values rather than generic placeholders (e.g., "Administrator" not "User", "agent A-107" not "an agent").
- Avoid technical implementation details — describe behavior from the user's perspective.
- Keep scenarios concise: 5–10 steps maximum per scenario.
- Write scenarios before implementation begins (BDD-style, specification-first).
- A story should have at minimum one standard flow scenario. Complex stories should add error, edge case, and permission scenarios as appropriate.

## Scenario Review Process

| Step | Activity                                          | Owner              |
|------|---------------------------------------------------|--------------------|
| 1    | Author writes scenarios alongside the story       | Story Author       |
| 2    | Peer review: scenarios are complete and unambiguous | Team Member        |
| 3    | Product owner validates: scenarios match expected behavior | Product Owner      |
| 4    | QA review: scenarios are testable and automatable  | QA Lead            |
| 5    | Approved scenarios are added to the story record   | Story Author       |
| 6    | Scenarios are translated into automated tests      | Engineering / QA   |

## Scenario Quality Checklist

- [ ] Follows Given/When/And/Then structure.
- [ ] Uses concrete, specific data values.
- [ ] Describes a single behavior path.
- [ ] Avoids implementation details.
- [ ] All preconditions are stated in Given.
- [ ] Trigger action is stated in When.
- [ ] Assertions are stated in Then.
- [ ] No step combines multiple conditions.
- [ ] Scenario is independently executable (no hidden dependencies).
- [ ] Expected outcomes are objectively verifiable.
