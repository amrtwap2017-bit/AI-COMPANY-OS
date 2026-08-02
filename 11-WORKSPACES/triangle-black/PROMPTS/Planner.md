# Planning Prompt

Model: deepseek-r1:8b

Use for: sprint planning, task breakdown

Template:
---
Plan implementation for Triangle Black.

Task: [describe feature]
Domain spec: [paste 06-DOMAINS/{DOMAIN}/APIs.md]

Produce:
1. Task breakdown table: ID, Task, Layer, Hours, Dependencies
2. Implementation order
3. Acceptance criteria
4. Risks

Note: every backend task needs test task. Every task needs doc update task.
---
