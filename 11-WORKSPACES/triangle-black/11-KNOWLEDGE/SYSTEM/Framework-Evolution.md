# Framework Evolution

## Overview

The Enterprise AI Delivery Framework (EADF) is itself a product that evolves through structured versioning, controlled updates, and continuous improvement. This document defines how the framework changes over time, how changes are managed, and how compatibility is maintained.

---

## Versioning Strategy

The EADF follows **Semantic Versioning 2.0.0** with an EADF-specific scope:

```
EADF v<MAJOR>.<MINOR>.<PATCH>
```

| Component | Scope | Example |
|-----------|-------|---------|
| MAJOR | Breaking changes to directory structure, required artifacts, role definitions, or lifecycle | `2.0.0` |
| MINOR | New optional artifacts, new ceremonies, new templates, non-breaking additions | `1.3.0` |
| PATCH | Clarifications, error corrections, formatting, minor template updates | `1.2.1` |

### Version Examples

| Version | Change | Type |
|---------|--------|------|
| 1.0.0 | Initial EADF release | — |
| 1.1.0 | Added Anti-Patterns knowledge category | Minor |
| 1.1.1 | Fixed Sprint Template checklist formatting | Patch |
| 2.0.0 | Restructured directory layout, changed role names | Major |

---

## Version Catalog

| Version | Date | Summary |
|---------|------|---------|
| 1.0.0 | 2026-01-15 | Initial EADF release |
| 1.1.0 | 2026-03-01 | Added Anti-Patterns, expanded Prompt Library |
| 1.2.0 | 2026-04-15 | Added Best Practices, Framework Evolution docs |
| 1.3.0 | 2026-06-01 | Added Sprint 0 definition, refined lifecycle phases |
| 2.0.0 | 2026-Q3 (planned) | Role renaming, pipeline stage restructuring |

---

## Update Process

### Types of Updates

| Type | Approval | Timeline | Communication |
|------|----------|----------|---------------|
| Patch | ADL + TAL | Within 1 day | Slack notification |
| Minor | ADL + TAL + Team | Within 1 week | Sprint review demo |
| Major | ADL + TAL + Team + Stakeholders | Within 1 month | Release announcement + migration guide |

### Step-by-Step Update Process

1. **Proposal**: Document the proposed change. Include rationale, impact assessment, and migration requirements.
2. **Review**: ADL and TAL review the proposal. For major changes, involve the full team and stakeholders.
3. **Approval**: Based on type (see table above), obtain necessary approvals.
4. **Implementation**: Make the change in a dedicated branch following the directory structure conventions.
5. **Validation**: Verify the change works correctly. For breaking changes, run a dry-run migration on a test project.
6. **Documentation**: Update changelog, version number, and migration guide.
7. **Release**: Merge to main branch. Tag the release with version number.
8. **Communication**: Announce to all teams using the EADF. Provide migration guide and support period.

---

## Change Management

### Change Categories

| Category | Description | Examples |
|----------|-------------|----------|
| Artifact change | Add, modify, or remove framework artifacts | New sprint template field, removed deprecated log format |
| Role change | Add, modify, or remove roles | New agent role, updated responsibilities |
| Process change | Modify lifecycle phases or ceremonies | Changed retro format, new coordination point |
| Standard change | Update conventions, quality criteria, or definitions | Updated Definition of Ready, new naming convention |
| Tooling change | Modify required or recommended tools | New CI platform, different agent configuration format |
| Structural change | Directory layout, file organization | Moved prompt templates, renamed directories |

### Change Request Template

```markdown
---
title: <Change Title>
type: artifact | role | process | standard | tooling | structural
impact: low | medium | high | breaking
requester: @name
date: YYYY-MM-DD
status: proposed | approved | in-progress | completed | rejected
---

## Proposal

<Description of the proposed change>

## Rationale

<Why this change is needed>

## Impact Assessment

- Teams affected: <count>
- Artifacts affected: <list>
- Migration effort: <estimated effort>
- Backward compatibility: <yes/no with conditions>

## Migration Guide

<Step-by-step instructions for adopting this change>

## Rollback Plan

<How to revert this change if issues arise>
```

---

## Deprecation Policy

### Deprecation Lifecycle

```
Active → Deprecated → Sunset → Archived
```

| Status | Definition | Duration | Action Required |
|--------|------------|----------|-----------------|
| Active | Current recommended version | Until deprecated | Use for all new work |
| Deprecated | Superseded but still functional | 2 minor releases or 1 major release | Plan migration; do not use for new projects |
| Sunset | No longer supported | 1 minor release after deprecation | Must migrate; warnings appear |
| Archived | Removed from active framework | Permanent | Historical reference only |

### Deprecation Notices

- Deprecation announcements are made at least 1 major version before removal
- Deprecated features are documented in the changelog with migration path
- Sunset features produce warnings in CI or during setup
- Archived features are moved to a `deprecated/` directory within the framework

### Example Deprecation Schedule

| Feature | Deprecated In | Sunset In | Archived In |
|---------|---------------|-----------|-------------|
| Legacy sprint log format | v1.2.0 | v1.3.0 | v2.0.0 |
| Old agent manifest schema | v1.3.0 | v2.0.0 | v2.1.0 |

---

## Compatibility Rules

### Backward Compatibility

- **Patch and minor versions**: Must be backward compatible within the same major version
- **Major versions**: May break backward compatibility with documented migration path
- **Template compatibility**: Sprint templates from older versions must be convertible to newer versions with documented steps
- **Agent configuration**: Agent manifests should remain valid across minor version bumps

### Forward Compatibility

- **Reading future formats**: Framework tools should gracefully handle unknown fields in configuration files
- **Graceful degradation**: If a newer artifact is not understood, the framework should fall back to a reasonable default
- **Explicit version declaration**: All framework components declare the EADF version they target

### Cross-Team Compatibility

- All teams within a program must use the same major version
- Teams may be on different minor versions within the same program
- Cross-team artifacts (shared prompts, shared patterns) must target the lowest common version

---

## Release Process

### Release Checklist

- [ ] Changelog updated with all changes since last release
- [ ] Version number updated in `VERSION` file and all references
- [ ] Migration guide written (if applicable)
- [ ] All documentation is current
- [ ] Breaking changes documented with justification
- [ ] Deprecation notices included (if applicable)
- [ ] Release tagged in repository (e.g., `v1.3.0`)
- [ ] Release notes published to team communication channel
- [ ] Migration support period communicated

### Release Artifacts

| Artifact | Description |
|----------|-------------|
| Release tag | Git tag with version number |
| Changelog entry | Summary of changes, migration notes |
| Release notes | Detailed description of new features, fixes, breaking changes |
| Migration guide | Step-by-step upgrade instructions (for major/minor breaking changes) |
| Updated templates | Any template files that changed in this release |

---

## Version History Archive

The complete version history is maintained in the repository's `CHANGELOG.md` file. Each entry includes:

- Version number and release date
- Summary of changes
- Migration instructions (if any)
- Credits to contributors
- Link to the release tag

---

## Continuous Framework Improvement

The EADF is improved through the same mechanisms it prescribes:

- **Sprint retrospectives** identify framework improvements
- **Lessons learned** inform framework updates
- **Patterns and anti-patterns** are incorporated as they are documented
- **Prompt library** evolves with each sprint's experience
- **Best practices** are updated based on empirical evidence

This ensures the framework remains relevant, effective, and aligned with real-world experience.
