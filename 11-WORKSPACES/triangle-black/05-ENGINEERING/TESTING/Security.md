# Security Testing

| Field | Value |
|---|---|
| Document ID | 19-Testing-06 |
| Document Purpose | Define security testing practices: dependency scanning, SAST, secret scanning |
| Version | 1.0 |
| Status | Approved |

## Approach

Security testing is integrated into the CI/CD pipeline at multiple stages:

```
[Commit] -> [Secret Scanning] -> [Dependency Audit] -> [SAST] -> [PR Merge] -> [Deploy] -> [DAST]
```

## Dependency Scanning

### npm audit

Run on every commit / PR:

```bash
npm audit --audit-level=high
```

Fail CI if any vulnerability with severity `high` or `critical` is found.

### Dependabot

- Enabled on GitHub repository
- Weekly scan for vulnerable dependencies
- Auto-creates PRs for patch upgrades
- Auto-approves and merges patch-level security fixes

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
    open-pull-requests-limit: 10
    labels:
      - 'dependencies'
      - 'security'
```

### Manual Review

- Major dependency upgrades reviewed by tech lead
- New dependencies evaluated for maintenance status, license, and security history
- Lockfile (`package-lock.json`) must be committed and reviewed

## SAST (Static Application Security Testing)

### CodeQL

GitHub CodeQL runs automatically on every push and PR:

```yaml
# .github/workflows/codeql.yml
name: CodeQL

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 6 * * 1'  # Weekly on Monday

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    strategy:
      fail-fast: false
      matrix:
        language: ['javascript-typescript']
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          queries: security-and-quality
      - uses: github/codeql-action/analyze@v3
```

### ESLint Security Rules

```bash
npm install --save-dev eslint-plugin-security
```

Configure in `.eslintrc.js`:

```javascript
module.exports = {
  plugins: ['security'],
  extends: ['plugin:security/recommended'],
  rules: {
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-object-injection': 'warn',
  },
};
```

## Secret Scanning

### Pre-Commit Hook

Use `husky` + `lint-staged` with `secretlint` or `talisman` to detect secrets before commit:

```bash
npm install --save-dev @secretlint/secretlint-format-tty @secretlint/secretlint-formatter
```

```json
// .secretlintrc.json
{
  "rules": [
    {
      "id": "@secretlint/secretlint-rule-preset-recommend"
    }
  ]
}
```

### GitHub Secret Scanning

GitHub Advanced Security scans the repository for known secret patterns:

- AWS keys, Azure keys, GCP keys
- GitHub tokens, npm tokens
- Private keys (RSA, DSA, ECDSA)
- JWT secrets, connection strings

## OWASP Top 10 Coverage

| OWASP Category | Mitigation | Test Method |
|---|---|---|
| A1: Broken Access Control | Auth guards, RBAC | Integration tests |
| A2: Cryptographic Failures | HTTPS, secure secrets | CodeQL, config review |
| A3: Injection | Prisma parameterized queries, input validation | ESLint, CodeQL |
| A4: Insecure Design | Threat modeling, design review | Architecture review |
| A5: Security Misconfiguration | Config validation at startup | Integration tests |
| A6: Vulnerable Components | Dependabot, npm audit | Automated |
| A7: Auth Failures | JWT validation, rate limiting | Integration tests |
| A8: Data Integrity Failures | Input validation, CSP headers | CodeQL, integration |
| A9: Logging Failures | Structured logging, no secrets in logs | Code review |
| A10: SSRF | URL validation, allowlist | CodeQL, code review |

## Dependency Audit Thresholds

| Severity | Action | Merge Block |
|---|---|---|
| Critical | Block merge, fix immediately | Yes |
| High | Block merge, fix within 48 hours | Yes |
| Moderate | Create ticket, fix in current sprint | No |
| Low | Log, review monthly | No |

## Cross-References

- [15-Security/](../15-Security/) — Security architecture and policies
- [17-Engineering/CI-CD.md](../17-Engineering/CI-CD.md) — CI pipeline for security checks
- [17-Engineering/Coding-Standards.md](../17-Engineering/Coding-Standards.md) — Secure coding practices
