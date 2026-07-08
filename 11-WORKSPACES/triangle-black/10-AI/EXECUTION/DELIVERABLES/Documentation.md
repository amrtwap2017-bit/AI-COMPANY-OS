# Documentation Deliverable Contract

## Purpose

Ensure that all documentation accompanying code changes is complete, accurate, and useful for both current and future stakeholders.

## Requirements

### 1. API Endpoints Documented

- Every REST, GraphQL, or RPC endpoint must be documented.
- Documentation must include:
  - HTTP method and URL path
  - Request body schema
  - Response body schema
  - Query parameters (if any)
  - Path parameters (if any)
  - Authentication requirements
  - Rate limit information
  - Error response formats and status codes
- API documentation must be auto-generated or maintained in sync with the code.

### 2. README Updated

- The project README must reflect the current state of the application.
- Sections to verify:
  - Project description and purpose
  - Prerequisites and dependencies
  - Setup and installation instructions
  - Configuration and environment variables
  - Running locally (development)
  - Running tests
  - Building for production
  - Deployment instructions
  - Contributing guidelines (if applicable)

### 3. Architecture Decisions Documented

- Any new architecture decision must be recorded in an Architecture Decision Record (ADR).
- ADR format: Title, Context, Decision, Consequences, Status.
- Changes to existing architecture decisions must update the relevant ADR.
- ADRs are stored in the project repository under `docs/adr/`.

### 4. Changelog Entry Added

- Every deliverable must include a changelog entry.
- Changelog sections: Added, Changed, Deprecated, Removed, Fixed, Security.
- Each entry must reference the issue or ticket ID.
- Changelog follows the Keep a Changelog format.

### 5. Inline Comments for Complex Logic

- Inline comments are required for:
  - Non-obvious algorithms or business logic
  - Workarounds or temporary solutions (with a linked issue for removal)
  - Performance-critical sections
  - Security-sensitive operations
- Comments must explain *why*, not *what* (the code itself documents *what*).
- Outdated comments must be updated or removed.

### 6. Traceability Metadata in Frontmatter

- Documentation files must include YAML frontmatter with:
  - `title`: Document title
  - `date`: Last modified date
  - `author`: Document author
  - `status`: draft, reviewed, approved, deprecated
  - `version`: Document version
  - `ticket`: Linked requirement or issue ID

### 7. Diagrams and Visuals

- Architecture diagrams must use a standardized notation (C4, UML, etc.).
- Diagram source files must be committed alongside generated images.
- Diagrams must be updated when the corresponding architecture changes.

## Verification

| Check | Tool/Method | Pass/Fail |
|---|---|---|
| API documentation | Spec validation | Pass |
| README accuracy | Manual review | Pass |
| ADR presence | File check | Pass |
| Changelog entry | File check | Pass |
| Frontmatter completeness | Lint check | Pass |
| Diagram consistency | Architecture review | Pass |

## Non-Compliance

Incomplete or outdated documentation is a blocking issue. The deliverable cannot be considered done until all documentation requirements are met. Documentation debt must be tracked alongside technical debt.
