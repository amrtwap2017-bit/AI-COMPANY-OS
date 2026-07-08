# Documentation Prompts — Enterprise AI Delivery Framework

> **Framework:** AI Constitution v1.0
> **Model Requirement:** All prompts are model-agnostic.
> **Context Injection Point:** `[INSERT DOMAIN CONTEXT — business glossary, system architecture, organizational chart]`
> **Output Format:** Each documentation prompt produces a markdown document(s) with traceability.

---

## 1. Generate API Documentation

**Prompt:**
```
You are acting as a Technical Writer operating under the AI Constitution.
Generate API documentation for the following endpoint(s):

Endpoint(s): [INSERT ENDPOINT PATHS OR CONTROLLER FILES]
API Specification: [INSERT OPENAPI SPEC / CODE LOCATION]
User Story: [INSERT US-XXX]
Target Audience: [Developers integrating with the API]

Documentation Requirements:
- Endpoint URL and HTTP method
- Request headers (authentication, content type, idempotency)
- Path, query, and body parameters with types and descriptions
- Request body schema (JSON example)
- Response body schema with all fields described
- HTTP status codes and error response format
- Authentication and authorization requirements
- Rate limiting information
- Code examples in [INSERT LANGUAGE(S)] — cURL, TypeScript, Python
- Pagination (if applicable)

Structure:
```markdown
# [Resource Name] API

## [Endpoint Name]
`[METHOD /api/v[version]/[resource]]`

### Request
- Headers
- Parameters
- Body

### Response
- Success ([status code])
- Errors

### Examples
[Code snippets]

### Rate Limiting
```

Output Format:
- Markdown file(s) in the docs/api directory
- Include at least one request/response example per endpoint
- Link to related API specifications
- Traceability to [US-XXX] / [API-XXX]

Governance Reference (AI Constitution):
- Article IV: Traceability — API documentation enables client integration
- Article VIII: Transparency — documentation must be accurate and accessible
```

## 2. Write README

**Prompt:**
```
You are acting as a Technical Writer operating under the AI Constitution.
Write a README for the following project / module:

Project / Module: [INSERT PROJECT OR MODULE NAME]
Repository: [INSERT REPOSITORY URL]
Language / Framework: [INSERT]
Related User Stories: [INSERT US-XXX]

README Sections Required:
1. **Title & Badges** — Project name, build status, coverage, license
2. **Description** — What does this project do? Why does it exist?
3. **Prerequisites** — Required tools, runtime versions, dependencies
4. **Installation** — Step-by-step setup instructions
5. **Configuration** — Environment variables, config files
6. **Usage** — How to run, key commands, examples
7. **Development** — How to contribute, run tests, lint, build
8. **Project Structure** — Directory layout explanation
9. **API Overview** — Brief API reference (or link to full API docs)
10. **Deployment** — Deployment instructions, Docker, CI/CD
11. **Contributing** — How to contribute, coding standards, PR process
12. **License** — License information

Tone: Professional, clear, developer-friendly. Assume reader is familiar with the technology stack but new to this specific project.

Output Format:
- README.md file
- Badge images for build status, test coverage
- Links to related documentation
- Traceability to [US-XXX] / [EPIC-XXX]

Governance Reference (AI Constitution):
- Article IV: Traceability — README provides entry point to project
- Article VIII: Transparency — documentation enables understanding
```

## 3. Create Changelog

**Prompt:**
```
You are acting as a Technical Writer operating under the AI Constitution.
Create a changelog for the following release:

Release Version: [INSERT VERSION — e.g., v2.1.0]
Release Date: [INSERT DATE]
Repository: [INSERT REPOSITORY URL]
Git Log / Commits: [INSERT GIT LOG RANGE — e.g., main...release/v2.1.0]
Related User Stories: [INSERT US-XXX SERIES]

Changelog Format (Keep a Changelog standard):
```markdown
# Changelog

## [v2.1.0] - YYYY-MM-DD

### Added
- [New feature] ([US-XXX])
- [New feature] ([US-XXX])

### Changed
- [Change description] ([US-XXX])

### Deprecated
- [Deprecated feature] ([US-XXX])

### Removed
- [Removed feature] ([US-XXX])

### Fixed
- [Bug fix description] ([BUG-XXX])

### Security
- [Security fix description] ([BUG-XXX])
```

Requirements:
- Group changes by type: Added, Changed, Deprecated, Removed, Fixed, Security
- Link each entry to the corresponding user story, bug report, or PR
- Write entries in present tense, imperative mood ("Add", not "Added")
- Include migration notes for breaking changes
- Credit contributors where applicable

Output Format:
- CHANGELOG.md file (append to existing or create new)
- Traceability to [US-XXX], [BUG-XXX], [PR-XXX]

Governance Reference (AI Constitution):
- Article IV: Traceability — changelog tracks all notable changes
- Article VIII: Transparency — changelog communicates change history
```

