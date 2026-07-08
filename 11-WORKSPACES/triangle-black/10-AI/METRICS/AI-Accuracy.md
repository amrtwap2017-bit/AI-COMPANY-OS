# AI Accuracy Metrics

## Overview

AI Accuracy metrics measure how effectively the AI agents in the Enterprise AI Delivery Framework produce correct, review-ready artifacts without requiring human intervention or rework. These metrics are essential for evaluating AI performance, guiding model improvements, and building trust in automated delivery.

## First-Pass Yield

### Definition

First-pass yield (FPY) measures the percentage of AI-generated artifacts that pass review without requiring any changes.

### Calculation

```
first_pass_yield = (COUNT(artifacts approved without changes) / COUNT(total artifacts generated)) * 100
```

### Per-Agent FPY

| AI Agent | Target FPY | Stretch Goal | Measurement |
|----------|-----------|--------------|-------------|
| Program Manager AI | 85% | 92% | Tasks and sprint plans approved without edits |
| Developer AI (Code Engineer) | 75% | 85% | Code submissions approved without changes |
| Code Review AI | 90% | 95% | Review findings accepted without overrides |
| Documentation Engineer AI | 80% | 90% | Documentation approved without edits |
| DevOps Engineer AI | 85% | 92% | Infrastructure configs approved without changes |
| Release Manager AI | 90% | 95% | Releases executed without manual intervention |

### Per-Artifact Type FPY

| Artifact Type | Target FPY | Common Failure Modes |
|--------------|-----------|---------------------|
| Task definitions | 85% | Missing acceptance criteria, incorrect estimates |
| Sprint plans | 80% | Wrong capacity, missing dependencies |
| Source code | 75% | Compilation errors, style violations, missing tests |
| Tests | 70% | Missing edge cases, incorrect assertions |
| Documentation | 80% | Missing sections, incorrect cross-references |
| API specifications | 85% | Missing endpoints, wrong response schemas |
| Configuration | 85% | Wrong environment values, missing keys |

## Rework Rate

### Definition

Rework rate measures the frequency and extent to which AI-generated artifacts require modification after initial generation.

### Calculation

```
rework_rate = (COUNT(artifacts requiring changes) / COUNT(total artifacts generated)) * 100
```

### Rework Depth

| Depth | Definition | Acceptable Rate |
|-------|-----------|-----------------|
| Minor rework | < 10% of artifact changed (typos, formatting) | < 20% of submissions |
| Moderate rework | 10-30% of artifact changed (logic fixes, missing sections) | < 10% of submissions |
| Major rework | 30-50% of artifact changed (restructuring, incorrect approach) | < 5% of submissions |
| Complete rewrite | > 50% of artifact changed or regenerated | < 2% of submissions |

### Rework Iterations

```
avg_rework_iterations = SUM(rework iterations per artifact) / COUNT(artifacts)
```

| Target | Warning | Critical |
|--------|---------|----------|
| < 1.2 iterations per artifact | 1.2-1.5 iterations | > 1.5 iterations |

### Rework by Cause

| Cause | Description | Prevention |
|-------|-------------|------------|
| Requirement ambiguity | Task description unclear | Improve requirement parsing |
| Missing context | AI lacked necessary codebase context | Expand context injection |
| Tooling error | Bug in generation pipeline | Fix pipeline issue |
| Style mismatch | Code doesn't match conventions | Train on project examples |
| Logic error | Generated code semantically wrong | Improve model training data |

## Escalation Rate

### Definition

Escalation rate measures how often AI agents cannot complete a task autonomously and require human intervention.

### Calculation

```
escalation_rate = (COUNT(tasks escalated to human) / COUNT(total tasks)) * 100
```

### Escalation Reasons

| Reason | Description | Acceptable Rate |
|--------|-------------|-----------------|
| Ambiguous requirements | Cannot determine correct implementation | < 5% |
| Design decision required | Architectural choice needed | < 3% |
| Technical limitation | AI cannot access required system | < 2% |
| Security-sensitive | Task involves security-critical code | < 1% (expected) |
| Business rule complexity | Complex domain logic beyond AI capability | < 3% |

### Escalation by Agent

