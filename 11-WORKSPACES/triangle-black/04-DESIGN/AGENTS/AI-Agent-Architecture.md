# Phase 03 — AI Agent Architecture

> AI agent architecture for rule-based decision support across domains.

## Agent Overview

| Agent | Domain | Decision Type | Rules | Input |
|-------|--------|---------------|-------|-------|
| Lead Scorer | Commercial | Score (0-100) | 12 rules | Lead source, company size, budget, timeline, project type |
| Margin Validator | Commercial | Pass/Warn/Block | 8 rules | Line item costs, markup %, margin thresholds |
| NCR Classifier | Project | Severity + Category | 15 rules | NCR description, location, system type |
| SLA Breach Detector | Maintenance | Breach risk (%) | 6 rules | Request age, SLA terms, priority |

## Agent Contract

All agents follow a uniform contract:

```typescript
interface AgentInput {
  type: string;       // Agent type identifier
  data: Record<string, unknown>;  // Domain-specific input
  config?: Record<string, unknown>;  // Per-tenant configuration
}

interface AgentOutput {
  score?: number;       // Numeric result (if applicable)
  label: string;        // Classification/decision label
  confidence: number;   // Confidence score (0.0 - 1.0)
  reasons: string[];    // Human-readable decision reasons
  metadata: Record<string, unknown>;  // Additional context
}
```

## Rule Engine

- JSON-based rule definitions stored in database
- Rule format: `{ condition: "field op value", weight: number, reason: string }`
- Condition operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `contains`, `matches`
- Rules combined via weighted sum or decision tree
- Per-tenant rule overrides via `config` parameter

## V2 Evolution

| Phase | Enhancement |
|-------|------------|
| V1 | Static rules, weighted scoring |
| V2 | ML model trained on historical data |
| V3 | Continuous learning, A/B testing agents |

See `16-AI/` and `17-AI-CODING/` for detailed implementation specifications.
