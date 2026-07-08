# Quality Score

## Overview

The Quality Score is an aggregate metric that combines multiple quality dimensions into a single, actionable number. It provides a holistic view of codebase health, balancing test coverage, code quality, security posture, performance characteristics, and documentation completeness.

## Weightings

### Component Weights

| Component | Weight | Rationale |
|-----------|--------|-----------|
| Test Coverage | 30% | Primary indicator of code reliability |
| Code Quality (Linting) | 20% | Maintainability and consistency |
| Security Findings | 20% | Critical for production readiness |
| Performance Metrics | 15% | User experience impact |
| Documentation Completeness | 15% | Knowledge preservation and onboarding |

### Weight Justification

- Test coverage (30%) receives the highest weight because it directly correlates with defect prevention and refactoring confidence
- Security (20%) and code quality (20%) are equally weighted as both can cause production incidents
- Performance (15%) and documentation (15%) are important but have less immediate impact on correctness

## Calculation

### Per-Component Scoring

Each component score is normalized to a 0.0-10.0 scale:

**Test Coverage Score:**
```
coverage_score = MIN(10.0, composite_coverage * 10 / coverage_target)
```

Where `composite_coverage` is the weighted coverage from the Coverage system, and `coverage_target` is the program's target composite coverage (default 80%).

**Code Quality Score:**
```
quality_score = 10.0 - (lint_errors * error_penalty + lint_warnings * warning_penalty)
```

Where:
- `error_penalty = 0.2` per error
- `warning_penalty = 0.05` per warning
- Score floored at 0.0

**Security Score:**
```
security_score = 10.0 - (critical * 2.0 + high * 1.0 + medium * 0.3 + low * 0.1)
```

Where findings are from SAST, dependency scanning, and secret detection.

**Performance Score:**
```
performance_score = 10.0 - MAX(0, (p95_latency - latency_target) * latency_factor) - regression_penalty
```

Where:
- `latency_target` is the program performance budget (e.g., 200ms p95)
- `latency_factor` converts excess latency to score impact
- `regression_penalty` accounts for new performance regressions

**Documentation Score:**
```
documentation_score = (api_coverage * 0.40 + screen_coverage * 0.25 + adr_coverage * 0.20 + readme_coverage * 0.15) * 10 / 100
```

### Aggregate Formula

```
quality_score = coverage_score * 0.30 +
                quality_score * 0.20 +
                security_score * 0.20 +
                performance_score * 0.15 +
                documentation_score * 0.15
```

## Targets

### Score Thresholds

| Level | Score Range | Meaning | Action Required |
|-------|-------------|---------|-----------------|
| Excellent | 8.5 - 10.0 | Production-ready quality | Maintain |
| Good | 7.0 - 8.4 | Acceptable quality, minor improvements | Address medium/high findings |
| Fair | 5.0 - 6.9 | Quality needs attention | Plan improvement sprint |
| Poor | 3.0 - 4.9 | Significant quality gaps | Dedicate sprint to quality |
| Critical | 0.0 - 2.9 | Quality is blocking release | Halt feature work, fix quality |

### Per-Component Targets

| Component | Excellent | Good | Fair | Poor |
|-----------|-----------|------|------|------|
| Test Coverage | >= 85 | 75-84 | 60-74 | < 60 |
| Code Quality | 0 errors, < 5 warnings | < 5 errors, < 20 warnings | < 20 errors | >= 20 errors |
| Security | 0 critical/high | 0 critical, < 3 high | < 3 critical | >= 3 critical |
| Performance | Within budget | < 25% over budget | 25-50% over | > 50% over |
| Documentation | >= 90% | 75-89% | 60-74% | < 60% |

## Reporting

### Quality Score Report

Each quality score computation produces a structured report:

```yaml
quality_score:
  overall: {score}
  level: "{excellent|good|fair|poor|critical}"
  components:
    test_coverage:
      score: {score}
      value: {actual-coverage-percentage}
      target: {target-coverage-percentage}
      status: "{above_target|near_target|below_target}"
    code_quality:
      score: {score}
      errors: {count}
      warnings: {count}
      status: "{pass|warning|fail}"
    security:
      score: {score}
      findings:
        critical: {count}
        high: {count}
        medium: {count}
        low: {count}
      status: "{pass|warning|fail}"
    performance:
      score: {score}
      p95_latency: {ms}
      regressions: [{description}]
      status: "{pass|warning|fail}"
    documentation:
      score: {score}
      api_coverage: {percentage}
      screen_coverage: {percentage}
      adr_coverage: {percentage}
      status: "{pass|warning|fail}"
  trending:
    current_vs_previous: {delta}
    current_vs_baseline: {delta}
    sprint_trend: [{sprint_1_score}, {sprint_2_score}, ...]
```

### Quality Gates

| Gate | Threshold | Effect |
|------|-----------|--------|
| Pre-merge | Quality Score >= 5.0, no critical security findings | Blocks merge if not met |
| Pre-release | Quality Score >= 7.0, no high+ security findings | Blocks release if not met |
| Sprint completion | Quality Score >= 6.5 or not decreased > 0.5 | Flags in sprint review |

### Trend Analysis

Quality Score trends are analyzed over time:

- **Sprint-over-sprint delta**: Is quality improving or degrading?
- **Component breakdown**: Which component is driving the trend?
- **Regression detection**: Automated alert when score drops by > 1.0 in a single build
- **Improvement velocity**: How many sprints to move from Fair to Good at current rate?

### Continuous Improvement

| Current Score | Next Sprint Target | Stretch Target |
|--------------|-------------------|----------------|
| < 5.0 | +1.5 | +2.0 |
| 5.0 - 6.9 | +0.8 | +1.2 |
| 7.0 - 8.4 | +0.3 | +0.5 |
| >= 8.5 | Maintain | +0.1 |
