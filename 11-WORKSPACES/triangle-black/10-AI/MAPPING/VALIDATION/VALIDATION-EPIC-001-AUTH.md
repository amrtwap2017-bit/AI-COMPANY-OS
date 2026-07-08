# Program 3 Validation: EPIC-001 — Authentication & Authorization

## Purpose

Validate that Program 3 (Enterprise AI Execution System) correctly consumes Programs 1, 2, and 2.5 to produce actionable execution artifacts for a real Triangle Black epic. This proves the five-program architecture is wired end-to-end before production execution begins.

## Traceability Chain (What This Validates)

```
Program 1 (Enterprise Blueprint) ──specifies──┐
                                               ├──> Program 2.5 (Delivery Mapping) ──compiles──> Context Pack
Program 1 (ADR-007, CAP-08) ──constrains──────┘                                              │
                                                                                              v
Program 3 (Execution System) ──instantiates──> EPIC-001 ──> Features ──> Stories ──> Tasks ──+──> Deliverable Contracts
                                                                                              │
Program 2 (AI Organization) ──assigns────────> AI Agents (Backend Lead, Frontend Lead, ...) ──┘
```

---

## 1. Portfolio Alignment

### Strategic Objective

| Field | Value |
|-------|-------|
| **Objective ID** | OBJ-001 |
| **Title** | Foundational Platform Enablement |
| **Strategic Pillar** | Operational Excellence |
| **Key Result** | KR-1.1: Establish secure, multi-tenant platform foundation by end of Quarter 1 |
| **Portfolio** | PORT-001: Triangle Black Core Platform |

### Business Capability (from Program 1)

| Capability ID | Name | Source |
|---------------|------|--------|
| **CAP-08** | Identity & Access | `PHASE-02-IMPLEMENTATION-BLUEPRINT/21-Implementation Blueprint.md` |
| **SK-08** | Audit Trail | `PHASE-06-BUSINESS-DOMAINS/00-SHARED-KERNEL/Business-Capabilities.md` |
| **SK-09** | Tenant Isolation | `PHASE-06-BUSINESS-DOMAINS/00-SHARED-KERNEL/Business-Capabilities.md` |

### Program 1 Blueprint Documents Consumed

| Ref | Document | Path |
|-----|----------|------|
| **ADR-007** | Authentication Decision Record | `PHASE-01-ENTERPRISE-DOCUMENTATION/09-Architecture/ADR/ADR-007-Authentication.md` |
| **ADR-005** | Multi-Tenancy Decision Record | `PHASE-01-ENTERPRISE-DOCUMENTATION/09-Architecture/ADR/ADR-005-MultiTenancy.md` |
| **CAP-08** | Identity & Access Blueprint | `PHASE-02-IMPLEMENTATION-BLUEPRINT/21-Implementation Blueprint.md` (§CAP-08) |
| **SEC-AUTH** | Authentication Design | `PHASE-03-DIGITAL-TWIN-DESIGN/10-SECURITY-DESIGN/Authentication.md` |
| **SEC-AUTHZ** | Authorization Design | `PHASE-03-DIGITAL-TWIN-DESIGN/10-SECURITY-DESIGN/Authorization.md` |
| **PORT-PERM** | Portal Permissions Matrix | `PHASE-03-DIGITAL-TWIN-DESIGN/02-PORTAL-DESIGN/Portal-Permissions.md` |
| **API-AUTH** | Auth API Endpoints | `PHASE-03-DIGITAL-TWIN-DESIGN/07-API-DESIGN/Auth-Endpoints.md` |
| **IDN** | Identity Implementation | `PHASE-05-PRODUCT-IMPLEMENTATION/02-IDENTITY/Authentication.md` |
| **SEC-FOUND** | Security Foundation | `PHASE-05-PRODUCT-IMPLEMENTATION/Security-Foundation.md` |
| **PRISMA** | Data Model | `PHASE-05-PRODUCT-IMPLEMENTATION/06-DATA-FOUNDATION/Prisma.md` |
| **SEEDS** | Seed Data | `PHASE-05-PRODUCT-IMPLEMENTATION/06-DATA-FOUNDATION/Seeds.md` |
| **SHARED-KERNEL** | Shared Kernel (Roles, Permissions) | `PHASE-06-BUSINESS-DOMAINS/00-SHARED-KERNEL/Roles.md` & `Permissions.md` |

---

## 2. EPIC-001: Authentication & Authorization

