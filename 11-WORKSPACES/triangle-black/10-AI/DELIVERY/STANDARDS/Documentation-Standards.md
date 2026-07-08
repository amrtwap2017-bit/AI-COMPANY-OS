# Documentation Standards

## Documentation Philosophy

Documentation is a first-class deliverable in this framework. Every feature requires complete documentation covering API contracts, architecture decisions, user guidance, and operational procedures.

## Required Frontmatter

Every documentation file must include YAML frontmatter:

```markdown
---
title: <Document Title>
type: guide | reference | decision | release | operations
status: draft | review | published | deprecated
created: YYYY-MM-DD
updated: YYYY-MM-DD
version: <semver>
applies_to: <component or feature>
---
```

## Documentation Structure

### File Organization

```
docs/
  README.md                    ← Documentation index
  features/
    <feature-name>.md          ← Feature guides
  api/
    openapi.yaml               ← OpenAPI specification
    <service>.md               ← Service-specific API docs
  adr/
    ADR-001-title.md           ← Architecture Decision Records
    ADR-002-title.md
  guides/
    getting-started.md         ← Onboarding guide
    deployment.md              ← Deployment procedures
    development.md             ← Local development setup
  operations/
    runbooks/
      <feature>-runbook.md     ← Operational runbooks
    monitoring.md              ← Monitoring & alerting docs
  releases/
    v<major>.<minor>.<patch>.md ← Release notes
```

## Cross-References

- Use relative links between documentation files.
- Link to the relevant code files when discussing implementation.
- Use backlinks in ADRs to reference related decisions.
- Every feature document must link back to its requirement and architecture spec.

```markdown
For implementation details, see [Order Entity](../src/domains/orders/domain/entities/order.entity.ts).

This feature is described in [ADR-042: Event Sourcing for Orders](../adr/ADR-042-event-sourcing-orders.md).
```

## API Documentation

### OpenAPI Specification
- **Format**: OpenAPI 3.1, YAML.
- **Location**: `docs/api/openapi.yaml`.
- Every endpoint must include:
  - `summary` (one-line description).
  - `description` (paragraph-level explanation).
  - Request/response schemas with `$ref` to components.
  - Example values for request bodies and responses.
  - Error response schemas for 4xx and 5xx responses.
  - Security requirements.

### Inline API Comments (TSDoc)
- Every public function, class, interface, and type must have TSDoc comments.
- Use `@param`, `@returns`, `@throws`, and `@example` tags.

```typescript
/**
 * Creates a new order with the specified items.
 *
 * @param dto - The order creation payload containing items and shipping info.
 * @returns The created order entity with generated ID and current status.
 * @throws {ValidationError} When items array is empty or quantities are invalid.
 * @throws {ProductNotFoundError} When a referenced product does not exist.
 *
 * @example
 * const order = await createOrderUseCase.execute({
 *   items: [{ productId: "prod-123", quantity: 2 }],
 * });
 */
async execute(dto: CreateOrderDTO): Promise<OrderResponse>;
```

## README Requirements

Every module, domain, and feature must have a README:

```markdown
# <Module Name>

## Purpose
<2-3 sentence description of what this module does>

## Responsibilities
- <responsibility 1>
- <responsibility 2>

## Dependencies
- <dependency name>: <why it depends>

## Exports
- `<ClassName>`: <description>
- `<interfaceName>`: <description>

## Usage
<code example>

## Testing
```bash
npm test -- --grep "<ModuleName>"
```
```

### Project Root README

The root `README.md` must include:
- Project name and purpose.
- Quick start guide (install, configure, run).
- Architecture overview (link to architecture docs).
- Links to all major documentation sections.
- Contributing guidelines.
- License information.

## Changelog Maintenance

- **File**: `CHANGELOG.md`.
- **Format**: [Keep a Changelog](https://keepachangelog.com/) standard.
- **Versioning**: [Semantic Versioning](https://semver.org/).

### Changelog Structure

```markdown
# Changelog

## [Unreleased]

### Added
- Feature: Order Processing — full CRUD for orders (PR #42)

### Changed
- Upgraded Prisma from v4 to v5 (PR #40)

### Fixed
- Payment timeout not triggering rollback (PR #38)

### Security
- Updated express to 4.19.2 to fix CVE-2024-NNNN

## [2.2.0] - 2026-06-15

...
```

### Changelog Rules
- Each release has a version header and date.
- Changes are categorized: Added, Changed, Deprecated, Removed, Fixed, Security.
- Each entry references the PR or commit.
- `[Unreleased]` section is maintained throughout the development cycle.
- On release, `[Unreleased]` is renamed to the version number and a new `[Unreleased]` section is created.

## Documentation Review

- Documentation is reviewed alongside code in the Review stage (Stage 09).
- Review criteria:
  - Completeness: Are all required sections present?
  - Accuracy: Does the documentation match the implementation?
  - Clarity: Is the language clear and unambiguous?
  - Cross-references: Are all internal links valid?
  - Examples: Do code examples compile and run correctly?

## Documentation Quality Checklist

- [ ] Frontmatter is present and complete.
- [ ] All required sections are filled in.
- [ ] Cross-references use relative paths and resolve correctly.
- [ ] Code examples are syntax-highlighted with correct language tag.
- [ ] No placeholder text ("TODO", "FIXME", "TBD") in published docs.
- [ ] API documentation has example requests and responses.
- [ ] TSDoc comments exist on all public APIs.
- [ ] Changelog is up to date with current changes.
- [ ] Spelling and grammar checked.
