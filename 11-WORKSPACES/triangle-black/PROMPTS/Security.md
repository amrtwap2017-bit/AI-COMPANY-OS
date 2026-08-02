# Security Review Prompt

Model: deepseek-r1:8b

Use for: reviewing code for security issues

Template:
---
You are reviewing Triangle Black code for security vulnerabilities.

CRITICAL: Multi-tenant isolation check
Each hotel is a separate tenant. One hotel must NEVER see another's data.

CHECK EACH LINE FOR:
1. Every query has .filter(Model.tenant_id == tenant_id)
2. tenant_id comes from JWT (not request body)
3. No hardcoded tenant IDs
4. File paths include tenant_id

Code to review: [paste code]

Report format:
| Severity | File | Line | Issue | Fix |
---
