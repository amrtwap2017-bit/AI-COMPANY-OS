# 05 — Workflow Automation

> Business workflow automation framework.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 6 — All business domains | Domain workflows |

## Workflow Engine

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Workflow engine | Temporal / Zeebe | Long-running workflow orchestration |
| Workflow definitions | TypeScript/Go DSL | Business process definitions |
| Task workers | Microservices | Individual step execution |
| Human tasks | In-app approval UI | Manual steps with timeouts |
| Event triggers | Kafka/RabbitMQ | Async workflow initiation |

## H1 Automated Workflows

| Workflow | Domain | Steps | Automation % | Value |
|----------|--------|-------|--------------|-------|
| PO approval | Procurement | Submit → Approve → Order → Receive → Invoice | 80% | Speed, accuracy |
| Leave request | HR | Request → Manager → HR → Payroll | 90% | Efficiency |
| Maintenance request | Maintenance | Report → Assign → Fix → Verify → Close | 70% | Response time |
| Onboarding | HR/Sales | Signup → Provision → Setup → Welcome | 60% | Time-to-value |
| Invoice processing | Finance | Receive → Match → Approve → Pay | 80% | Late payment reduction |
| Support escalation | Support | Ticket → Assign → Resolve → Verify → Close | 75% | Resolution time |

## Workflow Pattern

```
Trigger (event / time / manual)
     │
     ▼
┌─────────────────────────────────────────────┐
│         WORKFLOW DEFINITION                  │
│  ├── State 1: Task or decision               │
│  ├── State 2: Automatic / human step         │
│  └── State 3: Error handler / timeout        │
└─────────────────────────────────────────────┘
     │
     ▼
   Complete / Fail / Escalate
```

## Workflow Metrics

| Metric | Target |
|--------|--------|
| Workflow success rate | > 98% |
| Average completion time | < 50% of manual |
| Human intervention rate | < 20% |
| Timeout rate | < 5% |
| Error recovery rate | > 90% |
