# 04 — User Activation

> User activation process for hotel staff and admins.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 3 | Screen-Architecture.md | Screen flows |
| Phase 6 | Commercial-Domain.md | User management |

## User Types

| Type | Permissions | Created By | Count (Typical) |
|------|------------|------------|-----------------|
| Super Admin | Full platform access | Triangle Black | 1-2 per client |
| Hotel Admin | Hotel configuration, reports | Super Admin | 1-2 per hotel |
| Front Desk | Reservations, check-in/out | Hotel Admin | 3-10 per hotel |
| Housekeeping | Task view, status updates | Hotel Admin | 5-20 per hotel |
| Manager | Reports, approvals | Hotel Admin | 1-3 per hotel |
| Viewer | Read-only access | Hotel Admin | Unlimited |

## User Activation Flow

```
Admin creates user ──► System sends email ──► User clicks link ──► Sets password ──► Active
     │                     │                       │                   │
  Email, role,        Welcome email            Verification        Password
  hotel assignment    with magic link           page              requirements
```

## Activation Email Template

```
Subject: Welcome to Triangle Black — Activate Your Account

Hi [Name],

Your Triangle Black account has been created.

Role: [Role]
Hotel: [Hotel Name]

Click here to activate: [activation link]
(This link expires in 48 hours)

After activation, you can log in at:
https://app.triangleblack.com

Need help? Reply to this email or contact support.

— Triangle Black Team
```

## Adoption Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Activation rate | > 90% within 48 hours | Link clicks |
| Login frequency (first week) | Daily | Login records |
| Feature usage (core) | > 80% of users | Event tracking |
| Time to first action | < 15 min after activation | Session data |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| COO | | | |

**Status:** ❌ NOT DOCUMENTED
