# 14 — GAPS

Generated: PLACEHOLDER

## G001 — No Persistent Project Memory
Classification: VERIFIED
Impact: CRITICAL
The local model loses all architectural knowledge between sessions.

## G002 — No Sprint Structure
Classification: VERIFIED
Impact: HIGH
Work is executed as isolated prompts with no sprint planning.

## G003 — No Task Decomposition
Classification: VERIFIED
Impact: HIGH
Tasks are too large for a 7B context window.

## G004 — No Context Loading Strategy
Classification: VERIFIED
Impact: CRITICAL
The entire or random portions of repository are loaded ad-hoc.

## G005 — No Verification Gates
Classification: VERIFIED
Impact: HIGH
Changes are accepted on model assertion rather than test execution.

## G006 — No Checkpoint System
Classification: VERIFIED
Impact: HIGH
Sessions end with no record of what was done, decided, or blocked.

## G007 — No Handoff Protocol
Classification: VERIFIED
Impact: HIGH
Next session cannot recover prior context reliably.

## G008 — No Architectural Governance
Classification: VERIFIED
Impact: MEDIUM
No mechanism prevents drift from architectural decisions.

## G009 — No Security Preflight
Classification: VERIFIED
Impact: HIGH
No automated check for secrets, auth changes, or injection risks before commit.

## G010 — No Failure Recovery Protocol
Classification: VERIFIED
Impact: MEDIUM
On failure the model retries randomly rather than diagnosing root cause.