```
╔══════════════════════════════════════════════════════════════════════╗
║  EPIC-001: Platform Identity & Access Management                    ║
║  Status: APPROVED                                                   ║
║  Epic Owner: Product Owner AI                                       ║
║  Program Manager: Program Manager AI                                ║
║  Technical Lead: Solution Architect AI                              ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Epic Template (Instantiated)

#### 1. Epic ID
**EPIC-001**

#### 2. Title
Platform Identity & Access Management

#### 3. Description
This epic establishes the foundational authentication and authorization system for the Triangle Black platform. It delivers JWT-based authentication with access/refresh token flow, role-based access control (RBAC) with a 8-role hierarchy, multi-tenant isolation via schema-per-tenant, and comprehensive audit logging. The epic covers all user lifecycle operations (registration, login, password management, profile management) and administrative functions (user management, role management, permission assignment). This is the foundational epic upon which all Triangle Black functionality depends — no other epic can proceed without it.

The approach follows ADR-007 (JWT with RS256 asymmetric signing, 15min access / 7d refresh tokens) and ADR-005 (schema-per-tenant isolation). Password hashing uses bcrypt cost 12. Rate limiting protects auth endpoints at 5 requests per 15 minutes per IP.

#### 4. Strategic Objective
**OBJ-001**: Foundational Platform Enablement — KR-1.1: Establish secure, multi-tenant platform foundation by end of Quarter 1.

#### 5. Business Capability
- **Primary:** CAP-08 — Identity & Access
- **Secondary:** SK-08 — Audit Trail, SK-09 — Tenant Isolation

#### 6. Expected Value

| Dimension | Expected Impact | Measurement |
|-----------|----------------|-------------|
| Revenue Impact | Enables all revenue-generating features (CRM, Projects, etc.) | Prerequisite — no revenue without auth |
| Cost Savings | Avoids per-seat auth provider costs ($0/mo vs $200+/mo for Auth0) | $2,400+ annual savings |
| Customer Satisfaction | Fast, seamless login experience | Login completion time < 2s |
| Operational Efficiency | Self-service user management for tenant admins | Admin user management time reduced by 80% |
| Risk Reduction | Secure authentication prevents unauthorized access | Zero auth-related security incidents |
| Compliance | ETA e-invoicing compliance requires authentication | Audit trail compliant with regulatory requirements |

#### 7. Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | User can register, login, and receive JWT tokens | E2E test: register -> login -> access protected endpoint |
| 2 | Access tokens expire after 15 minutes, refresh tokens after 7 days | Automated token expiry test |
| 3 | RBAC enforces role-based permissions across all 8 roles | Permission matrix test covers all 8 roles |
| 4 | Multi-tenant isolation prevents cross-tenant data access | Tenant isolation integration test |
| 5 | Rate limiting blocks auth endpoint abuse after 5 failed attempts | Rate limiting integration test |
| 6 | All mutations are recorded in audit log with actor, action, resource, timestamp | Audit log verification test |
| 7 | Password policy enforces complexity, history, lockout rules | Password policy unit tests |
| 8 | API documentation covers all endpoints with request/response schemas | OpenAPI spec validation |

#### 8. Scope

**In Scope:**
- JWT authentication (access + refresh tokens, RS256 signing)
- User registration, login, logout, password management
- Role-based access control (8 roles: super_admin, admin, manager, sales_rep, engineer, viewer, client_admin, client_user)
- Permission management with granular resource-level permissions
- Multi-tenant isolation (schema-per-tenant, tenant context in JWT)
- Audit logging for all auth-related mutations
- Rate limiting on auth endpoints
- Admin user CRUD, role CRUD, permission assignment
- Profile management (view/update profile, change password)

**Out of Scope:**
- OAuth2/OIDC/SSO integration (V2 per ADR-007)
- MFA/TOTP (V2 per Security Architecture)
- Biometric authentication (V2 per MOB-R05)
- Identity federation (Phase 7, V2+)
- Social login providers (not in ADR-007)
- SCIM provisioning (future)

#### 9. Dependencies

| ID | Type | Description | External | Status |
|----|------|-------------|----------|--------|
| DEP-001 | Infrastructure | Docker Compose + PostgreSQL 16 | No | Resolved |
| DEP-002 | Technology | NestJS 11 + Passport + Prisma 6 | No | Resolved |
| DEP-003 | Technology | JWT RS256 key pair generation | No | Resolved |
| DEP-004 | Architecture | ADR-007 (JWT auth) approved | No | Resolved |

#### 10. Estimated Effort

**T-Shirt Size:** L
**Story Points (Range):** 40-55
**Sprint Estimate:** 2 sprints (Sprint 000 + Sprint 001)

| Phase | Effort Estimate | Confidence |
|-------|----------------|------------|
| Discovery | Complete (Program 1 defines everything) | High |
| Design | Complete (Program 1 defines everything) | High |
| Development | 30-40 story points | High |
| Testing | 8-10 story points | High |
| Deployment | 2-5 story points | High |

#### 11. Risk Assessment

| ID | Description | Probability | Impact | Mitigation | Owner |
|----|-------------|-------------|--------|------------|-------|
| RISK-001 | JWT secret exposure | Low | Critical | RS256 key pair, env vars, rotated per deploy | DevOps Architect AI |
| RISK-002 | Brute force password attack | Medium | High | Rate limiting (5/15min), account lockout (5 attempts) | Security Architect AI |
| RISK-003 | Tenant data leakage | Low | Critical | Schema-per-tenant, TenantGuard, test coverage | QA Director AI |
| RISK-004 | Token theft via XSS | Medium | High | httpOnly refresh token cookies, CSP headers | Frontend Lead AI |

#### 12. Stakeholders

| Role | Name | Organization | Expectations |
|------|------|-------------|-------------|
| Epic Owner | Product Owner AI | AI Organization | Epic delivered within 2 sprints |
| Program Manager | Program Manager AI | AI Organization | All quality gates passed |
| Product Owner | Product Owner AI | AI Organization | Acceptance criteria met |
| Technical Lead | Solution Architect AI | AI Organization | Architecture compliance |
| Business Sponsor | Chief Executive AI | AI Organization | Platform secured for revenue features |
| Security | Security Architect AI | AI Organization | Zero critical vulnerabilities |

#### 13. Version History

| Version | Date | Author | Change Description |
|---------|------|--------|-------------------|
| 1.0 | 2026-07-03 | Program 3 Validation | Instantiated from Epic Template, traced to Program 1 |

---

## 3. Feature Decomposition

The epic is decomposed into 6 features, each sized for 1-2 sprints, sourced directly from Program 2.5's CP-Authentication context pack and Program 1 blueprint documents.

### Feature Index

| Feature ID | Title | Story Points | Sprint | Agent Lead |
|------------|-------|-------------|--------|------------|
| FEAT-001 | User Authentication (Login/Register/Logout/Token) | 13 | 000 | Backend Lead AI |
| FEAT-002 | User Profile & Password Management | 5 | 000 | Backend Lead AI |
| FEAT-003 | Admin User Management | 8 | 001 | Backend Lead AI |
| FEAT-004 | Role-Based Access Control | 8 | 001 | Backend Lead AI |
| FEAT-005 | Multi-Tenant Isolation | 5 | 000 | Database Architect AI |
| FEAT-006 | Auth UI Screens (Login, Register, Profile, Admin) | 13 | 000-001 | Frontend Lead AI |

### FEAT-001: User Authentication

**Epic Link:** EPIC-001: Platform Identity & Access Management

**Business Value:**
| Dimension | Description |
|-----------|-------------|
| User Impact | Users can securely access the platform with email + password |
| Business Impact | Foundational capability — blocks all other features |
| Value Category | Foundation |
| Success Metric | Login success rate > 99.5% |
| Target Outcome | Zero authentication-related incidents |

**Description:**
Implements JWT-based authentication flow: user registration with email/password validation, login with bcrypt password verification and JWT token issuance (15min access + 7d refresh), token refresh without re-authentication, and secure logout with token revocation. Rate limited at 5 requests per 15 minutes per IP. All auth events audited. Per ADR-007, ADR-005, and Security Architecture.

**Program 1 Trace:**
- `ADR-007-Authentication.md` — JWT RS256, 15min/7d, bcrypt cost 12
- `PHASE-03-DIGITAL-TWIN-DESIGN/10-SECURITY-DESIGN/Authentication.md` — Token flow, password policy
- `PHASE-03-DIGITAL-TWIN-DESIGN/07-API-DESIGN/Auth-Endpoints.md` — API endpoint specs
- `PHASE-05-PRODUCT-IMPLEMENTATION/02-IDENTITY/Authentication.md` — Implementation code patterns
- `PHASE-05-PRODUCT-IMPLEMENTATION/Security-Foundation.md` — Guard stack, rate limiting

**Scope:**

| In Scope | Out of Scope |
|----------|-------------|
| POST /auth/register with validation | OAuth2/OIDC (V2) |
| POST /auth/login with rate limiting | Magic link auth |
| POST /auth/refresh token rotation | Biometric auth |
| POST /auth/logout token revocation | Social login |
| Password hashing (bcrypt cost 12) | |
| Rate limiting (5/15min per IP) | |
| Audit logging for auth events | |

**Dependencies:**
| ID | Type | Description | Source | Status |
|----|------|-------------|--------|--------|
| DEP-001 | Infrastructure | PostgreSQL 16 running | DevOps | Resolved |
| DEP-005 | Technology | Prisma schema with users table | DB Architect | Resolved |

**Effort:** M (13 story points)

**Acceptance Criteria (BDD):**

```
Scenario: User registers successfully
Given a user with email "user@example.com" and password "SecureP@ss1"
  And the email is not already registered
