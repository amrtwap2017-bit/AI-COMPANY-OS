# Phase 04 — AI Engineering

> Standards and practices for AI agent development.

## AI Development Principles

| Principle | Description |
|-----------|-------------|
| Deterministic | Same input always produces same output |
| Auditable | Every decision logged with input, output, confidence |
| Configurable | Rule sets in database, not hardcoded |
| Testable | Unit tests for every rule and agent |
| Graceful | Agent failure doesn't block primary workflow |

## Agent Development Workflow

```
Spec → Rule Definition → Implementation → Unit Test → Integration Test → Deploy
  │          │               │               │               │               │
  ▼          ▼               ▼               ▼               ▼               ▼
  Agent    Rule store     Service      Test with         Test with       Feature
  contract (JSON/DB)     with mock   fixtures           real rules      flag
```

## Testing AI Agents

| Test Type | Description | Coverage |
|-----------|-------------|----------|
| Rule unit test | Test each rule independently | 100% |
| Agent integration | Test complete agent with fixture data | 100% |
| Edge case | Test boundary conditions | All identified edges |
| Performance | Agent response time < 200ms | P99 < 500ms |

## V1 Constraints

- No ML models, no external AI APIs
- All agents use deterministic rule engines
- Maximum 50 rules per agent
- Rule evaluation completes in < 100ms

## V2 Evolution

- ML models replace rule-based where data supports
- A/B testing framework for agent comparison
- Feedback loop for continuous improvement

See `17-AI-CODING/` for detailed AI development standards and examples.
