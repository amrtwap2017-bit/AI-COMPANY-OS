# Documentation Prompt

Model: qwen2.5-coder:7b

Use for: generating markdown documentation

Template:
---
Write API documentation for Triangle Black module.

Module code: [paste code]

Generate:
1. Endpoint table: | Method | URL | Description | Auth | Tenant Scoped |
2. Request/response schemas
3. Error responses
4. Domain events published

Format: markdown ready for 06-DOMAINS/{DOMAIN}/APIs.md
---