When the user submits POST /auth/register
Then the response returns HTTP 201
  And the response body contains { "id": "<uuid>", "email": "user@example.com" }
  And the password is not returned in the response
  And an audit log entry "user.registered" is created

Scenario: Login with valid credentials
Given a user "user@example.com" exists with password "SecureP@ss1"
When the user submits POST /auth/login with email "user@example.com" and password "SecureP@ss1"
Then the response returns HTTP 200
  And the response contains an "accessToken" with 15-minute expiry
  And the response contains a "refreshToken" with 7-day expiry
  And the user's lastLoginAt is updated

Scenario: Login with invalid password
Given a user "user@example.com" exists
When the user submits POST /auth/login with password "WrongPass1"
Then the response returns HTTP 401
  And the response contains error code "AUTH_INVALID_CREDENTIALS"
  And the failed attempt is logged in the audit trail

Scenario: Rate limiting on login endpoint
Given 5 failed login attempts from IP "10.0.0.1" in the last 15 minutes
When the user submits a 6th login attempt from IP "10.0.0.1"
Then the response returns HTTP 429
  And the response header "Retry-After" is present

Scenario: Access token protects resources
Given a valid access token
When the user submits GET /auth/me with the token in the Authorization header
Then the response returns HTTP 200 with the user profile

Scenario: Expired access token is rejected
Given an access token that expired 1 minute ago
When the user submits GET /auth/me with the expired token
Then the response returns HTTP 401
  And the response contains error code "TOKEN_EXPIRED"

Scenario: Refresh token extends session
Given a valid refresh token
When the user submits POST /auth/refresh with the refresh token
Then the response returns HTTP 200
  And a new access token is issued
  And the old refresh token is revoked (rotation)
```

### FEAT-002: User Profile & Password Management

**Epic Link:** EPIC-001

**Description:** Users can view and edit their own profile (name, email, avatar) and manage their password (change password, forgot/reset password flow). Password change requires current password verification. Forgot password sends reset link (V1: logged to console; V2: email service). Password history (5 entries) prevents reuse.

**Program 1 Trace:**
- `PHASE-03-DIGITAL-TWIN-DESIGN/10-SECURITY-DESIGN/Authentication.md` — Password policy: min 8, complexity 2of4, 90-day age, 5-history
- `PHASE-05-PRODUCT-IMPLEMENTATION/02-IDENTITY/Authentication.md` — getProfile, changePassword patterns

**Effort:** S (5 story points)

### FEAT-003: Admin User Management

**Epic Link:** EPIC-001

**Description:** Admin CRUD for users within tenant. Create user (with role assignment), view user list with search/filter, edit user details, deactivate/reactivate users. Cannot deactivate self. Email uniqueness enforced within tenant.

**Program 1 Trace:**
- `PHASE-03-DIGITAL-TWIN-DESIGN/02-PORTAL-DESIGN/Portal-Permissions.md` — User management permissions
- `PHASE-03-DIGITAL-TWIN-DESIGN/03-USER-EXPERIENCE/Approval-Flows.md` — BR-ADM-03: cannot deactivate self
- `PHASE-05-PRODUCT-IMPLEMENTATION/02-IDENTITY/User.md` — UsersService, UsersController patterns
- `PHASE-06-BUSINESS-DOMAINS/13-HUMAN-RESOURCES/Business-Rules.md` — EMP-R02: email unique within tenant

**Effort:** M (8 story points)

### FEAT-004: Role-Based Access Control

**Epic Link:** EPIC-001

**Description:** Complete RBAC system: role hierarchy (super_admin > admin > manager > sales_rep/engineer > viewer; client_admin > client_user), granular permission matrix covering all 14 business domains, role CRUD, permission assignment to roles, declarative guards (@Roles, @RequirePermission). Permission checks at guard, service, and database levels.

**Program 1 Trace:**
- `PHASE-03-DIGITAL-TWIN-DESIGN/10-SECURITY-DESIGN/Authorization.md` — Full permissions matrix, guard code examples
- `PHASE-03-DIGITAL-TWIN-DESIGN/02-PORTAL-DESIGN/Portal-Permissions.md` — 8 role definitions, numeric levels, 6 permission rules
- `PHASE-05-PRODUCT-IMPLEMENTATION/02-IDENTITY/Authorization.md` — Guards implementation, PERMISSIONS constant
- `PHASE-06-BUSINESS-DOMAINS/00-SHARED-KERNEL/Roles.md` — Platform roles (SYSTEM_ADMIN, TENANT_ADMIN, etc.)
- `PHASE-06-BUSINESS-DOMAINS/00-SHARED-KERNEL/Permissions.md` — Platform permissions

**Effort:** M (8 story points)

### FEAT-005: Multi-Tenant Isolation

**Epic Link:** EPIC-001

**Description:** Schema-per-tenant isolation: tenant context resolved from JWT token, TenantGuard enforces tenant_id on all queries, shared public schema for tenant registry + auth, per-tenant schemas for business data. Prisma schema with tenant-scoped models.

**Program 1 Trace:**
- `ADR-005-MultiTenancy.md` — Schema-per-tenant decision, Prisma search_path switching
- `PHASE-05-PRODUCT-IMPLEMENTATION/02-IDENTITY/Authorization.md` — TenantGuard implementation
- `PHASE-05-PRODUCT-IMPLEMENTATION/Security-Foundation.md` — Guard stack: TenantGuard at position 4
- `PHASE-06-BUSINESS-DOMAINS/00-SHARED-KERNEL/Business-Capabilities.md` — SK-09 Tenant Isolation
- `PHASE-06-BUSINESS-DOMAINS/00-SHARED-KERNEL/Business-Rules.md` — SK-R01: all entities must have tenant_id

**Effort:** M (5 story points)

### FEAT-006: Auth UI Screens

**Epic Link:** EPIC-001

**Description:** Next.js App Router pages for all auth flows: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/profile`, `/users` (admin list), `/users/new`, `/users/[id]`, `/roles`, `/roles/new`, `/roles/[id]`, `/audit-logs`. Implements client-side token handling (storage, refresh interceptor), protected routes, role-based UI elements, and responsive design.

