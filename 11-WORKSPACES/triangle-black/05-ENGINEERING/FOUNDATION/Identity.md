# Phase 05 — Identity

> Authentication, user management, roles, and permissions.

## Authentication Flow

```
Login ──► Validate Credentials ──► Generate Tokens ──► Return {accessToken, refreshToken, user}
              │
              ▼
         bcrypt compare
              │
         ┌────┴────┐
         │ Match   │ No Match → 401
         └────┬────┘
              │
         Generate Tokens
              │
         ┌────┴────┐
         │ Return  │
         └─────────┘
```

## Token Management

| Token | Storage | Expiry | Rotation |
|-------|---------|--------|----------|
| Access | Memory (JS variable) | 15 min | On refresh |
| Refresh | httpOnly cookie | 7 days | On use (old invalidated) |

## RBAC Model

```
User ──► Role ──► Permission
 │        │          │
 │        ▼          ▼
 │      Admin      create:lead
 │      Manager    view:reports
 │      User       approve:po
 ▼
Tenant (schema isolation)
```

## Seed Data

| Entity | Count | Purpose |
|--------|-------|---------|
| Tenants | 1 | Demo tenant |
| Users | 3 | Admin, Manager, User |
| Roles | 3 | admin, manager, user |
| Permissions | ~20 | All domain CRUD permissions |

See `02-IDENTITY/` for complete implementation details.
