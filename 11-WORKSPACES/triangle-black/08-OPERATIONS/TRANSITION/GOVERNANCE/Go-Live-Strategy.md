# 01 — Go-Live Strategy

> Strategic approach to going live with Triangle Black.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 0 | Vision-Architecture.md | Product vision |
| Phase 8 | GO-LIVE-CRITERIA.md | Readiness criteria |
| Phase 8 | MASTER-READINESS.md | Readiness scores |
| Root | 00-ENTERPRISE-ARCHITECTURE.md | Enterprise strategy |

## Go-Live Phases

```
PRE-LAUNCH (Week 1) ──► DEPLOYMENT (Week 2) ──► PILOT (Week 3-4) ──► STABILIZE (Week 5-6)
     │                      │                       │                      │
   ✓ Phase 8 signed       ✓ Production live       ✓ 1st customer        ✓ Metrics green
   ✓ Team trained         ✓ DNS cutover           ✓ Feedback loop       ✓ Hypercare exit
   ✓ Support ready        ✓ SSL valid             ✓ Issues triaged      ✓ BAU handover
   ✓ Infrastructure       ✓ Monitoring active     ✓ Performance tuned
   ✓ DR tested            ✓ Security ops active
```

## Go-Live Principles

1. **Phased rollout** — Never flip a switch for everyone at once
2. **First customer is a partner** — Choose carefully, support heavily
3. **Feature parity is not required** — Launch with core only
4. **Rollback is not failure** — It's the responsible choice
5. **Communication overcomms** — Over-communicate, not under
6. **Customer experience first** — If it hurts the customer, don't do it

## Pilot Customer Criteria

| Criterion | Requirement | Weight |
|-----------|-------------|--------|
| Technical capability | Willing to test, provide feedback | High |
| Relationship | Existing trust, warm lead | High |
| Size | Small-medium hotel (< 100 rooms) | Medium |
| Geography | Cairo area (onsite support possible) | Medium |
| Contract flexibility | Month-to-month preferred | Low |

## Launch Decision Framework

```
Are Phase 8 scores ≥ 7.0 per section? ──NO──► Fix gaps before launch
                    │
                   YES
                    │
           Is production deployment verified? ──NO──► Deploy + verify
                    │
                   YES
                    │
           Is first customer ready? ──NO──► Prepare onboarding
                    │
                   YES
                    │
           Executive Committee approves? ──NO──► Address concerns
                    │
                   YES
                    │
           ┌──► GO FOR LAUNCH ◄──┐
```

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Platform uptime | > 99.5% | Monthly |
| Customer satisfaction | > 4.0/5 | Survey |
| Support response time | < 4 hours | Average |
| Critical incidents | < 3 in first month | Count |
| Revenue (first month) | > $0 (first customer live) | Actual |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |
| COO | | | |

**Status:** ❌ NOT APPROVED