**Program 1 Trace:**
- `PHASE-03-DIGITAL-TWIN-DESIGN/02-PORTAL-DESIGN/Administration-Portal.md` — Admin portal design
- `PHASE-05-PRODUCT-IMPLEMENTATION/11-QUALITY/Frontend-Testing-Strategy.md` — Auth screen test specs
- `PHASE-05-PRODUCT-IMPLEMENTATION/02-IDENTITY/Authentication.md` — Client-side integration patterns

**Effort:** M-L (13 story points across 2 sprints)

---

## 4. User Story Samples

### US-001: User Registration

**Feature:** FEAT-001 — User Authentication

```
As a new platform user
I want to register with my email and password
So that I can create an account and access the platform
```

**Acceptance Criteria:**

| # | Condition | Expected Result | Priority |
|---|-----------|-----------------|----------|
| 1 | Register with valid email, password, and name | 201 response, user created | Must |
| 2 | Register with duplicate email | 409 Conflict, "Email already registered" | Must |
| 3 | Register with weak password (< 8 chars, no complexity) | 400 Bad Request, validation error | Must |
| 4 | Register without required fields | 400 Bad Request, field-level errors | Must |
| 5 | Password is stored as bcrypt hash (cost 12) | Hash != plaintext, bcrypt verify passes | Must |

**BDD Scenarios:**

```
Scenario: Standard flow — User registers successfully
Given a user with email "engineer@example.com", password "SecureP@ss1", and name "Ahmed Hassan"
  And the email is not already registered in the tenant
When the user submits a POST /auth/register request with valid body
Then the response returns HTTP 201
  And the response body contains the user ID, email, and name
  And the response body does NOT contain the password hash
  And a "user.created" event is emitted
  And an audit log entry is created with action "user.register"

Scenario: Error flow — Duplicate email
Given a user with email "engineer@example.com" already exists in the tenant
When any user attempts to register with email "engineer@example.com"
Then the response returns HTTP 409
  And the error code is "USER_EMAIL_EXISTS"
  And no new user record is created

Scenario: Validation — Weak password
Given a registration request with password "123"
When the request is validated
Then the response returns HTTP 400
  And the error message indicates password does not meet complexity requirements
  - Minimum 8 characters
  - Contains at least 2 of: uppercase, lowercase, digit, special character

Scenario: Edge case — Maximum field length
Given a registration request with name of 256 characters
When the request is validated
Then the response returns HTTP 400
  And the error indicates "name" exceeds maximum length of 255 characters
```

### US-002: Role CRUD

**Feature:** FEAT-004 — Role-Based Access Control

```
As a Platform Administrator
I want to create, read, update, and delete roles
So that I can manage access permissions for my organization
```

**Acceptance Criteria:**

| # | Condition | Expected Result | Priority |
|---|-----------|-----------------|----------|
| 1 | Create role with name + permissions | 201, role created with permissions | Must |
| 2 | Create role with duplicate name | 409 Conflict | Must |
| 3 | Update role permissions | 200, permissions updated | Must |
| 4 | Delete role with no users assigned | 204, role removed | Must |
| 5 | Delete role with users assigned | 409, role not removed | Must |
| 6 | List all roles with user count | 200, paginated results | Should |

**BDD Scenarios:**

```
Scenario: Standard flow — Create role with permissions
Given an authenticated Platform Administrator
When the administrator creates a role named "Field Engineer" with permissions:
  - project:read, project:update, timesheet:create, document:read
Then the response returns HTTP 201
  And the role "Field Engineer" is created with 4 permissions
  And the role appears in the role catalog

Scenario: Error flow — Duplicate role name
Given a role "Field Engineer" already exists
When the administrator attempts to create a role named "Field Engineer"
Then the response returns HTTP 409
  And the error code is "ROLE_ALREADY_EXISTS"

Scenario: Permission check — Non-admin cannot create roles
Given a user with the "viewer" role
When the user attempts to POST /roles
Then the response returns HTTP 403
  And the error code is "FORBIDDEN"
  And an audit log entry records the unauthorized attempt
```

