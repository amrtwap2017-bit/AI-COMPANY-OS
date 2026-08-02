# Performance Prompt

Model: deepseek-r1:8b

Use for: finding and fixing performance issues

Template:
---
Find performance issues in this Triangle Black code.

Check for:
1. N+1 query problems
2. Missing database indexes
3. Loading more data than needed
4. Missing pagination
5. Missing caching

Code: [paste code]

For each issue:
| Issue | Location | Fix | Expected improvement |

Then write the optimized code.
---
