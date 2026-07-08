# Automated Review Rules

## Overview

The Code Review AI performs automated code reviews on all generated code before it enters the main codebase. Automated review enforces code quality standards, architecture compliance, security best practices, and project conventions without requiring human reviewer bandwidth for routine checks.

## Review Pipeline

Every code submission passes through a multi-stage review pipeline:

```
Code Submission
    |
    v
[Static Analysis] - SAST tools, linters, type checking
    |
    v
[Pattern Matching] - Anti-pattern detection, convention checking
    |
    v
[Rule Enforcement] - Project-specific rules, architecture rules
    |
    v
[Severity Classification] - Findings categorized by severity
    |
    v
[Review Report] - Structured output with actions
```

## Static Analysis Integration

### Integrated Tools

The Code Review AI orchestrates a suite of static analysis tools:

| Tool | Purpose | Configuration Source |
|------|---------|---------------------|
| ESLint | JavaScript/TypeScript linting | .eslintrc |
| SonarQube | Comprehensive code quality | sonar-project.properties |
| Semgrep | Custom rule matching | .semgrep/ |
| Trivy | Vulnerability scanning | .trivyignore |
| CodeQL | Security query analysis | codeql-database.yml |
| Prettier | Format checking | .prettierrc |
| TypeScript compiler | Type safety | tsconfig.json |

### Analysis Scope

Static analysis covers:

- **Code quality**: Complexity, duplication, naming, formatting
- **Security**: OWASP Top 10, CWE categories, secrets detection
- **Performance**: N+1 queries, memory leaks, unnecessary allocations
- **Reliability**: Null pointer risks, error handling gaps, race conditions
- **Maintainability**: Cyclomatic complexity, cognitive complexity, comment density

### Results Aggregation

Results from all tools are aggregated into a unified finding format:

```yaml
finding:
  id: REV-{sequence}
  tool: "{tool-name}"
  rule: "{rule-identifier}"
  file: "{file-path}"
  line: {line-number}
  column: {column-number}
  message: "{description of finding}"
  severity: "{critical|high|medium|low|info}"
  category: "{quality|security|performance|reliability|maintainability}"
  recommendation: "{suggested fix}"
```

## Pattern Matching

### Anti-Pattern Detection

The Code Review AI detects known anti-patterns using a combination of AST analysis and regex matching:

| Anti-Pattern | Detection Method | Severity |
|-------------|-----------------|----------|
| God object / large class | File line count > 500, method count > 20 | Medium |
| Feature envy | Method references another class more than its own | Medium |
| Shotgun surgery | Single change affects N files | Low |
| Copy-paste code | Duplicate code blocks > 10 lines | Medium |
| Premature optimization | Unnecessary caching, complex patterns for simple needs | Low |
| Magic numbers | Numeric literals without named constants | Low |
| Deep nesting | Nesting depth > 4 levels | Medium |
| Spaghetti code | Cyclomatic complexity > 15 | High |

### Convention Checking

Project-specific conventions are checked:

1. **Naming conventions**: Variable, function, class, file naming as per project standards
2. **File organization**: File placement matches expected module structure
3. **Export patterns**: Consistent export style (named vs default)
4. **Error handling**: Consistent error response format, proper error types
5. **Logging**: Appropriate log levels, no console.log in production code
6. **Async patterns**: Proper promise handling, no uncaught rejections
7. **State management**: Consistent state mutation patterns

### Pattern Library

The pattern library is stored in `.review/patterns/` and includes:

- `.review/patterns/anti-patterns.yaml` - Known anti-pattern definitions
- `.review/patterns/conventions.yaml` - Project convention rules
- `.review/patterns/security.yaml` - Security-sensitive patterns
- `.review/patterns/architecture.yaml` - Architecture compliance patterns

## Rule Enforcement

### Rule Categories

| Category | Example Rules | Enforcement |
|----------|--------------|-------------|
| Mandatory | No secrets in code, no SQL injection | Block review |
| Required | Error handling on all external calls | Fail review |
| Recommended | Use early returns, avoid else nesting | Warning |
| Informational | Consider extracting this to a utility | Suggestion |

### Architecture Rule Enforcement

Architecture rules are enforced through dependency analysis:

1. **Layer dependency**: UI layer may not import data layer directly
2. **Circular dependency**: No circular imports between modules
3. **Package boundary**: External packages only used in permissive layers
4. **Interface segregation**: Interfaces should be focused and small
5. **Dependency injection**: Dependencies should be injected, not instantiated

### Custom Rule Definition

Teams can define custom rules in `.review/team-rules.yaml`:

```yaml
rules:
  - id: TEAM-001
    description: "All public methods must have JSDoc"
    pattern: "public\\s+(function\\s+\\w+\\s*\\()"
    constraint: "Preceded by /**"
    severity: medium
    category: maintainability
```

## Finding Severity Classification

### Severity Levels

| Severity | Definition | Action | Response Time |
|----------|-----------|--------|---------------|
| Critical | Security vulnerability, data loss risk, production outage | Block merge, immediate fix required | < 1 hour |
| High | Functionality broken, significant performance issue, major convention violation | Block merge, fix before merge | < 24 hours |
| Medium | Minor functionality impact, moderate code quality issue | Should fix, non-blocking | < 1 sprint |
| Low | Cosmetic, style preference, minor optimization | Optional fix | Best effort |
| Info | Suggestion, observation, educational note | No action required | N/A |

### Severity Determination

Severity is determined algorithmically based on:

1. **Impact**: What breaks if this finding is not addressed?
2. **Likelihood**: How likely is this to cause a problem in production?
3. **Scope**: How many users/components are affected?
4. **Detectability**: Would existing tests catch this issue?

Formula: `severity_score = impact * 0.4 + likelihood * 0.3 + scope * 0.2 + (1 - detectability) * 0.1`

### Severity Override

Severity can be overridden through:

1. **Won't Fix annotation**: Developer annotates with `// review:ignore {rule-id} {reason}`
2. **False positive flagging**: Finding marked as false positive for tool calibration
3. **Risk acceptance**: Approved by architect with documented rationale

Allowed annotations must pass review themselves and are logged for audit trail.

## Review Report

### Report Structure

Each review produces a structured report:

```yaml
review:
  submission_id: "{commit-sha|pr-number}"
  reviewer: "Code Review AI v{version}"
  timestamp: "{ISO-timestamp}"
  summary:
    total_findings: {count}
    by_severity:
      critical: {count}
      high: {count}
      medium: {count}
      low: {count}
      info: {count}
    by_category:
      quality: {count}
      security: {count}
      performance: {count}
      reliability: {count}
      maintainability: {count}
  findings: [...]
  verdict: "{pass|conditional|fail}"
  recommendations:
    - "{action-item}"
```

### Review Verdict

| Verdict | Criteria | Next Step |
|---------|----------|-----------|
| pass | Zero critical, high, or medium findings | Auto-approve, proceed to merge |
| conditional | Zero critical/high, medium findings addressed | Auto-approve after medium findings acknowledged |
| fail | Any critical or high finding | Block merge, create fix tasks |

### Learning and Calibration

The Code Review AI learns from:

1. **Accepted overrides**: Patterns in overridden findings are used to calibrate rule sensitivity
2. **False positive rate**: Tools with high false positive rates are tuned or disabled
3. **Review feedback**: Human reviewer corrections to AI findings improve accuracy
4. **Cross-project patterns**: Patterns from other projects inform rule adjustments