---

## 5. Task Decomposition

### T-001-01: Implement Auth Module with JWT Strategy

| Field | Value |
|-------|-------|
| **Task ID** | T-001-01 |
| **Title** | Implement AuthModule with JWT strategy, Passport integration |
| **Story Link** | US-001 |
| **Type** | Backend |
| **Assignee** | Backend Lead AI |
| **Effort** | 8 hours |

**Description:**
Implement NestJS AuthModule with Passport JWT strategy. Create AuthService with login, register, refresh, logout, and getProfile methods. Configure @nestjs/jwt with RS256 asymmetric signing. Implement JwtAuthGuard as global guard. Create CurrentUser decorator. Implement refresh token rotation (old token revoked on refresh).

**Inputs:**
- ADR-007 (JWT auth decision, RS256, 15min/7d)
- Security Architecture (token format, bcrypt cost 12)
- Auth Endpoints API spec (POST /auth/login, /auth/register, /auth/refresh, /auth/logout)
- Prisma schema (users, refresh_tokens tables)
- Identity Implementation (Authentication.md patterns)

**Outputs:**
- `src/modules/auth/auth.module.ts`
- `src/modules/auth/auth.service.ts`
- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/jwt.strategy.ts`
- `src/modules/auth/jwt-auth.guard.ts`
- `src/modules/auth/current-user.decorator.ts`
- Unit tests (auth.service.spec.ts, auth.controller.spec.ts)

**Deliverable Contract (Source Code):**
- Compilation: Zero errors, zero warnings
- Linting: ESLint pass, no violations
- Standards: NestJS convention (modules, services, controllers)
- Traceability: File headers with EPIC-001, US-001 references
- Secrets: No hardcoded keys; JWT_SECRET from env vars
- Error handling: All auth error cases return consistent error structure

**Quality Gates:**
| Gate | Criteria | Verifier |
|------|----------|----------|
| Architecture Review | Clean architecture compliance, module boundary integrity | Solution Architect AI |
| Code Review | Peer review, no critical findings | QA Director AI |
| Unit Tests | ≥80% coverage on new code | CI Pipeline |
| Security Review | No hardcoded secrets, JWT validation correct | Security Architect AI |

### T-001-02: Implement Login Screen

| Field | Value |
|-------|-------|
| **Task ID** | T-001-02 |
| **Title** | Implement login page with form validation and token storage |
| **Story Link** | US-001 |
| **Type** | Frontend |
| **Assignee** | Frontend Lead AI |
| **Effort** | 6 hours |

**Description:**
Create Next.js App Router login page at `/login`. Implement login form with email/password fields, client-side validation, error state display, loading state during submission. On success, store access token in memory (or secure storage) and refresh token in httpOnly cookie. Redirect to dashboard. Handle 401/429/500 error responses gracefully.

**Inputs:**
- FEAT-006 UI requirements
- Administration Portal design (login page spec)
- Frontend Testing Strategy (login.spec.ts)

**Outputs:**
- `src/app/login/page.tsx`
- `src/app/login/login-form.tsx`
- `src/lib/api/auth.ts` (API client)
- `src/lib/auth/token-storage.ts`
- `src/lib/auth/auth-context.tsx`
- Unit tests + component tests

**Deliverable Contract (Source Code):**
- Compilation: Next.js build succeeds
- Accessibility: WCAG 2.1 AA compliant
- Error handling: All API error states (401, 429, 500) display user-friendly messages
- Security: XSS prevention, CSP headers, no token in URL

### T-001-03: Create Database Migration for Auth Schema

| Field | Value |
|-------|-------|
| **Task ID** | T-001-03 |
| **Title** | Create Prisma schema and migration for auth tables |
| **Story Link** | US-001 |
| **Type** | Database |
| **Assignee** | Database Architect AI |
| **Effort** | 4 hours |

**Description:**
Define Prisma schema for auth domain: User, RefreshToken, Role, Permission, RolePermission, AuditLog, SystemConfig models. Create initial migration. Apply seed data. Ensure schema-per-tenant pattern (tenant_id on all scoped models, public schema for auth).

**Inputs:**
- Prisma.md (data model: users, refresh_tokens, audit_logs)
- Seeds.md (seed data: platform tenant, admin user, demo tenants/users)
- Shared Kernel Database.md (BaseEntity pattern)
- ADR-005 (Multi-tenancy: public schema for auth, schema-per-tenant for business data)

**Outputs:**
- `prisma/schema.prisma` (auth models)
- `prisma/migrations/` (initial migration)
- `prisma/seed.ts` (seed data)
- Migration verified forward + rollback

**Deliverable Contract (Database Migrations):**
- Forward-only, non-destructive migration pattern
- Rollback script provided
- Seed data verified: admin@triangleblack.tech / Admin@123
- All users have bcrypt-hashed passwords (cost 12)

### T-001-04: Implement Auth Audit Logging

| Field | Value |
|-------|-------|
| **Task ID** | T-001-04 |
| **Title** | Implement audit logging for all auth mutations |
| **Story Link** | US-001 |
| **Type** | Engineering |
| **Assignee** | Backend Lead AI |
| **Effort** | 3 hours |

**Description:**
Implement AuditService that records all auth-related mutations: user registration, login success/failure, logout, password change, role assignment, user deactivation. Each entry captures actor, action, resource, resource_id, details (JSON diff), ip_address, and timestamp. Expose query endpoint for audit trail viewer.

**Inputs:**
- Shared Kernel Events.md (DomainEvent interface with tenantId)
- Shared Kernel Business-Rules.md (SK-R04: auto audit fields)
- PHASE-05 (Audit-Service.md patterns)

**Outputs:**
- `src/modules/audit/audit.service.ts`
- `src/modules/audit/audit.controller.ts`
- `src/modules/audit/audit.module.ts`
- Unit tests

---

## 6. AI Agent Assignment

Per Program 2 (AI Organization), agents are assigned based on their job descriptions, authority levels, and the context pack requirements.

| Agent | Role in EPIC-001 | Key Responsibilities | Authority Level |
|-------|------------------|---------------------|-----------------|
| **Solution Architect AI** | Technical Lead | Architecture review, API contract approval, guard design, cross-module coordination | Decision authority on scope |
| **Backend Lead AI** | Backend Implementation | AuthModule, JWT strategy, AuthService, controllers, guards, DTOs, RBAC enforcement | Full NestJS implementation authority |
| **Frontend Lead AI** | Frontend Implementation | Login, register, profile, admin screens, token management, API integration | Full Next.js implementation authority |
| **Database Architect AI** | Data Design | Prisma schema, migrations, seed data, index strategy, query optimization | Sole authority over schema |
| **Security Architect AI** | Security Review | Threat model, vulnerability assessment, secure code review, compliance check | Veto power over release |
| **QA Director AI** | Quality Assurance | Test coverage verification, DoD enforcement, quality gate sign-off | Blocks incomplete work |
| **DevOps Architect AI** | Infrastructure | Docker Compose, CI/CD pipeline, environment config, secret management | Environment authority |
| **Product Owner AI** | Epic Ownership | Acceptance criteria sign-off, scope decisions, stakeholder communication | AI recommend, human approve |
| **Program Manager AI** | Program Oversight | Sprint planning, progress tracking, risk management, resource allocation | AI authority on execution |

### Agent Communication Flow

```
Program Manager AI
  ├── assigns epic to Solution Architect AI
  │     ├── Backend Lead AI ← context pack CP-Authentication
  │     ├── Frontend Lead AI ← context pack CP-Authentication
  │     ├── Database Architect AI ← Prisma schema spec
  │     ├── Security Architect AI ← security review request
  │     └── DevOps Architect AI ← deployment config
  ├── reports to Product Owner AI (acceptance)
  └── escalates to Chief Executive AI (exceptions)
