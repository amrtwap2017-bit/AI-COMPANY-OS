# Refactoring Prompt

Model: qwen2.5-coder-32k

Use for: safely refactoring existing code

Template:
---
Refactor this Triangle Black code safely.

CONSTRAINTS:
- Must not change API contracts
- Must not break existing tests
- Must maintain tenant isolation
- Do not delete code, only improve

Code: [paste code]
Goal: [what to improve]
Tests: [paste tests]

Produce:
1. Refactored code
2. What changed and why
3. Verify tests still pass
---
