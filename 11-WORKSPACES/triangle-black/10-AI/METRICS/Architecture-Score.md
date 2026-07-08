# Architecture Score

## Overview

The Architecture Score quantifies how well the delivered software conforms to the target architecture. It measures Clean Architecture adherence, dependency rule compliance, module cohesion, coupling, and overall architectural integrity. The score provides an objective basis for technical debt assessment and refactoring prioritization.

## Scoring Methodology

### Score Components

The Architecture Score is composed of five weighted components:

| Component | Weight | Description |
|-----------|--------|-------------|
| Clean Architecture Adherence | 30% | Layer compliance, dependency direction |
| Dependency Rule Compliance | 25% | Import/export boundary enforcement |
| Module Cohesion | 20% | Relatedness of elements within modules |
| Coupling Metrics | 15% | Inter-module dependency strength |
| Architectural Consistency | 10% | Pattern uniformity across the codebase |

### Score Range

- **0.0 - 10.0 scale**, where 10.0 represents perfect architecture conformance
- Scores are computed per-module and aggregated to a system-wide score

### Calculation

```
architecture_score = SUM(component_score * component_weight)
```

Where each `component_score` is a normalized 0.0-10.0 value.

## Clean Architecture Adherence

### Layer Compliance

Clean Architecture layers are defined as:

```
UI (presentation) --> Application (use cases) --> Domain (entities) --> Infrastructure (data/external)
```

Dependencies must flow inward only. No layer may depend on an outer layer.

### Scoring

| Condition | Score Impact |
|-----------|-------------|
| All dependencies flow inward | +10.0 |
| < 5% of dependencies violate inward flow | -2.0 |
| 5-15% of dependencies violate inward flow | -5.0 |
| > 15% of dependencies violate inward flow | -10.0 |

### Layer Boundary Violations

Each violation type has a penalty weight:

| Violation | Weight | Example |
|-----------|--------|---------|
| UI importing domain directly | 1.0 | React component imports Entity |
| UI importing infrastructure | 0.8 | Component imports Repository |
| Application importing UI | 1.2 | Use case imports ViewModel |
| Domain importing infrastructure | 1.5 | Entity imports database driver |
| Domain importing application | 1.3 | Domain service imports UseCase |

### Scoring Formula for Layer Adherence

```
layer_score = 10.0 - (SUM(violation_count * violation_weight) * 0.5)
layer_score = MAX(0.0, layer_score)
```

## Dependency Rule Compliance

### Rule Categories

| Rule | Description |
|------|-------------|
| No circular dependencies | Modules must not form dependency cycles |
| No external dependency leaks | External library types not exposed through public API |
| No implementation leaks | Interfaces separated from implementations |
| No cross-boundary raw types | Data transfer objects used across boundaries, not entities |
| Package/namespace compliance | Code placed in correct package per architecture |

### Scoring

```
dependency_rule_score = (rules_passed / total_rules) * 10.0
```

Each rule has a pass/fail state for each module:

- **Pass**: No violations of the rule in the module
- **Fail**: One or more violations, with severity penalty applied

### Severity-Adjusted Score

```
dependency_rule_score = 10.0 - (violation_penalty / max_penalty) * 10.0
```

| Violation Severity | Points Per Occurrence |
|--------------------|----------------------|
| Circular dependency | -3.0 |
| External dependency leak | -2.0 |
| Implementation leak | -1.5 |
| Cross-boundary raw type | -1.0 |
| Package misplacement | -0.5 |

## Module Cohesion

### Cohesion Metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| Lack of Cohesion of Methods (LCOM) | Number of method pairs that don't share instance variables | LCOM < 0.7 |
| Relational Cohesion (H) | Average number of internal relationships per class | H > 1.5 |
| Cohesion Among Classes (C) | Percentage of methods using each other's data | C > 60% |
| Internal Dependency Ratio | Internal dependencies / total dependencies | Ratio > 0.6 |

