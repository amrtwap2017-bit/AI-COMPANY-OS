# Continuous Documentation

## Purpose

Documentation is generated alongside code, not after. Continuous Documentation ensures that documentation is always current, consistent, and created automatically whenever possible. By treating documentation as code and integrating it into the CI/CD pipeline, we eliminate the common problem of stale, incomplete, or missing documentation.

## Principles

| Principle | Description |
|-----------|-------------|
| **Doc as Code** | Documentation is versioned, reviewed, and deployed through the same pipeline as code |
| **Generate, Don't Write** | Prefer automated generation from source of truth (code, specs, schemas) |
| **Freshness Matters** | Stale documentation is worse than no documentation — it actively misleads |
| **Right Time, Right Place** | Documentation lives close to the code it describes (in-repo, in-code, in-API) |
| **Minimize Human Effort** | AI agents handle generation and freshness checks; humans review and validate |

## Automated Documentation Generation

### API Documentation

- **Source**: OpenAPI / Swagger specs (maintained in code).
- **Generation**: Automated conversion to HTML documentation using Redoc, Swagger UI, or equivalent.
- **Trigger**: On every merge to main.
- **Deployment**: Published to internal documentation portal.
- **Coverage target**: 100% of public endpoints documented.

### Code Documentation

- **Source**: In-code documentation (JSDoc, Javadoc, pydoc, rustdoc).
- **Generation**: Automated documentation generation tool (TypeDoc, Doxygen, Sphinx).
- **Trigger**: On every merge to main.
- **Deployment**: Published to internal documentation portal.
- **Validation**: CI check enforces that all public APIs have documentation comments.

### Changelog Generation

- **Source**: Conventional Commits (commit messages).
- **Generation**: Automated changelog generation (standard-version, semantic-release, git-cliff).
- **Trigger**: On every release (tag).
- **Output**: `CHANGELOG.md` updated automatically.
- **Format**: Groups by type (feat, fix, breaking change) and scope.

### Architecture Decision Records (ADRs)

- **Source**: ADR template in repository at `docs/adr/`.
- **Trigger**: When an architecturally significant decision is made.
- **Format**: Numbered, date-stamped, with context, decision, and consequences.
- **Review**: Part of the PR that implements the decision.

### README and Onboarding

- **Source**: Partial auto-generation from project metadata (package.json, pyproject.toml, Cargo.toml).
- **AI agent role**: Suggests updates to README when project configuration changes (new dependencies, changed entry points).
- **Validation**: CI checks for broken links in README.

## Documentation Freshness Checks

Documentation freshness is verified automatically in the CI/CD pipeline:

### Freshness Check Rules

| Rule | Description | Action on Failure |
|------|-------------|-------------------|
| **API spec matches implementation** | OpenAPI spec is compared against route definitions in code | Warning on PR. Block if > 3 endpoints undocumented |
| **Changelog is up to date** | Latest release tag matches latest changelog entry | Block release if changelog not updated |
| **README links are valid** | All external and internal links are checked | Warning on PR |
| **Deprecated features documented** | Deprecated APIs have deprecation notices in docs | Warning on PR |
| **New modules have README** | Every new package/module directory has a README | Block PR |
| **No orphaned docs** | Documentation files that reference deleted code are flagged | Weekly report |

### Staleness Detection

- **Age-based flagging**: Documentation files with no commits in 90 days are flagged for review.
- **Code proximity check**: Documentation is compared against the code it describes. If the code has changed significantly and the docs have not, the docs are flagged as potentially stale.
- **Ownership notification**: The original author or team is automatically notified of potentially stale documentation.

## Documentation in CI/CD

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Commit    │ ──→ │  CI Build   │ ──→ │ Doc Generation │
│  (code +    │     │  (pass)     │     │ (API, changelog,│
│   doc src)  │     │             │     │  ADR index)     │
└─────────────┘     └─────────────┘     └───────┬─────────┘
                                                │
                                                ▼
                                        ┌─────────────┐
                                        │ Freshness   │
                                        │ Check       │
                                        └───────┬─────┘
                                                │
                        ┌───────────────────────┼───────────────┐
                        │                       │               │
                        ▼                       ▼               ▼
                ┌─────────────┐         ┌─────────────┐ ┌─────────────┐
                │  Deploy to  │         │  Deploy to  │ │  Flag stale │
                │  Doc Portal │         │  Changelog  │ │  docs       │
                └─────────────┘         └─────────────┘ └─────────────┘
```

## AI Agent Role in Documentation

| Activity | AI Agent | Human |
|----------|----------|-------|
| API doc generation | Automated from OpenAPI | Reviews and approves |
| Changelog generation | Automated from commits | Edits for readability |
| Inline code comments | Suggests comments for complex code | Validates accuracy |
| README updates | Suggests changes based on code diffs | Reviews and edits |
| Freshness checks | Automated scanning and flagging | Reviews flagged items |
| ADR drafting | Drafts ADR from PR description | Reviews and approves |

## Documentation Types and Lifecycle

| Type | Source of Truth | Generated | Reviewed | Published |
|------|----------------|-----------|----------|-----------|
| API documentation | OpenAPI spec | On merge | Automated | Doc portal |
| Code comments | In-code annotations | On merge | PR review | In-code |
| Changelog | Conventional commits | On release | Manual edit | Repository |
| README | Repository root | On change | PR review | Repository |
| Architecture decisions | ADR files | On decision | PR review | Repository |
| Runbooks | Operations docs | On change | Peer review | Doc portal |
| User guides | Product docs | On feature release | Product review | Help center |
