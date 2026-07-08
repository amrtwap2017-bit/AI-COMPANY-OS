# 09 — Documentation Evolution

> Engineering documentation evolution.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 4 — Engineering-Handbook.md | Documentation baseline |

## Documentation Principles

1. **Document as code** — Docs in repo, versioned, reviewed
2. **Single source of truth** — One authoritative location per topic
3. **Keep it current** — Outdated docs worse than no docs
4. **Write for the reader** — Clear, concise, practical
5. **Automate where possible** — API docs from code, changelog from commits

## Documentation Types

| Type | Location | Format | Owner | Update Cadence |
|------|----------|--------|-------|---------------|
| README | Per repo | Markdown | Developer | On change |
| API docs | OpenAPI spec | YAML | Engineering | On API change |
| Architecture docs | /docs | Markdown + diagrams | CTO | Quarterly |
| Runbooks | /docs/ops | Markdown | DevOps | On process change |
| Onboarding guide | /docs | Markdown | Engineering | Quarterly |
| Contribution guide | CONTRIBUTING.md | Markdown | Engineering | On process change |
| Changelog | CHANGELOG.md | Markdown | All | On release |
| Internal wiki | GitHub Wiki | Markdown | All | Continuous |

## Documentation Automation

| Automation | Tool | Trigger |
|------------|------|---------|
| API docs generation | openapi-generator | On OpenAPI spec change |
| Changelog generation | git-cliff | On release |
| Architecture diagrams | Mermaid in markdown | On edit |
| README badges | Shields.io | CI |
| Doc validation | markdownlint, link checker | CI on PR |

## Documentation Standards

| Standard | Requirement |
|----------|-------------|
| Language | English (Arabic translations in H2) |
| Format | Markdown (CommonMark) |
| Diagrams | Mermaid (preferred) |
| Code examples | TypeScript (primary), Python (secondary) |
| Links | Relative links within repo |
| Versioning | docs/ directory mirrors code versions |

## Documentation Metrics

| Metric | Current | H1 Target |
|--------|---------|-----------|
| Documentation coverage | — | > 80% of modules |
| Documentation freshness | — | < 30 days since last update |
| Broken link count | — | 0 |
| API documentation coverage | — | 100% of public endpoints |
| Developer satisfaction with docs | — | 4/5 |