```

---

## 7. Deliverable Contracts

Per Program 3's deliverable contracts (Source Code, Tests, API Contracts, Database Migrations, Documentation), the following concrete artifacts are specified:

### Backend Deliverables (Backend Lead AI)

| Artifact | Contract Type | Count | Quality Gate |
|----------|--------------|-------|-------------|
| NestJS auth module | Source Code | 12 files | Architecture Review + Code Review |
| Auth controller + service | Source Code | 4 files | Code Review |
| JWT strategy + guards | Source Code | 3 files | Security Review |
| DTOs + validation | Source Code | 5 files | Code Review |
| Role/permission module | Source Code | 8 files | Architecture Review |
| User management module | Source Code | 6 files | Code Review |
| Audit service | Source Code | 3 files | Code Review |
| Unit tests | Tests | 20+ files | ≥80% coverage |
| Integration tests | Tests | 8 files | All pass |
| OpenAPI spec updates | API Contracts | 1 spec | Spec linter pass |

### Frontend Deliverables (Frontend Lead AI)

| Artifact | Contract Type | Count | Quality Gate |
|----------|--------------|-------|-------------|
| Login page + component | Source Code | 3 files | UX Review |
| Register page + form | Source Code | 3 files | UX Review |
| Profile page | Source Code | 2 files | UX Review |
| User management pages | Source Code | 5 files | UX Review |
| Role management pages | Source Code | 5 files | UX Review |
| Auth context + token mgmt | Source Code | 3 files | Security Review |
| API client library | Source Code | 2 files | Code Review |
| Component tests | Tests | 12 files | ≥80% coverage |
| E2E tests (Playwright) | Tests | 6 files | All pass |

### Database Deliverables (Database Architect AI)

| Artifact | Contract Type | Count | Quality Gate |
|----------|--------------|-------|-------------|
| Prisma schema | Database Migrations | 1 file | Architecture Review |
| Initial migration | Database Migrations | 1 file | Forward + rollback verified |
| Seed data script | Database Migrations | 1 file | Data integrity verified |
| Index strategy | Database Migrations | 1 doc | Performance Review |

### Documentation Deliverables (Documentation Engineer AI)

| Artifact | Contract Type | Count | Quality Gate |
|----------|--------------|-------|-------------|
| API documentation | Documentation | 1 doc | Documentation Review |
| Deployment guide | Documentation | 1 doc | Documentation Review |
| Developer onboarding | Documentation | 1 doc | Documentation Review |
| Audit trail schema | Documentation | 1 doc | Documentation Review |

---

## 8. Quality Gates

Per Program 3's 8 quality gate types, EPIC-001 must pass all applicable gates before release.

### Gate 1: Architecture Review

**Keeper:** Solution Architect AI

| Criterion | Verification |
|-----------|-------------|
| Clean Architecture compliance | Layers: auth controller -> service -> repository -> Prisma |
| Module boundary integrity | AuthModule isolated; imports only shared kernel |
| Dependency direction | AuthModule depends on shared kernel, not vice versa |
| API design quality | RESTful, consistent error format, versioned |
| Security considerations | JWT globally, rate limiting, tenant isolation |
| Scalability | Stateless auth, connection pooling, query optimization |

**Expected Result:** Approved

### Gate 2: Business Review

**Keeper:** Product Owner AI

| Criterion | Verification |
|-----------|-------------|
| Acceptance criteria met | All FEAT-001 through FEAT-006 ACs pass |
| Scope compliance | In-scope delivered, out-of-scope not built |
| Value alignment | CAP-08 objectives met |
| Stakeholder expectations | Login, register, RBAC, tenant isolation working |

**Expected Result:** Approved

### Gate 3: Code Review

**Keeper:** QA Director AI

| Criterion | Verification |
|-----------|-------------|
| Coding standards | NestJS conventions, TypeScript strict mode |
| No TODO/FIXME | Zero markers in production code |
| Logging | Appropriate levels (INFO, WARN, ERROR) |
| Error handling | All error states handled, no swallowed exceptions |
| No secrets | Zero hardcoded credentials |

**Expected Result:** Approved

### Gate 4: QA Review

**Keeper:** QA Director AI

| Criterion | Verification |
|-----------|-------------|
| Unit tests pass | ≥80% line coverage on new code |
| Integration tests pass | All 8 integration tests green |
| E2E tests pass | All 6 Playwright tests green |
| BDD scenarios automated | All scenarios converted to tests |
| No regressions | Existing tests continue to pass |

**Expected Result:** Approved

### Gate 5: Security Review

**Keeper:** Security Architect AI (veto power)

| Criterion | Verification |
|-----------|-------------|
| Authentication enforced | JWT required for all non-public endpoints |
| Authorization correct | RBAC matrix verified for all 8 roles |
| Input validation | All inputs validated, SQL injection prevented |
| Rate limiting | Auth: 5/15min, Standard: 100/min |
| Secrets management | No hardcoded secrets; env vars + CI injection |
| Dependency scan | Zero critical vulnerabilities |
| XSS/CSRF protection | CSP headers, httpOnly cookies, CSRF tokens |

**Expected Result:** Approved

### Gate 6: Performance Review

**Keeper:** Performance Engineer AI

| Criterion | Verification |
|-----------|-------------|
| Login response time | < 500ms P95 |
| Token generation | < 100ms |
| DB query performance | No N+1, appropriate indexes on email, tenant_id |
| Concurrent logins | 100 concurrent login attempts succeed |

**Expected Result:** Approved

### Gate 7: Documentation Review

**Keeper:** Documentation Engineer AI

| Criterion | Verification |
|-----------|-------------|
| API docs complete | OpenAPI spec covers all auth endpoints |
| Deployment guide | Docker Compose, env vars, seed steps documented |
| Developer onboarding | Setup, config, and first login documented |

**Expected Result:** Approved

### Gate 8: Executive Approval

**Keeper:** Chief Executive AI + Human CEO

| Criterion | Verification |
|-----------|-------------|
| All gates passed | Gates 1-7 all "Approved" |
| Business value realized | Foundation for all other epics established |
| Risk assessment | Risks identified and mitigated |
| Release plan | Zero-downtime migration, feature flag if needed |

**Expected Result:** Approved

---

## 9. Sprint Mapping (Program 2.5)

### Sprint 000 — Development Environment Setup

**Context Pack:** CP-Authentication

**Epic Deliverables for Sprint 000:**

| Feature | Story Points | Status |
|---------|-------------|--------|
| FEAT-001 — User Authentication | 13 | Sprint 000 |
| FEAT-002 — User Profile & Password | 5 | Sprint 000 |
| FEAT-005 — Multi-Tenant Isolation | 5 | Sprint 000 |
| FEAT-006 — Auth UI (login, register, profile) | 8 | Sprint 000 |

**AI Agents Active:**
- Backend Lead AI — AuthModule, JWT, guards, services
- Frontend Lead AI — Login, register, profile screens
- Database Architect AI — Schema, migration, seed
- DevOps Architect AI — Docker Compose, CI/CD

**Sprint Goal:**
Establish platform authentication: users can register, login, manage profiles, and access the platform with full tenant isolation.

**Sprint Backlog (Program 3 format):**

| Task ID | Description | Assignee | Effort | Status |
|---------|-------------|----------|--------|--------|
| T-001-01 | Auth module with JWT strategy | Backend Lead AI | 8h | Sprint Backlog |
| T-001-02 | Login screen | Frontend Lead AI | 6h | Sprint Backlog |
| T-001-03 | DB migration for auth schema | Database Architect AI | 4h | Sprint Backlog |
| T-001-04 | Auth audit logging | Backend Lead AI | 3h | Sprint Backlog |
| T-001-05 | Register screen | Frontend Lead AI | 4h | Sprint Backlog |
| T-001-06 | Profile management API | Backend Lead AI | 4h | Sprint Backlog |
| T-001-07 | Profile screen | Frontend Lead AI | 4h | Sprint Backlog |
| T-001-08 | Multi-tenant TenantGuard | Backend Lead AI | 3h | Sprint Backlog |
| T-001-09 | Password management API | Backend Lead AI | 3h | Sprint Backlog |

### Sprint 001 — Commercial CRM

**Context Pack:** CP-Authentication + CP-CRM-Leads

**Epic Deliverables for Sprint 001:**

| Feature | Story Points | Status |
|---------|-------------|--------|
| FEAT-003 — Admin User Management | 8 | Sprint 001 |
| FEAT-004 — Role-Based Access Control | 8 | Sprint 001 |
| FEAT-006 — Auth UI (admin screens) | 5 | Sprint 001 |

**Sprint Goal:**
Complete RBAC system and admin user management so that CRM epics have full authorization infrastructure.

---

## 10. Traceability Chain Verification

This section proves every artifact in EPIC-001 traces back to Program 1 through Programs 2.5 and 3.

```
Program 1 (Blueprint)                    Program 2.5 (Mapping)           Program 3 (Execution)
╔══════════════════════════════════════╗ ╔══════════════════════════════╗ ╔══════════════════════════╗
║ ADR-007 (JWT Auth)                  ║ ║                              ║ ║ EPIC-001                 ║
║ ADR-005 (Multi-Tenancy)             ║─╼ CP-Authentication Context    ║─╼ ├── FEAT-001 (Auth)      ║
║ CAP-08 (Identity & Access)          ║   Pack                          ║   ├── FEAT-002 (Profile)  ║
║ SEC-AUTH (Authentication Design)    ║   (12 documents, 7 tables,     ║   ├── FEAT-003 (Users)    ║
║ SEC-AUTHZ (Authorization Design)    ║    16 APIs, 11 screens,        ║   ├── FEAT-004 (RBAC)     ║
║ PORT-PERM (Portal Permissions)      ║    18-day estimate)            ║   ├── FEAT-005 (Tenant)   ║
║ API-AUTH (Auth Endpoints)           ║    │                           ║   └── FEAT-006 (UI)      ║
║ IDN (Identity Implementation)       ║    │                           ║         │                ║
║ SEC-FOUND (Security Foundation)     ║    │                           ║    ┌────┴─────┐          ║
║ PRISMA (Data Model)                 ║    │                           ║ ┌──┴──┐  ┌───┴───┐      ║
║ SEEDS (Seed Data)                   ║    v                           ║ │Stories│ │ Tasks │      ║
║ Shared Kernel Roles/Permissions     ║  Sprint Maps                   ║ └──┬──┘  └───┬───┘      ║
╚══════════════════════════════════════╝  ├── Sprint 000 (Setup)       ║    │         │          ║
                                          │     - CP-Authentication    ║    │    ┌────┴─────┐    ║
                                          └── Sprint 001 (CRM)         ║    │    │Deliverable│    ║
                                               - CP-Auth + CP-CRM      ║    │    │ Contracts │    ║
                                                                       ║    │    └──────────┘    ║
                                                                       ║    │                    ║
                                   Program 2 (AI Organization)         ║    v                    ║
                                   ╔═══════════════════════════════════╣ ┌─────┐                  ║
                                   ║ Agent Assignments:               ║ │Quality               ║
                                   ║ Solution Architect AI            ║ │Gates │                  ║
                                   ║ Backend Lead AI                  ║ └─────┘                  ║
                                   ║ Frontend Lead AI                 ╚══════════════════════════╝
                                   ║ Database Architect AI
                                   ║ Security Architect AI
                                   ║ QA Director AI
                                   ║ DevOps Architect AI
                                   ║ Product Owner AI
                                   ║ Program Manager AI
                                   ╚═══════════════════════════════════╝
