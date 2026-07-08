# Continuous Review

## Purpose

Review is not a batched event that happens at PR time — it is a continuous process that starts with the first commit and continues through deployment. Continuous Review combines automated analysis at every stage with human review focused on the highest-risk changes. The goal is to catch issues as early as possible, when they are cheapest and easiest to fix.

## Review Layers

Review happens at multiple layers, each catching different types of issues:

```
Layer 1: Automated Static Analysis (every commit)
Layer 2: Automated Security Scanning (every commit)
Layer 3: AI-Powered Code Review (every PR)
Layer 4: Human Review (high-risk changes)
Layer 5: Post-Deployment Validation (every deployment)
```

## Layer 1: Automated Static Analysis

- **When**: On every commit and push.
- **Tools**: ESLint, Prettier, Ruff, Clippy, Checkstyle, SonarQube.
- **What it checks**:
  - Code formatting and style
  - Common programming errors
  - Code complexity metrics (cyclomatic complexity, cognitive complexity)
  - Duplicate code detection
  - Coding standard violations
- **Enforcement**:
  - Style violations: Warning (auto-fixable in CI).
  - Error-level violations: Blocks build.
  - Complexity thresholds: Warning, flagged in report.
- **Duration**: < 1 minute.

## Layer 2: Automated Security Scanning

- **When**: On every commit. Full scan on every PR to main.
- **Tools**:
  - **SAST**: Semgrep, CodeQL, SonarQube Security.
  - **Secret scanning**: GitLeaks, TruffleHog.
  - **Dependency scanning**: Snyk, Dependabot, Trivy.
  - **Container scanning**: Trivy, Grype, Clair.
- **What it checks**:
  - Security vulnerabilities (OWASP Top 10, CWE).
  - Hardcoded secrets.
  - Insecure configurations.
  - Vulnerable dependencies.
  - Container image vulnerabilities.
- **Enforcement**:
  - Critical/high findings: Block PR.
  - Medium findings: Warning, must be addressed within sprint.
  - Low findings: Logged, reviewed monthly.

## Layer 3: AI-Powered Code Review

- **When**: On every pull request.
- **AI Agent**: Specialized code review AI agent integrated with the version control platform.
- **What it reviews**:
  - Code quality and adherence to coding standards.
  - Test coverage for new/modified code.
  - API design consistency (naming conventions, parameter patterns).
  - Potential performance issues.
  - Potential security issues (as a complement to automated scanning).
  - Documentation completeness.
  - Compliance with repository conventions (branch naming, commit format, PR description).
- **Output**:
  - Inline comments on the PR for each finding.
  - Overall quality score for the PR.
  - Summary of changes and potential risk areas.
- **Enforcement**:
  - AI review is advisory. It does not block the PR.
  - AI-identified critical issues are escalated to human review.
  - AI review results are stored for quality tracking (AI Productivity metrics).

## Layer 4: Human Review

- **When**: On every pull request, but depth varies by risk classification.
- **Risk classification**:
  - **Low risk**: Documentation, configuration, test additions (no logic changes). One reviewer, async review, 4-hour SLA.
  - **Medium risk**: Feature work, bug fixes, refactoring. One reviewer, review within 8 hours.
  - **High risk**: Database migrations, security changes, API breaking changes, infrastructure changes. Two reviewers, review within 4 hours.
  - **Critical risk**: Production hotfixes, security patches, data migrations. Two reviewers, expedited review, post-deployment validation.

### Human Review Expectations

| Aspect | Expectation |
|--------|-------------|
| **Review depth** | Understand the change, verify correctness, check for edge cases |
| **Response time** | Within SLA for the risk level |
| **Feedback quality** | Specific, constructive, focused on code not the author |
| **Turnaround** | If changes requested, follow up within 1 working day |
| **Approval criteria** | Change is correct, tested, documented, follows conventions |

### Review SLAs

| Risk Level | Time to First Review | Time to Approval |
|------------|---------------------|------------------|
| Low | 4 hours | 8 hours |
| Medium | 8 hours | 24 hours |
| High | 4 hours | 8 hours |
| Critical | 1 hour | 2 hours |

### What Triggers Human Review

- All PRs targeting `main` or release branches.
- Any PR modifying security-critical files (per CODEOWNERS).
- Any PR exceeding the 400-line limit (requires engineering lead approval).
- Any PR with AI-identified critical issues.
- Any PR introducing new dependencies.
- Any PR modifying database schemas or migration files.

## Layer 5: Post-Deployment Validation

- **When**: After every production deployment.
- **What it checks**:
  - Health check endpoints responding correctly.
  - Error rate within baseline.
  - Response times within threshold.
  - Business metrics (signups, orders, etc.) within normal range.
  - No spike in support tickets or bug reports.
- **Duration**: Continuous monitoring for 30 minutes post-deployment.
- **Rollback trigger**: Automated rollback if any metric exceeds threshold.

## Review Process Flow

```
Commit → Automated Static Analysis (pass/fail)
  → Automated Security Scan (pass/fail)
  → AI-Powered Review (advisory)
  → Human Review (if triggered)
    → Approve / Request Changes / Block
  → Merge
  → Post-Deployment Validation
    → Healthy / Rollback
```

## Review Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Review time (time to first review) | Within SLA | CI/CD platform |
| Review completion rate | > 90% within SLA | Review platform |
| Automated review coverage | 100% of changes | CI pipeline |
| AI review accuracy | > 85% agreement with human | Comparison analysis |
| Post-deployment rollback rate | < 5% | Deployment platform |
