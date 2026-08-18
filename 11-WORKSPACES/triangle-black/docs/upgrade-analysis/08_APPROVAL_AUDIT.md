# Approval System Audit — August 2026

## Current Modules (3 total)

| Module | Purpose | Registered | Has Table | Has Router |
|--------|---------|-----------|-----------|-----------|
| approval_center | Aggregation reads from quotes/PRs/POs | YES (main.py:93) | NO — reads others | YES |
| approval_chain | PR approval chain process | YES (main.py:837) | YES pr_approval_chain | YES |
| approval_requests | Individual approval request records | YES (main.py:93) | YES approval_requests | YES |

## Key Differences

approval_center: Read-only aggregation — no own table — CORRECT pattern
approval_chain: Process engine for sequential/parallel approval — owns pr_approval_chain table
approval_requests: Individual approval records — owns approval_requests table

## Problem

These are NOT true duplicates. They serve different concerns.
However they lack a unified interface and policy engine.
The workflow engine (TriangleWorkflowEngine) should eventually own approval transitions.

## Consolidation Strategy

1. approval_center — KEEP AS IS (read-only aggregation is correct)
2. approval_chain — MIGRATE to workflow engine approval definition
3. approval_requests — KEEP table, migrate transitions to workflow engine

Target state:
  WorkflowEngine.approval_definition → approval_requests table
  approval_center reads from approval_requests (no change)
  approval_chain becomes compatibility facade

## Risk

MEDIUM — approval_chain is wired to PR approval flow.
Must not break purchase request approval during migration.

## Priority

P2 — important but not blocking production.
Execute after workflow engine hardening (SPRINT-013).
