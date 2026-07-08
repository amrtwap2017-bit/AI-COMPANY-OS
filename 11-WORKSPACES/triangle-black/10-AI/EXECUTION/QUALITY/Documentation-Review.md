# Documentation Review Gate

## Gate Keeper

**Documentation Engineer AI** — Automated documentation review that validates completeness, accuracy, and consistency of all documentation artifacts.

## When Triggered

This gate is triggered for:

- **Every feature delivery**: Documentation must accompany every feature.
- **API changes**: API documentation must be updated.
- **Architecture changes**: Architecture documentation must be updated.
- **Every release**: Release notes and changelog must be complete.

## Review Criteria

### 1. API Documentation Updated

- OpenAPI spec or equivalent is updated for all API changes.
- New endpoints are documented with request/response schemas.
- Modified endpoints have their documentation updated.
- Deprecated endpoints are marked with sunset dates.
- Example requests and responses are included.

### 2. README Current

- The project README accurately reflects the current state.
- Setup instructions work with the current version.
- Prerequisites and dependencies are up to date.
- Configuration and environment variables are documented.
- Quick start guide is tested and accurate.

### 3. Architecture Documentation Consistent

- C4 diagrams match the current architecture.
- ADRs are created for new architecture decisions.
- ADRs are updated for changes to existing decisions.
- Module dependency documentation is accurate.
- Integration point documentation is up to date.

### 4. Changelog Entry Present

- A changelog entry exists for the change.
- The entry is in the correct section (Added, Changed, Fixed, etc.).
- The entry references the issue or ticket ID.
- The entry is descriptive enough for stakeholders to understand.

### 5. Release Notes Written

- Release notes are drafted and complete.
- All sections are present (features, fixes, breaking changes, etc.).
- Breaking changes have migration guides.
- Known issues are documented.
- Upgrade instructions are clear and actionable.

### 6. Inline Documentation Adequate

- Public API surfaces have doc comments.
- Complex algorithms or business logic have inline explanations.
- TODOs reference tickets.
- No outdated or misleading comments exist.

### 7. Documentation Quality

- Documentation is written in clear, professional language.
- Spelling and grammar are correct.
- Terminology is consistent with project conventions.
- Code examples are syntactically correct.
- Links are valid and not broken.

### 8. Frontmatter and Metadata

- Every documentation file has complete YAML frontmatter:
  - `title`: Document title
  - `date`: Last modified date
  - `author`: Document author
  - `status`: Document status
  - `version`: Document version
  - `ticket`: Linked issue ID

## Review Process

1. Change is submitted with all documentation artifacts.
2. Documentation Engineer AI runs automated checks (frontmatter validation, link checking, spell checking, format validation).
3. Automated comparison checks ensure docs match implementation (API spec vs. actual API behavior).
4. Documentation completeness is validated against the documentation checklist.
5. Issues are flagged and reported to the developer.
6. For critical documentation gaps, human documentation lead may perform additional review.

## Gate Output

- **Approved**: Documentation is complete and accurate.
- **Conditional Pass**: Minor documentation issues found; must be fixed before release.
- **Failed**: Significant documentation gaps or inaccuracies.
- **Blocked**: Critical documentation missing (e.g., missing API docs for a new public endpoint).

## Documentation Checklist

- [ ] API documentation updated
- [ ] README current
- [ ] Architecture diagrams consistent
- [ ] ADR created or updated
- [ ] Changelog entry present
- [ ] Release notes complete
- [ ] Inline documentation adequate
- [ ] Frontmatter complete
- [ ] No broken links
- [ ] Spelling and grammar reviewed

## Non-Compliance

Documentation failures block the release. Missing or inaccurate documentation must be corrected before the gate can pass. Documentation-only patches can be submitted after release if approved.
