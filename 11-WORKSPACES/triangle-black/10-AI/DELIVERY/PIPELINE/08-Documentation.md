# Stage 08: Documentation

## Purpose

Generate comprehensive documentation for the feature including API documentation, user-facing documentation, inline code docs, and release notes.

## Agent Role

**Documentation Engineer AI** — Responsible for all documentation artifacts.

## Entry Criteria

| Criterion | Description |
|-----------|-------------|
| Backend Implementation | Backend artifact with status `APPROVED` |
| Frontend Implementation | Frontend artifact with status `APPROVED` |
| Test Report | Test report artifact with status `APPROVED` |
| All Source Code | Complete feature source code is available for doc generation |

## Process

### Step 1: Generate API Documentation
- If REST: update OpenAPI spec (`openapi.yaml`) with new endpoints, request/response schemas, and examples.
- If GraphQL: update the GraphQL schema documentation with descriptions for new types, queries, and mutations.
- Verify that all API endpoints have: description, request body schema, response schema, error codes, and authentication requirements.

### Step 2: Generate Inline Documentation
- Ensure all public functions, classes, and interfaces have TSDoc comments.
- TSDoc format:
  ```typescript
  /**
   * Brief description of what this does.
   * @param paramName - description of the parameter
   * @returns description of the return value
   * @throws description of when this throws
   */
  ```
- Verify that complex business logic has explanatory comments (not obvious code).

### Step 3: Write Feature Documentation
- Create a feature guide in `docs/features/<feature>.md`.
- Include: overview, setup instructions, configuration, usage examples, and troubleshooting.
- Add screenshots or code snippets where helpful.

### Step 4: Update README (if applicable)
- If the feature adds a new top-level capability, update the project README.
- Add the feature to the feature table or list.

### Step 5: Write Release Notes
- Create a release notes entry for the upcoming release.
- Format:
  ```markdown
  ## [Unreleased]
  ### Added
  - Feature: <feature name> — <brief description> (PR #NNN)
  ### Changed
  - ...
  ### Fixed
  - ...
  ```
- Categorize changes: Added, Changed, Deprecated, Removed, Fixed, Security.

### Step 6: Verify Documentation Completeness
- Check that every module/component has a README or doc entry.
- Verify all external links in documentation resolve correctly.
- Check cross-references between documents are valid.
- Ensure documentation matches the actual implementation (no stale docs).

## Exit Criteria

| Criterion | Description |
|-----------|-------------|
| Documentation Complete | All required documentation generated and reviewed |
| OpenAPI Spec Updated | All new API endpoints documented |
| TSDoc Present | All public APIs have TSDoc comments |
| Feature Guide Written | Feature guide created in `docs/features/` |
| Release Notes Drafted | Release notes entry created for the feature |
| No Broken Links | All internal and external cross-references validated |
| Docs Match Implementation | Documentation accurately reflects current code |

## Artifact Template

```markdown
# Documentation: <Feature Title>

**Status**: APPROVED | CHANGES_REQUESTED | REJECTED

## Documentation Generated
| Document | Location | Status |
|----------|----------|--------|
| OpenAPI Spec | `docs/api/openapi.yaml` | Updated |
| Feature Guide | `docs/features/<feature>.md` | Created |
| API Docs | `docs/api/<feature>.md` | Created |
| Release Notes | `CHANGELOG.md` | Updated |

## TSDoc Coverage
- Public functions: 25/25 — 100%
- Interfaces: 8/8 — 100%
- Classes: 12/12 — 100%

## Cross-References Verified
- [x] All internal links resolve
- [x] All external links resolve
- [x] No stale documentation identified

## Notes
- API documentation includes request/response examples
- Feature guide includes setup and configuration steps
- Release notes categorize changes by type
```

## Failure Modes

| Failure | Resolution |
|---------|-----------|
| Missing TSDoc on public APIs | Add TSDoc comments to all public exports |
| OpenAPI spec incomplete | Add missing endpoint documentation |
| Broken internal links | Update cross-references to match actual file structure |
| Documentation out of sync with code | Review and align with actual implementation |
| Missing release notes | Add feature entry to CHANGELOG.md |

## Cross-References

- [05-Backend.md](./05-Backend.md)
- [06-Frontend.md](./06-Frontend.md)
- [07-Testing.md](./07-Testing.md)
- [Standards: Documentation Standards](../05-STANDARDS/Documentation-Standards.md)
