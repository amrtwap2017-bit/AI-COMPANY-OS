# Security Checklist — MANDATORY before every PR

## Multi-Tenant (CRITICAL)
- [ ] Every query: .filter(Model.tenant_id == tenant_id)
- [ ] tenant_id from JWT token only (never request body)
- [ ] No cross-tenant data access possible
- [ ] ChromaDB collection: tb_{tenant_id}_knowledge
- [ ] Files: uploads/{tenant_id}/

## Authentication
- [ ] All protected routes require valid JWT
- [ ] No hardcoded credentials
- [ ] Secrets in .env only

## Data
- [ ] No PII in logs
- [ ] Passwords bcrypt hashed
- [ ] File uploads validated

FAIL = escalate to Amr immediately
Reviewer: Security Agent (REQUIRED)
