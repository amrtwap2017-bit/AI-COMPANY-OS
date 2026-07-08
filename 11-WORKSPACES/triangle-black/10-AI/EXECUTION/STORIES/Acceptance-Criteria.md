# Acceptance Criteria Standards

## Overview

Acceptance criteria (AC) are the conditions that a user story must satisfy to be accepted by the product owner. Well-written AC provides unambiguous pass/fail conditions, enabling objective verification of completeness. AC forms the foundation for test case design, automated testing, and release qualification.

## How to Write Testable Acceptance Criteria

Each acceptance criterion must follow the format:

```
[Condition / Action] → [Expected Result]
```

The condition describes the trigger or state being tested. The expected result describes the observable outcome that demonstrates compliance.

### Examples

| # | Condition                                       | Expected Result                              | Priority |
|---|------------------------------------------------|----------------------------------------------|----------|
| 1 | Admin creates a new role with valid name       | Role is created and visible in role catalog  | Must     |
| 2 | Admin creates a role with duplicate name       | Error "Role name already exists" returned    | Must     |
| 3 | Admin assigns 50 permissions to a role         | All 50 permissions are saved                 | Must     |
| 4 | Admin assigns 51 permissions to a role         | Error "Maximum 50 permissions" returned      | Must     |
| 5 | Role assignment persists after system restart  | All role assignments remain intact           | Should   |

### AC Format Rules

1. **Use the arrow notation**: `[Condition] → [Expected Result]`.
2. **One criterion per row** — do not combine multiple conditions.
3. **Be specific** — use concrete values, limits, and thresholds.
4. **Avoid negation** where possible — state positive outcomes.
5. **Include error cases** — every user action should have a corresponding error criterion.
6. **Prioritize criteria** — use Must, Should, Could labels.

## AC Review Process

| Step | Activity                                         | Owner              |
|------|--------------------------------------------------|--------------------|
| 1    | Author writes acceptance criteria                | Story Author       |
| 2    | Engineering review: criteria are implementable    | Engineering Lead   |
| 3    | QA review: criteria are testable and complete     | QA Lead            |
| 4    | Product owner review: criteria match requirements | Product Owner      |
| 5    | Final approval and sign-off                      | Product Owner      |
| 6    | Criteria lock — no changes without re-review     | All                |

### Review Gate Criteria

A criterion passes review only if:
- It describes a single, specific condition.
- The expected result is measurable or observable.
- A test can be written to verify it.
- It does not conflict with other criteria.
- It uses concrete values rather than subjective language.

## Common Mistakes

### 1. Vague Language

| ❌ Bad                                          | ✅ Good                                       |
|------------------------------------------------|----------------------------------------------|
| "The system should be fast"                    | "API response time is under 200ms for 95th percentile" |
| "The UI should look good"                      | "All elements render within 1024x768 viewport without horizontal scroll" |
| "The report should be accurate"                | "Report totals match source data with 0% discrepancy" |

### 2. Untestable Conditions

| ❌ Bad                                          | ✅ Good                                       |
|------------------------------------------------|----------------------------------------------|
| "User experience is improved"                  | "Page load time decreases by 40% compared to baseline" |
| "The code is maintainable"                     | "Cyclomatic complexity per function does not exceed 10" |
| "The system is secure"                         | "All endpoints enforce RBAC authentication" |

### 3. Missing Edge Cases

| ❌ Bad                                          | ✅ Good                                       |
|------------------------------------------------|----------------------------------------------|
| "Admin can delete a user"                      | "Admin can delete a user without active sessions" |
|                                                  | "404 returned when deleting a nonexistent user" |
|                                                  | "409 returned when user owns active resources" |

### 4. Multiple Conditions Combined

| ❌ Bad                                          | ✅ Good                                       |
|------------------------------------------------|----------------------------------------------|
| "User can login and see dashboard and notifications" | "User logs in with valid credentials → navigated to dashboard" |
|                                                  | "Dashboard displays active notifications for logged-in user" |

### 5. Implementation-Specific Language

| ❌ Bad                                          | ✅ Good                                       |
|------------------------------------------------|----------------------------------------------|
| "The POST endpoint returns 201"                | "Creating a new resource returns success confirmation with resource ID" |
| "The SQL query joins three tables"             | "Related data is displayed correctly in the consolidated view" |

## Acceptance Criteria Completeness Matrix

To ensure comprehensive coverage, consider writing AC for each category:

| Category        | Purpose                                        | Example                                       |
|-----------------|------------------------------------------------|-----------------------------------------------|
| Standard Flow   | Primary success path                           | "Valid data submitted → resource created"     |
| Error Handling  | Invalid inputs, system failures                | "Invalid data submitted → error with details" |
| Edge Cases      | Boundary conditions, empty states              | "Zero results returned → empty state message" |
| Permissions     | Authorization enforcement                      | "Unauthenticated request → 401 response"      |
| Data Integrity  | Validation, constraints, rollback              | "Duplicate entry → 409 with conflict notice"  |
| Performance     | Response time, throughput, resource limits     | "Response under 500ms at 100 concurrent requests" |
