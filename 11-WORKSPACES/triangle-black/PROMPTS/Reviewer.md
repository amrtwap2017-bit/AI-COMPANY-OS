# Code Review Prompt

Model: deepseek-r1:8b

Use for: reviewing any code change

Template:
---
Review this Triangle Black code.

Check:
1. DDD: correct bounded context?
2. Architecture: layers respected?
3. Security: tenant_id in every query?
4. Quality: type hints, docstrings, no bare except?
5. Patterns: follows existing code patterns?

Code: [paste code]

Output:
## Issues Found
| Severity | File | Line | Issue | Fix |

## Verdict
APPROVE / REQUEST CHANGES
---