```

### Traceability Verification: Every Artifact Traces to Program 1

| Artifact | Traces To | Program 1 Source | Verification |
|----------|-----------|-----------------|-------------|
| EPIC-001 | CAP-08, OBJ-001 | `PHASE-02/21-Implementation Blueprint.md` | Strategic alignment confirmed |
| FEAT-001 (Auth) | ADR-007, SEC-AUTH, API-AUTH | `PHASE-03/10-SECURITY-DESIGN/Authentication.md` | JWT 15min/7d, bcrypt 12, rate limiting |
| FEAT-004 (RBAC) | SEC-AUTHZ, PORT-PERM | `PHASE-03/10-SECURITY-DESIGN/Authorization.md` | 8 roles, permission matrix verified |
| FEAT-005 (Tenant) | ADR-005, SK-09 | `PHASE-01/ADR-005-MultiTenancy.md` | Schema-per-tenant, TenantGuard |
| T-001-01 (JWT) | IDN, ADR-007 | `PHASE-05/02-IDENTITY/Authentication.md` | Passport JWT, RS256, 15min/7d |
| T-001-03 (Migration) | PRISMA, SEEDS | `PHASE-05/06-DATA-FOUNDATION/Prisma.md` | Users, roles, permissions tables |
| Auth Audit | SK-08 | `PHASE-06/00-SHARED-KERNEL/Events.md` | Domain events with tenant context |
| Seed Data | SEEDS | `PHASE-05/06-DATA-FOUNDATION/Seeds.md` | admin@triangleblack.tech |
| API Spec | API-AUTH | `PHASE-03/07-API-DESIGN/Auth-Endpoints.md` | All 16 auth endpoints specified |
| Guard Stack | SEC-FOUND | `PHASE-05/Security-Foundation.md` | JwtAuth→Roles→Permission→Tenant→Throttler |

### No Invented Requirements

Every requirement in EPIC-001 is traced to a Program 1 source document. No requirement was invented by the AI.

| Requirement | Source | Evidence |
|-------------|--------|----------|
| JWT access token 15min | ADR-007 §3 | "access token validity: 15 minutes" |
| JWT refresh token 7d | ADR-007 §3 | "refresh token validity: 7 days" |
| bcrypt cost 12 | ADR-007 §4 | "bcrypt hashing cost factor: 12" |
| Rate limit 5/15min | Auth-Endpoints.md | "POST /auth/login — rate limit 5/min" |
| 8-role hierarchy | Portal-Permissions.md | super_admin 100 -> client_user 10 |
| Password complexity 2of4 | Authentication.md | "min 8 chars, 2 of 4 complexity" |
| Schema-per-tenant | ADR-005 | "data isolation across tenants" |
| Cannot deactivate self | Approval-Flows.md BR-ADM-03 | "cannot deactivate own account" |

---

## 11. Validation Conclusions

### Pass Criteria

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Program 3 Epic Template correctly instantiated with real data | PASS — EPIC-001 fully populated |
| 2 | Feature decomposition traces to Program 2.5 context pack | PASS — 6 features from CP-Authentication |
| 3 | User stories include BDD scenarios per Program 3 standards | PASS — US-001, US-002 with BDD |
| 4 | Task decomposition uses Program 3 task types | PASS — Backend, Frontend, Database, Engineering |
| 5 | AI agents assigned per Program 2 organization | PASS — 9 agents mapped with authority levels |
| 6 | Deliverable contracts specified per Program 3 contract types | PASS — Source Code, Tests, API, Migrations, Docs |
| 7 | Quality gates defined per Program 3's 8 gate types | PASS — All 8 gates with criteria and keepers |
| 8 | Sprint mapping aligns with Program 2.5 sprint maps | PASS — Sprint 000 + Sprint 001 |
| 9 | Every artifact traces to Program 1 | PASS — Full traceability matrix verified |
| 10 | No invented requirements | PASS — Every requirement has Program 1 source |

### Overall Validation Result

**Program 3 is validated as correctly consuming Programs 1, 2, and 2.5.**

The Authentication & Authorization epic demonstrates:
1. **Program 1** provides authoritative blueprint documents (ADRs, designs, implementations)
2. **Program 2.5** compiles those documents into deterministic context packs (CP-Authentication)
3. **Program 3** instantiates the execution artifacts (epic, features, stories, tasks, contracts, gates)
4. **Program 2** assigns the right AI agents with appropriate authority and quality gates
5. **Traceability** is maintained end-to-end with no invented requirements

### Next Steps for Triangle Black

1. Execute Sprint 000 using the backlog defined above
2. Create the actual project repository (Next.js 15 + NestJS 11 + Prisma 6)
3. Generate docker-compose.yml and CI/CD pipeline
4. Begin iterating through the 23-sprint plan per Program 2.5 sprint maps
5. Use the full AI organization (17 agents) as capacity grows
