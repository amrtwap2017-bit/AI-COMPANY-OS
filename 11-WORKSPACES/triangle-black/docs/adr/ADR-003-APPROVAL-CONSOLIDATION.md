# ADR-003: Approval System Consolidation

## Status
PROPOSED

## Context

Three approval modules exist: approval_center, approval_chain, approval_requests.
They serve different but overlapping concerns.
No unified approval policy engine.

## Decision

Approval policy will eventually be owned by TriangleWorkflowEngine.
approval_center remains as a governed read-only aggregation.
approval_requests table remains as the canonical approval record store.
approval_chain becomes a compatibility facade delegating to workflow engine.

## Migration Sequence

1. Verify approval_chain has zero direct SQL mutations outside router
2. Create workflow approval definition for PR approval
3. Wire PR approval to workflow engine transition
4. Keep approval_chain router as facade returning same API shape
5. Keep approval_requests table permanently as audit record

## Rollback

approval_chain continues to work independently.
Workflow engine approval definition is additive — not replacing existing behavior.

## Consequences

Positive: Unified approval policy under workflow engine governance
Negative: Requires workflow engine to be stable first (dependency on SPRINT-013)
