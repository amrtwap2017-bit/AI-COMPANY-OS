# 05 — Change Control

> Change control process for support-related changes.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 8 | 07-OPERATIONS/Change.md | Change management |
| Phase 9 | 01-Release-Governance.md | Release governance |

## Change Types (Support Scope)

| Change Type | Approval | Risk | Examples |
|-------------|----------|------|----------|
| Customer config change | Support Lead | Low | Update hotel settings, add user |
| Customer data fix | COO | Medium | Correct reservation, adjust rate |
| Account change | Support Lead | Low | Password reset, role change |
| Billing adjustment | Finance | Low | Invoice correction, credit |
| Emergency config | CTO | Medium | Block IP, disable feature |

## Change Control Process

```
Request ──► Assess ──► Approve ──► Execute ──► Verify ──► Record
   │         │          │           │           │          │
 Ticket   Impact     Authority   Apply       Confirm    Log in
 created  + risk     per type    change      working    change log
```

## Change Authority Matrix

| Change Type | Request | Approve | Execute | Notify |
|-------------|---------|---------|---------|--------|
| Customer config | Support | Support Lead | Support | Customer |
| Customer data fix | Support | COO | DevOps | Customer |
| Account change | Customer | Support Lead | Support | Customer |
| Billing adjustment | Finance | COO | Finance | Customer |
| Emergency config | DevOps | CTO | DevOps | Team |

## Change Log Template

```
─────────────────────────────────────────────
CHANGE LOG
─────────────────────────────────────────────

Change ID: CHG-001
Date: _____________
Type: [Config / Data / Account / Billing / Emergency]
Customer: _____________
Requested by: _____________
Approved by: _____________

Description:
_______________________________________________

Reason:
_______________________________________________

Risk assessment: [Low / Medium / High]
Rollback plan: [Yes / No] — Details:

Pre-change checks: [ ] All passed
Post-change checks: [ ] All passed
Customer notified: [ ] Yes [ ] No

Closed by: _____________ Date: _____________
```

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| COO | | | |

**Status:** ❌ NOT DOCUMENTED
