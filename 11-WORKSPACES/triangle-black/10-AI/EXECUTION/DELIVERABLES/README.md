# Deliverable Contracts

## Purpose

The Deliverable Contracts framework ensures that every engineering task produces standardized, verifiable outputs. Contracts define the minimum requirements each artifact must satisfy to be considered complete.

## Contract Model

Every deliverable follows a four-phase lifecycle:

```
Inputs → Execution → Outputs → Verification
```

- **Inputs**: The prerequisites and source materials required to begin work.
- **Execution**: The process of producing the deliverable.
- **Outputs**: The artifacts generated.
- **Verification**: The checks that confirm the outputs meet the contract.

## Contract Compliance = Done

A task is considered **done** only when all its deliverable contracts are verified as compliant. Partial completion is not accepted. Each contract includes explicit verification criteria that must pass before the deliverable moves to the next stage.

## Contract Types

| Contract | Primary Artifacts | Verification Method |
|---|---|---|
| Source Code | Implementation files | CI pipeline |
| Tests | Test suites | Coverage + CI |
| Documentation | Docs, README, changelog | Review |
| API Contracts | OpenAPI specs | Spec validation |
| Database Migrations | Migration scripts | CI + dev DB test |
| Architecture Updates | Diagrams, ADRs | Architecture review |
| Release Notes | Release documentation | Review |
| Deployment Packages | Build artifacts, images | Staging deployment |

## Contract Metadata

Every deliverable must include traceability metadata:
- Linked requirement or issue ID
- Author and reviewer
- Date of creation and last modification
- Version or commit reference
- Contract status (draft, in-review, verified, rejected)

## Non-Compliance

If a deliverable fails verification:
1. The issue is documented with specific failure reasons.
2. The deliverable is returned to the executor with remediation guidance.
3. Re-verification is required after fixes are applied.
4. Repeated failures trigger a process review.

## Contract Versioning

Deliverable contracts themselves are versioned. Changes to contracts require approval from the Engineering Lead and must be communicated to all teams before taking effect.
