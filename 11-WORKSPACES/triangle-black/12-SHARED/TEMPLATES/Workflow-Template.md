# Workflow Specification

## Workflow ID
`[WF-XXX]`

## Workflow Name
[Descriptive name of the workflow]

## Business Process
[Name of the business process this workflow automates or supports]

## Trigger
| Trigger Type | Description | Source |
|---|---|---|
| `[Event / Scheduled / Manual / Webhook]` | [What initiates the workflow] | `[System / User / External system]` |
| **Preconditions** | [Conditions that must be true before the workflow can start] | — |

## Steps

### Step 1: [Step Name]
| Field | Value |
|---|---|
| **Action** | `[API call / Database write / Notification / User task / Decision]` |
| **Actor** | `[System / Role name / External system]` |
| **Input** | `[Data required to execute this step]` |
| **Output** | `[Data produced by this step]` |
| **Timeout** | `[Duration before timeout handling kicks in]` |
| **Retry Policy** | `[Max retries: X, Backoff: exponential/linear, Retry on: specific errors]` |

### Step 2: [Step Name]
| Field | Value |
|---|---|
| **Action** | `[API call / Database write / Notification / User task / Decision]` |
| **Actor** | `[System / Role name / External system]` |
| **Input** | `[Data required to execute this step]` |
| **Output** | `[Data produced by this step]` |
| **Timeout** | `[Duration before timeout handling kicks in]` |
| **Retry Policy** | `[Max retries: X, Backoff: exponential/linear, Retry on: specific errors]` |

## Decision Points

### Decision 1: [Decision Name]
| Field | Value |
|---|---|
| **Condition** | `[Logical expression evaluated at this point]` |
| **Path A (True)** | → `[Step X]` |
| **Path B (False)** | → `[Step Y]` |
| **Evaluation By** | `[System / Human / External service]` |

### Decision 2: [Decision Name]
| Field | Value |
|---|---|
| **Condition** | `[Logical expression evaluated at this point]` |
| **Path A (True)** | → `[Step X]` |
| **Path B (False)** | → `[Step Y]` |
| **Evaluation By** | `[System / Human / External service]` |

## Roles Involved
| Role | Step(s) | Responsibility |
|---|---|---|
| `[Role name]` | `[Step 1, Step 3]` | `[What this role does in the workflow]` |
| `[Role name]` | `[Step 2]` | `[What this role does in the workflow]` |

## Service Level Agreement (SLA)
| Metric | Target | Measurement Method | Escalation |
|---|---|---|---|
| **End-to-end duration** | `[X] minutes/hours` | `[Workflow engine timestamps]` | After `[Y]%` threshold breached |
| **Step [X] completion** | Within `[N] minutes` | `[Start-to-finish of step]` | Notify `[role]` |
| **Human task response** | Within `[N] hours` | `[Task assignment to completion]` | Notify `[escalation role]` |

## Failure Handling
| Failure Mode | Detection | Recovery Action | Notification |
|---|---|---|---|
| `[Step X] API timeout` | `[Timeout exception in workflow engine]` | `[Retry up to 3 times; if still failing, route to manual intervention queue]` | `[Email to support team]` |
| `[Step Y] Validation failure` | `[Error response from validation service]` | `[Halt workflow; send rejection notification to initiator]` | `[In-app notification + email]` |
| `[External system unavailable]` | `[Connection refused / 503]` | `[Retry with exponential backoff; circuit break after X failures]` | `[PagerDuty alert to on-call engineer]` |

## Monitoring & Observability
| Aspect | Tool / Method | Key Metrics |
|---|---|---|
| **Workflow engine logs** | `[ELK / CloudWatch / Datadog]` | `[Success rate, latency per step]` |
| **Business metrics** | `[Custom dashboard]` | `[Throughput, abandonment rate, avg completion time]` |
| **Alerts** | `[Alerting tool]` | `[P90 SLA breach, error rate > 5%]` |

## Workflow Diagram (Textual)
```
[Trigger] → Step 1 → Decision 1 ─True→ Step 2 → Step 3 → [End]
                             └False→ Step 4 → Step 5 → [End]
```

## Related Artifacts
| Artifact | ID / Path |
|---|---|
| **User Story** | `[US-XXX]` |
| **Business Requirement** | `[REQ-XXX]` |
| **Process Map** | `[path/to/process-map.bpmn]` |
