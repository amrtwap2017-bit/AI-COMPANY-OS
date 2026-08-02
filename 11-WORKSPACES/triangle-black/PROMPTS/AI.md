# AI Feature Prompt

Model: deepseek-r1:8b for design, qwen2.5-coder:7b for code

Use for: building AI features

Template:
---
Design an AI feature for Triangle Black.

Privacy rules:
- Local Ollama only (no external APIs with PII)
- ChromaDB collections: tb_{tenant_id}_knowledge
- AI outputs must be validated before storing

Feature: [describe]

Design:
1. Data flow
2. Tenant isolation
3. Fallback if AI unavailable
4. Audit trail

Then write the Python service code.
---
