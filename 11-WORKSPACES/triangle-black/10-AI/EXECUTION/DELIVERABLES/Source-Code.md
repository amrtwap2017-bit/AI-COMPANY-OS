# Source Code Deliverable Contract

## Purpose

Ensure that all source code produced meets organizational quality standards, is maintainable, and is verifiable through automated tooling.

## Language Agnostic

This contract applies to all programming languages used within the organization. Language-specific standards are maintained in each team's coding standards document.

## Requirements

### 1. Code Compilation / Interpretation

- Code must compile without errors (compiled languages) or pass syntax validation (interpreted languages).
- Zero compiler warnings in production code. Warnings in test code must be justified.
- Build must succeed within the project's CI pipeline.

### 2. Linting and Static Analysis

- All code must pass configured linter rules without violations.
- Static analysis tools must report zero critical or high-severity findings.
- Linting configuration files must be checked into version control.
- Linting must be run as part of the pre-commit or CI pipeline.

### 3. Coding Standards

- Code must follow the project's established style guide.
- Naming conventions (PascalCase, camelCase, snake_case, etc.) must be consistent with the project convention.
- File organization must follow the project's directory structure conventions.
- Maximum line length, indentation, and formatting must comply with project configuration.

### 4. Traceability Metadata

- Every source file must include a header comment with:
  - File purpose description
  - Creation date
  - Author
  - Linked requirement or story ID
- Git commit messages must reference the issue or ticket ID.

### 5. Documented Public API

- All public functions, classes, methods, and modules must have doc comments.
- Doc comments must describe:
  - Purpose of the entity
  - Parameters and their types
  - Return values
  - Exceptions or error states
  - Usage examples (where complex)
- Private/internal functions should have inline comments explaining non-obvious logic.

### 6. No Secrets Committed

- No hardcoded credentials, API keys, tokens, passwords, or connection strings in source code.
- Secrets must use environment variables, secret management services, or encrypted configuration files.
- A `.gitignore` or equivalent must prevent accidental commits of secret files.
- Pre-commit hooks or CI scanning must detect and block secret leakage.

### 7. Error Handling

- All error states must be handled explicitly. No silent exception swallowing.
- Error messages must be user-actionable where applicable.
- Logging must include sufficient context for debugging without exposing sensitive data.

### 8. Dependencies

- All third-party dependencies must be declared in the project's dependency manifest.
- Dependency versions must be pinned or locked to reproducible builds.
- No deprecated or end-of-life dependencies without an approved exception.

## Verification

Verification is performed by the CI pipeline and automated code review tooling:

| Check | Tool/Method | Pass/Fail |
|---|---|---|
| Compilation | Build system | Pass |
| Linting | Linter | Pass |
| Static analysis | SAST tool | Pass |
| Secrets scan | Secret scanner | Pass |
| Dependency audit | Dependency checker | Pass |
| Code review | Human + AI review | Pass |

## Non-Compliance

Code that fails any verification check is blocked from merging. The developer must address all issues and re-run verification before the code can proceed.
