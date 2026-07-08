# Test Specification

## Test ID
`[TC-XXX]`

## Test Type
`[Unit / Integration / End-to-End (E2E) / Performance / Security / Smoke / Regression]`

## Feature / Component Under Test
`[Feature name or component path]`

## Scenario
[Describe the specific scenario or user journey being tested. What business behavior is being verified?]

## Preconditions
1. [System state required before test execution — database state, authentication, etc.]
2. [Environment setup — mock data, test fixtures, environment variables]
3. [Test data must exist: specific records, configurations, etc.]

## Test Steps
| Step | Action | Input | Expected Intermediate State |
|---|---|---|---|
| 1 | [Action performed] | `[Input data]` | [What should happen] |
| 2 | [Action performed] | `[Input data]` | [What should happen] |
| 3 | [Action performed] | `[Input data]` | [What should happen] |

## Expected Results
- [ ] Final state matches expected outcome
- [ ] No unexpected errors or exceptions
- [ ] Side effects (notifications, audit logs, events) are correct

## Assertions
```[language]
// Example assertion pseudocode
assert(result.status === 200);
assert(result.data.id !== null);
assert(result.data.name === "[expected_name]");
```

## Test Data
| Data Element | Value | Purpose |
|---|---|---|
| `[field_name]` | `[value]` | [Why this value is used] |
| `[field_name]` | `[value]` | [Why this value is used] |

## Edge Cases Covered
| Edge Case | How Tested |
|---|---|
| [Empty input] | [Test description] |
| [Boundary value] | [Test description] |
| [Invalid data] | [Test description] |
| [Concurrent access] | [Test description] |

## Traceability
| Artifact | ID |
|---|---|
| **User Story / Requirement** | `[US-XXX / REQ-XXX]` |
| **Defect Linked** | `[BUG-XXX]` (if applicable) |
| **Automation Script** | `[path/to/test/file.spec.ts]` |

## Execution Details
| Aspect | Value |
|---|---|
| **Environment** | `[Local / CI / Staging]` |
| **Browser / Runtime** | `[Chrome 120 / Node 20 / Python 3.12]` |
| **Data Freshness** | `[Fresh fixtures per run / Shared dataset]` |
| **Parallel Execution** | `[Yes / No]` |
| **Timeout** | `[30 seconds]` |

## Approval
| Reviewer | Date | Result |
|---|---|---|
| `[Name]` | `[YYYY-MM-DD]` | `[Approved / Rejected / Needs Revision]` |
