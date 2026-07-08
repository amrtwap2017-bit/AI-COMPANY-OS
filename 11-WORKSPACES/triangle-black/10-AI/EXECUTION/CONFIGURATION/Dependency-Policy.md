# Dependency Management Policy

## Purpose

Establish a consistent, secure approach to managing third-party dependencies. Poor dependency management leads to security vulnerabilities, build instability, license compliance risks, and technical debt.

## Dependency Types

| Type | Definition | Examples |
|------|------------|---------|
| **Direct** | Libraries explicitly declared and imported by the project | Express.js, React, Spring Boot |
| **Transitive** | Libraries pulled in as dependencies of direct dependencies | lodash (brought in by a direct dep) |
| **Dev** | Libraries used only during development and testing | Jest, ESLint, Mocha |
| **Build** | Tools and plugins used in the build pipeline | Webpack, Babel, Gradle plugins |
| **Infrastructure** | System-level dependencies | Docker images, Terraform providers, Helm charts |

## Version Pinning

### Policy: Exact Versions Only

All dependencies must use **exact version pinning**. Range-based version specifiers (e.g., `^1.2.3`, `~1.2.x`) are prohibited.

| Package Manager | Correct | Incorrect |
|----------------|---------|-----------|
| npm | `"express": "4.18.2"` | `"express": "^4.18.2"` |
| pip | `Django==4.2.7` | `Django>=4.2.0,<5.0` |
| Maven | `<version>3.8.4</version>` | `<version>[3.8,3.9)</version>` |
| Cargo | `serde = "1.0.152"` | `serde = "1"` |
| Go | `require example.com/pkg v1.2.3` | `require example.com/pkg v1.2.3 // indirect` |

### Why Exact Versions?

- Reproducible builds across environments and time.
- Eliminates surprise breaking changes from transitive updates.
- Enables deterministic vulnerability scanning and audit.
- Prevents CI/CD drift between developer machines and pipelines.

### Updating Exact Versions

When updating a dependency, always update the exact version in the lockfile and commit it. Dependencies are updated through a deliberate process (see Update Cadence below), not through version range resolution.

## Lockfiles

All projects **must** commit lockfiles:

| Ecosystem | Lockfile |
|-----------|----------|
| Node.js | `package-lock.json` or `yarn.lock` |
| Python | `requirements.txt` (pinned) + `poetry.lock` |
| Java | `gradle.lockfile` or Maven dependency convergence |
| Rust | `Cargo.lock` |
| Go | `go.sum` |
| .NET | `packages.lock.json` |

Lockfiles ensure deterministic dependency resolution across environments.

## Update Cadence

| Dependency Type | Frequency | Process |
|-----------------|-----------|---------|
| Security patches | Within 48 hours of advisory | Automated PR via Dependabot/Renovate + expedited review |
| Patch updates (x.y.Z) | Monthly | Automated PR + standard review |
| Minor updates (x.Y.z) | Quarterly | Manual review + test suite + staging validation |
| Major updates (X.y.z) | As needed, planned | Migration plan + feature branch + extended review |
| Dev dependencies | Quarterly | Automated PR + standard review |
| Build dependencies | Quarterly | Manual review + pipeline validation |
| Docker base images | Weekly | Automated rebuild with security scan |

## Vulnerability Scanning

### Mandatory Scanning

All projects must have vulnerability scanning integrated into the CI/CD pipeline:

| Scan Type | Tool Examples | When |
|-----------|--------------|------|
| Dependency vulnerability | Snyk, Dependabot, Trivy, OWASP Dependency-Check | On every commit and PR |
| Container image | Trivy, Grype, Clair | On every image build |
| License compliance | FOSSA, AboutCode, ScanCode | On every PR |
| Secrets in dependencies | GitLeaks, TruffleHog | On every commit |

### Severity Response

| Severity | Response SLA | Action |
|----------|-------------|--------|
| Critical | 24 hours | Immediate fix or mitigation |
| High | 72 hours | Fix within sprint |
| Medium | Next sprint | Scheduled fix |
| Low | Within 90 days | Backlogged |

### Vulnerability Triage

1. **False positive**: Document and suppress with evidence.
2. **No available fix**: Document risk, add to exception list, schedule monitoring.
3. **Fix available**: Update dependency, verify with test suite, deploy.
4. **Unfixable**: Replace dependency or implement compensating control.

## License Compliance

### Allowed Licenses

Only dependencies with the following license types may be used:

- MIT
- Apache 2.0
- BSD 2-Clause / 3-Clause
- ISC
- Unlicense
- CC0
- MPL 2.0 (with legal review)
- LGPL (with legal review)

### Restricted Licenses

The following licenses require **written legal approval**:

- GPL v2 / v3
- AGPL v3
- SSPL
- BUSL
- Custom / proprietary licenses

### Prohibited Licenses

These licenses are **never allowed**:

- Any license that restricts commercial use
- Any license with unknown or unidentifiable terms
- Any license that conflicts with the organization's IP policy

### License Audit

- Automated license scanning runs on every PR.
- A full dependency license audit is performed quarterly.
- New dependencies with restricted licenses require legal team approval before adoption.

## Deprecation Policy

### Abandoned Dependencies

A dependency is considered abandoned when:

- No commits in 12+ months
- No response to security issues in 90+ days
- Repository archived or deleted
- Maintainer officially declares end-of-life

### Deprecation Process

1. **Assessment**: Determine if a replacement exists or the functionality can be implemented in-house.
2. **Plan**: Create a migration plan with timeline and testing strategy.
3. **Announce**: Communicate planned deprecation to the team.
4. **Replace**: Implement replacement in a feature branch.
5. **Test**: Verify replacement in integration and staging environments.
6. **Deploy**: Roll out the change.
7. **Remove**: Delete the abandoned dependency and clean up all references.

## Dependency Lifecycle Summary

```
Add Dependency
  → License check (automated)
  → Security scan (automated)
  → Code review (human)
  → Commit with exact version
  → Lockfile updated
  → CI verifies
  → Monthly patch updates
  → Quarterly minor updates
  → Vulnerability monitoring (continuous)
  → Deprecation detection (continuous)
  → Migration plan (when abandoned)
  → Removal
```
