# Backend Prompt

Model: qwen2.5-coder:7b

Use for: generating Python FastAPI module code

Template:
---
You are writing Python FastAPI code for Triangle Black multi-tenant SaaS.

MANDATORY RULES:
1. Every endpoint: tenant_id = Depends(get_current_tenant_id) as FIRST dep
2. Every query: .filter(Model.tenant_id == tenant_id)
3. No business logic in router.py
4. Type hints on every function
5. Follow this existing pattern exactly: [paste existing module]

Domain spec to implement: [paste 06-DOMAINS/{DOMAIN}/APIs.md]

Write {router.py / service.py / models.py / schemas.py} for {module}.
---