## 4. Document Architecture Decision

**Prompt:**
```
You are acting as an Enterprise Architect operating under the AI Constitution.
Document the following architecture decision:

Decision: [INSERT DECISION — e.g., "Adopt PostgreSQL over MongoDB for order management"]
Context: [INSERT CONTEXT — problem, constraints, forces]
Decision Maker(s): [INSERT NAMES]
Date: [INSERT DATE]
Related Requirements: [INSERT REQ-XXX]

ADR Template (from 06-TEMPLATES/ADR-Template.md):
- **Title:** [Concise decision title]
- **Status:** [Proposed / Accepted / Deprecated]
- **Context:** [Problem description, forces, constraints, background]
- **Decision:** [Clear statement of the chosen approach]
- **Consequences:** [Positive and negative trade-offs]
- **Alternatives Considered:** [Options with pros/cons, rejection reasons]
- **References:** [Links to supporting documents, RFCs, experiments]

Documentation Depth:
- Provide enough context for someone new to the project to understand the decision
- Be objective — present alternatives fairly
- Quantify trade-offs where possible (cost, performance, complexity)
- Include experimental results or POC findings if available

Output Format:
- ADR file in docs/adr/ directory (e.g., docs/adr/ADR-042-adopt-postgresql.md)
- Link to the ADR in the ADR index
- Traceability to [REQ-XXX] and any related ADRs

Governance Reference (AI Constitution):
- Article IV: Traceability — architecture decisions are documented and linked to requirements
- Article VIII: Transparency — decision rationale is transparent and accessible
```

## 5. Write Release Notes

**Prompt:**
```
You are acting as a Technical Writer operating under the AI Constitution.
Write release notes for the following release:

Release Version: [INSERT VERSION]
Release Date: [INSERT DATE]
Target Audience: [INSERT — e.g., "Internal stakeholders" / "External customers"]
Changelog: [INSERT LINK TO CHANGELOG]
Key Features: [INSERT LIST OF KEY FEATURES]
Known Issues: [INSERT LIST OF KNOWN ISSUES / LIMITATIONS]

Release Notes Structure:
```markdown
# Release Notes — [Project Name] v[version]

## Overview
[Brief summary of the release, its significance, and business value]

## What's New
### [Feature Name]
[Description of the feature, its benefits, and how to use it]
*Related: [US-XXX]*

### [Feature Name]
[Description of the feature, its benefits, and how to use it]
*Related: [US-XXX]*

## Improvements
- [Improvement description] ([US-XXX])
- [Improvement description] ([US-XXX])

## Bug Fixes
- [Bug fix description] ([BUG-XXX])
- [Bug fix description] ([BUG-XXX])

## Breaking Changes
- [Describe breaking change and migration steps]

## Deprecations
- [List deprecated features and alternatives]

## Known Issues
- [Issue description and workaround]

## Upgrade Instructions
[Step-by-step upgrade instructions]
```

Tone: Professional, positive, customer-focused. Highlight business value, not technical implementation details.

Output Format:
- Release notes markdown file
- Post to [INSERT COMMUNICATION CHANNELS] (optional)
- Traceability to [US-XXX], [BUG-XXX], [PR-XXX]

Governance Reference (AI Constitution):
- Article I: Value Delivery — release notes communicate delivered value
- Article VIII: Transparency — release notes inform stakeholders
```

## 6. Update Glossary

**Prompt:**
```
You are acting as a Technical Writer operating under the AI Constitution.
Update the project glossary with the following new or modified terms:

New Terms: [INSERT LIST OF NEW TERMS]
Modified Terms: [INSERT LIST OF EXISTING TERMS WITH UPDATED DEFINITIONS]
Source Documents: [INSERT LIST OF DOCUMENTS TO EXTRACT TERMS FROM]
Existing Glossary: [INSERT LINK TO EXISTING GLOSSARY FILE]

Glossary Format:
```markdown
# Glossary

| Term | Definition | Category | Source / Context |
|---|---|---|---|
| **[Term name]** | [Clear, concise definition] | [Business / Technical / Domain] | [Link or reference where this term is defined] |
```

Requirements:
- Define each term in a clear, concise manner (1-3 sentences)
- Avoid circular definitions (do not use the term in its own definition)
- Include acronym expansion (e.g., "API (Application Programming Interface)")
- Add category tags for filtering (Business, Technical, Domain)
- Reference the source document or requirement for traceability
- Remove deprecated terms with a note

Quality Standards:
- Consistent terminology across all project documentation
- Acronyms defined at first use in every document
- Definitions reviewed with domain experts
- Glossary is the single source of truth for project terminology

Output Format:
- Updated glossary file
- Summary of additions, modifications, and removals
- Traceability to source documents / [REQ-XXX]

Governance Reference (AI Constitution):
- Article IV: Traceability — consistent terminology enables traceability
- Article VIII: Transparency — glossary ensures shared understanding
```
