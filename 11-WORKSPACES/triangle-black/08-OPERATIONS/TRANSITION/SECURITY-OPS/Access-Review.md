# 07 — Access Review

> Access review process for user permissions.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 5 | Security-Foundation.md | Access control |
| Phase 8 | 05-SECURITY-READINESS/Access-Control.md | Access control validation |

## Access Review Scope

| Access Type | Review Frequency | Reviewed By | Records |
|-------------|-----------------|-------------|---------|
| VPS (SSH keys) | Monthly | CTO | Authorized keys list |
| Database (admin) | Monthly | CTO | pg_hba.conf, roles |
| GitHub repository | Quarterly | CTO | GitHub settings |
| Docker host | Monthly | DevOps | Docker group members |
| Application (admin) | Monthly | COO | User roles |
| API keys (service) | Quarterly | CTO | API keys list |
| Third-party services | Quarterly | CTO | Service accounts |
| Customer data access | Monthly | COO | Access logs |

## Access Review Process

```
1. Inventory ──► 2. Verify ──► 3. Remediate ──► 4. Approve
    │              │              │               │
  List all      Confirm       Remove           Sign off
  accounts      each is       inactive         access
  + permissions  needed        + excessive      list
```

## Access Review Checklist

- [ ] All accounts active (not stale)
- [ ] No shared credentials
- [ ] All API keys have known owners
- [ ] No excessive permissions
- [ ] MFA enforced where possible
- [ ] SSH keys valid (not expired)
- [ ] Service accounts documented
- [ ] Emergency access documented

## Access Revocation Process

| Trigger | Action | Owner | Timeline |
|---------|--------|-------|----------|
| Employee leaves | Remove all access | CTO | Same day |
| Role change | Update permissions | CTO | Within 1 week |
| Inactive 90 days | Disable account | COO | Monthly review |
| Suspicious activity | Revoke immediately | CTO | Immediate |
| Contract ends | Revoke customer admin | COO | Contract end date |

## Access Review Log

```
─────────────────────────────────────────────
ACCESS REVIEW LOG
─────────────────────────────────────────────

Review Date: _____________
Reviewer: _____________

Accounts Reviewed: ___
Accounts Revoked: ___
Permissions Changed: ___

Issues Found:
- [Issue 1]
- [Issue 2]

Actions Taken:
- [Action 1]
- [Action 2]

Signed Off: _____________ Date: _____________
```

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT CONFIGURED
