# Testing Prompt

Model: qwen2.5-coder:7b

Use for: writing pytest tests

Template:
---
Write pytest tests for Triangle Black.

REQUIRED TESTS:
1. Happy path for each function
2. TENANT ISOLATION: tenant A cannot see tenant B data
3. Not found returns 404
4. Invalid input returns 422
5. Unauthenticated returns 401

Tenant isolation test MUST look like this:
async def test_tenant_isolation(db):
    item = await service.create(db, "tenant-a", data)
    result = await service.get(db, "tenant-b", item.id)
    assert result is None

Service code: [paste service.py]

Write complete test file with all imports.
---