### Scoring

```
cohesion_score = ((1 - LCOM) * 0.35 + (H / 4) * 0.25 + (C / 100) * 0.25 + internal_dep_ratio * 0.15) * 10.0
```

### Target Ranges

| Cohesion Level | Score Range | Interpretation |
|---------------|-------------|----------------|
| High | 8.0 - 10.0 | Well-focused module, strong internal relationships |
| Moderate | 5.0 - 7.9 | Acceptable cohesion, some unrelated elements |
| Low | 3.0 - 4.9 | Module does too much, needs refactoring |
| Poor | 0.0 - 2.9 | Module is a dumping ground, restructure required |

## Coupling Metrics

### Coupling Metrics Tracked

| Metric | Definition | Target |
|--------|-----------|--------|
| Afferent Coupling (Ca) | Number of incoming dependencies (how many modules depend on this) | Ca < 20 |
| Efferent Coupling (Ce) | Number of outgoing dependencies (how many modules this depends on) | Ce < 15 |
| Instability (I) | Ce / (Ca + Ce) | 0 < I < 1 (balanced at 0.5) |
| Abstractness (A) | Abstract elements / total elements | A = I (main sequence) |
| Distance from Main Sequence (D) | |A + I - 1| | D < 0.3 |
| Package Dependency Cycles | Cycles in package dependency graph | 0 cycles |

### Scoring

```
coupling_score = 10.0 - (normalized_coupling_penalty * 10.0)
```

Where:

- Ce > target: penalty proportional to excess
- Ca > target: penalty proportional to excess
- D > 0.3: penalty = (D - 0.3) * 5
- Cycles: -3.0 per cycle

## Architectural Consistency

### Consistency Checks

| Check | Description |
|-------|-------------|
| Naming patterns consistent across modules | Same patterns for controllers, services, repositories |
| Error handling patterns consistent | Same error type, response format across modules |
| Logging patterns consistent | Same logging library, levels, format |
| Configuration patterns consistent | Same config loading, environment resolution |
| Testing patterns consistent | Same test framework, mocking approach, assertion style |

### Scoring

```
consistency_score = (consistent_patterns / total_patterns) * 10.0
```

## Target Scores

| Program Phase | Minimum Score | Target Score | Stretch Goal |
|--------------|--------------|--------------|--------------|
| Initial delivery | 5.0 | 6.5 | 7.5 |
| After first refactoring sprint | 6.0 | 7.5 | 8.5 |
| Mature product (6+ months) | 7.0 | 8.5 | 9.0 |
| Production release | 7.5 | 8.5 | 9.5 |

## Scoring Frequency and Reporting

- Architecture Score is computed on every build and reported in the build pipeline
- Full architectural analysis is performed weekly
- Trend is tracked per sprint and reported in the Sprint Report
- Score deltas from baseline are reported per commit

### Report Format

```yaml
architecture_score:
  overall: {score}
  components:
    clean_architecture: {score}
    dependency_rules: {score}
    cohesion: {score}
    coupling: {score}
    consistency: {score}
  trending:
    previous_sprint: {score}
    previous_release: {score}
    baseline: {score}
  issues:
    - type: "{violation-type}"
      module: "{module-name}"
      severity: "{high|medium|low}"
      description: "{description}"
      recommended_action: "{action}"
```

## Score Improvement Actions

| Score Gap | Recommended Actions |
|-----------|-------------------|
| Clean Architecture < 6.0 | Audit layer violations, create refactoring tasks for inwards-flow violations |
| Dependency Rules < 6.0 | Break circular dependencies, extract interfaces, isolate external deps |
| Cohesion < 5.0 | Split large modules, extract separate concerns into new modules |
| Coupling > target | Reduce efferent coupling, introduce facades or mediators |
| Consistency < 6.0 | Codify patterns, apply automated pattern enforcement |
