# 02 — Feature Flags

> Feature flag strategy for controlled rollout.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 2 | Frontend-Architecture.md | Feature toggle strategy |
| Phase 4 | Coding-Standards.md | Code conventions |

## Feature Flag Architecture

Feature flags are environment variables stored in `.env.production`:
- No external flag management service (VPS budget)
- Flags evaluated at application startup
- Changes require container restart
- Future: real-time flags via database (V2)

## Feature Flag Index

| Flag | Description | Default | Production | Status |
|------|-------------|---------|------------|--------|
| FEATURE_CHANNEL_MANAGER | Channel manager integration | false | false | ❌ |
| FEATURE_ADVANCED_ANALYTICS | Advanced reporting | false | false | ❌ |
| FEATURE_MOBILE_APP | Mobile app access | false | false | ❌ |
| FEATURE_POS_INTEGRATION | POS system integration | false | false | ❌ |
| FEATURE_MULTI_PROPERTY | Multi-property management | false | false | ❌ |
| FEATURE_AI_COPILOT | AI assistant (experimental) | false | false | ❌ |

## Flag Lifecycle

```
Created (dev) ──► Enabled (staging) ──► Enabled (prod, beta) ──► GA ──► Removed
     │                │                       │                      │        │
   Initial           Testing               Limited rollout         All      Code
   code                                      (first customers)     users    cleanup
```

## Adding a New Flag

1. Add flag to `.env.production` with default `false`
2. Add flag to index above
3. Implement flag check in code
4. Test with flag on/off
5. Document in release notes

## Flag Removal

When a feature is GA:
1. Remove flag check from code
2. Remove flag from `.env.production`
3. Remove flag from index
4. Deploy cleaned code

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT CONFIGURED