| AI Agent | Target Escalation Rate | Critical Threshold |
|----------|----------------------|-------------------|
| Program Manager AI | < 5% | > 15% |
| Developer AI | < 10% | > 25% |
| Code Review AI | < 3% | > 10% |
| Documentation AI | < 5% | > 15% |
| DevOps AI | < 5% | > 15% |
| Release Manager AI | < 3% | > 10% |

## Measurement

### Data Collection

AI accuracy data is collected from:

1. **Review results**: Was the artifact approved or changed? What changed?
2. **Pipeline events**: Did the generation complete without errors?
3. **Manual annotations**: Human reviewers tag the reason for changes
4. **Task tracking**: Was a task escalated? What was the reason?
5. **Post-hoc analysis**: Periodic sampling of AI outputs for quality assessment

### Measurement Timing

| Measurement | Frequency | Lag |
|-------------|-----------|-----|
| FPY per artifact | Per generation | Real-time |
| Rework rate | Per sprint | End of sprint |
| Escalation rate | Per sprint | End of sprint |
| Accuracy trend | Weekly | 1 week |
| Model comparison | Per model update | 1 sprint |

### Tooling

Accuracy data is collected through:

- Pipeline instrumentation hooks
- Review tool APIs
- Manual annotation UI
- Automated comparison scripts

## Targets

### Summary Targets

| Metric | Current Baseline | 1-Month | 3-Month | 6-Month |
|--------|----------------|---------|---------|---------|
| Overall FPY | 75% | 80% | 85% | 90% |
| Overall rework rate | 25% | 20% | 15% | 10% |
| Overall escalation rate | 8% | 6% | 4% | 3% |
| Avg rework iterations | 1.3 | 1.2 | 1.15 | 1.1 |

### Stretch Targets

| Metric | Level 1 | Level 2 | Level 3 |
|--------|---------|---------|---------|
| Code generation FPY | 75% | 80% | 85% |
| Test generation FPY | 70% | 78% | 85% |
| Task generation FPY | 85% | 90% | 95% |
| Sprint plan FPY | 80% | 87% | 92% |

## Improvement Tracking

### Root Cause Analysis

When accuracy drops below targets, automated root cause analysis is triggered:

1. Collect all artifacts that failed review in the period
2. Categorize failure reasons (requirement, context, logic, style, tooling)
3. Identify the most common failure category
4. Suggest improvement actions

### Improvement Loop

```
[Measure] --> [Analyze] --> [Improve] --> [Validate]
    ^                                      |
    |______________________________________|
```

| Step | Action | Owner |
|------|--------|-------|
| Measure | Collect accuracy data per agent and artifact type | Metrics system |
| Analyze | Identify accuracy gaps and root causes | AI Ops team |
| Improve | Update agent prompts, training, context, or tooling | AI Engineering |
| Validate | Run comparison on held-out test set before deployment | QA team |
| Deploy | Deploy improved agent | Release Manager AI |

### Accuracy Trend Report

```yaml
ai_accuracy:
  period: "{sprint-number | month}"
  overall:
    fpy: {percentage}
    rework_rate: {percentage}
    escalation_rate: {percentage}
    avg_iterations: {number}
  by_agent:
    program_manager:
      fpy: {percentage}
      rework_rate: {percentage}
      escalation_rate: {percentage}
    developer_ai:
      fpy: {percentage}
      rework_rate: {percentage}
      escalation_rate: {percentage}
    code_review_ai:
      fpy: {percentage}
    documentation_ai:
      fpy: {percentage}
      rework_rate: {percentage}
  by_artifact:
    code:
      fpy: {percentage}
      top_failures: [{reason}, {reason}]
    tests:
      fpy: {percentage}
      top_failures: [{reason}, {reason}]
    tasks:
      fpy: {percentage}
      top_failures: [{reason}, {reason}]
  trending:
    fpy_3_sprint_avg: {percentage}
    fpy_change: {percentage-point-change}
    rework_3_sprint_avg: {percentage}
    escalation_3_sprint_avg: {percentage}
```

### Performance Improvement Actions

| Scenario | Action | Expected Impact |
|----------|--------|-----------------|
| FPY declining for 2+ sprints | Retrain agent model on recent successful examples | +5-10% FPY |
| Rework rate high for specific artifact type | Expand context injection for that artifact type | -20-30% rework |
| Escalation rate high for ambiguity | Improve requirement parsing pipeline | -30-50% ambiguity escalations |
| Specific failure pattern recurring | Add pattern-specific training data | -40-60% pattern failures |
