# RBAC Gap Report — August 2026

## Current State

| Metric | Value |
|--------|-------|
| Total endpoints | 615 |
| Endpoints with RBAC | 208 |
| Endpoints without RBAC | 407 |
| RBAC coverage | 34% |

## RBAC Systems (Competing)

1. src/core/auth.py — require_role, require_admin, require_manager (CANONICAL)
2. src/main.py line 311 — duplicate require_role inline implementation
3. src/main.py line 7125 — _require_role_301 third implementation

Action: src/core/auth.py is the canonical system. Others are tech debt.

## Highest Risk Unprotected Endpoints

| Endpoint | Risk | Required Role |
|----------|------|--------------|
| POST /api/v1/purchase-requests/{id}/approve | CRITICAL | manager |
| POST /api/v1/contracts/{id}/renew | CRITICAL | manager |
| POST /api/v1/rfq/{id}/award | CRITICAL | manager |
| POST /api/v1/scope-of-work/{id}/approve | CRITICAL | manager |
| POST /api/v1/automation/run | CRITICAL | admin |
| POST /api/v1/work-orders/{id}/complete | HIGH | agent |
| POST /api/v1/work-orders/ | HIGH | agent |
| POST /api/v1/service-requests/ | MEDIUM | agent |
| POST /api/v1/leads/ | MEDIUM | agent |
| POST /api/v1/vendors/ | HIGH | manager |

## Remediation Plan

Sprint-004: Add get_current_user to 10 highest-risk endpoints
Sprint-005+: Systematic RBAC coverage to reach 80%+ by Sprint-010
