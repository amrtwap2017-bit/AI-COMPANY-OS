# Triangle Black — Risk Register
**Date:** 2026-08-29

## Critical Risks

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R001 | Data loss (no auto backup) | MEDIUM | CRITICAL | Sprint 3: automate backup + monitor |
| R002 | Dev=prod environment | HIGH | HIGH | Sprint 3: create staging |
| R003 | No real customer validation | HIGH | HIGH | Sprint 8: pilot program |
| R004 | Single point of failure (localhost) | HIGH | CRITICAL | Deploy to cloud VM |
| R005 | @ts-nocheck hiding TS errors | MEDIUM | MEDIUM | Systematic removal |

## Security Risks

| ID | Risk | Status | Action |
|----|------|--------|--------|
| SR001 | JWT secret in env (not rotated) | ACCEPTABLE | Document rotation procedure |
| SR002 | DB credentials in scripts | ACCEPTABLE for dev | Move to secrets manager for prod |
| SR003 | No WAF in production | LOW for now | Add when exposed to internet |
| SR004 | Rate limiting disabled in dev | ACCEPTABLE | Ensure DISABLE_RATE_LIMIT=0 in prod |

## Commercial Risks

| ID | Risk | Probability | Mitigation |
|----|------|-------------|------------|
| CR001 | No customer = no feedback | HIGH | Execute pilot in 2 weeks |
| CR002 | Platform too complex for first user | MEDIUM | Guided onboarding + pilot support |
| CR003 | Competitor enters market | LOW | Speed to first customer |
