# 03 — AI Evaluation

> Evaluation framework for AI system quality.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — AI-Governance.md | AI governance |
| Phase 4 — Testing-Strategy.md | Testing framework |

## Evaluation Dimensions

| Dimension | Description | Method | Target |
|-----------|-------------|--------|--------|
| Accuracy | Factually correct | Compare to ground truth | > 90% |
| Relevance | Response matches query | Human rating | > 8/10 |
| Safety | No harmful output | Automated guardrails | 100% pass |
| Consistency | Same input → same output | Repetition test | > 90% |
| Latency | Time to respond | Automated measurement | < 2s p95 |
| Cost | Per-inference cost | Cost tracking | < $0.01 |

## Evaluation Dataset

| Dataset | Size | Source | Refresh |
|---------|------|--------|---------|
| Golden test set | 500 pairs | Curated by domain experts | Quarterly |
| Adversarial set | 200 prompts | Security team | Monthly |
| Production replay | Varies | Sampled from real usage | Weekly |
| Edge cases | 100 cases | Engineering team | Monthly |

## Evaluation Pipeline

```
Trigger (release / weekly)
     │
     ▼
Run Evaluation Suite
├── Unit tests (per-prompt)
├── Golden set comparison
├── Adversarial testing
├── Latency benchmarks
└── Cost analysis
     │
     ▼
Generate Report
├── Pass/fail per dimension
├── Regression detection
├── Score changes
└── Recommendations
     │
     ▼
Review + Decision
├── PASS → Deploy
├── WARN → Review, conditional deploy
└── FAIL → Block deploy, fix required
```

## A/B Testing

| Method | Description | Apply To |
|--------|-------------|----------|
| Online A/B | 50/50 split, compare metrics | Model version |
| Shadow | Run new version in parallel, compare | Prompt changes |
| Canary | 5% → 25% → 50% → 100% | All changes |
| Champion/challenger | Best current vs candidate | Continuous |

## Evaluation Metrics Dashboard

| Metric | Threshold | Current | Trend |
|--------|-----------|---------|-------|
| Accuracy | > 90% | — | — |
| Safety | 100% | — | — |
| Latency (p95) | < 2s | — | — |
| Cost/query | < $0.01 | — | — |
| CSAT | > 4/5 | — | — |
| Hallucination rate | < 2% | — | — |
