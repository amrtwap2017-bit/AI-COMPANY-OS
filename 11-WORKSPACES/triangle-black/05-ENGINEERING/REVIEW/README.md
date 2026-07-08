# 18 — Review Process

## Review Types

| Type | When | Who | Duration Target |
|------|------|-----|-----------------|
| Architecture Review | New module, ADR, infrastructure | Chief Architect + Engineering Lead | 1-2 days |
| Code Review | Every PR | Peer developer | < 24 hours |
| Security Review | Every PR (automated) + weekly (manual) | Security AI + Engineering Lead | Automated: instant |
| Database Review | Migration, new table | Database AI + Chief Architect | < 24 hours |
| UX Review | New page, new flow | Engineering Lead | 1 day |
| AI Review | AI-generated code | Same as code review | < 24 hours |

## Code Review Checklist

```
□ Code follows Phase 4 coding standards (05-CODING-STANDARDS)
□ No unnecessary complexity (YAGNI validation)
□ Error states handled (loading, empty, error, edge cases)
□ All states visible in screen spec covered
□ No secrets or credentials
□ API contracts respected
□ Database queries are efficient (N+1 check)
□ Tests exist and pass
□ Documentation updated (if applicable)
□ Branch up to date with target
```

## Review Response SLA

| Priority | First Response | Merge Target |
|----------|---------------|--------------|
| Critical (hotfix) | 2 hours | 4 hours |
| High (blocking feature) | 4 hours | 24 hours |
| Normal (feature) | 24 hours | 48 hours |
| Low (docs, refactor) | 48 hours | 1 week |

## Review Escalation

If a PR is unreviewed beyond SLA:
1. Ping reviewer in PR comments
2. Escalate to Engineering Lead
3. Reassign to available reviewer

## Review Disagreement Resolution

1. Author and reviewer discuss in PR comments
2. If unresolved, Engineering Lead makes final decision
3. Architecture disagreements → Chief Architect
