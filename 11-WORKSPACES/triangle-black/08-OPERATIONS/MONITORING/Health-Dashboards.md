# 06 — Health Dashboards

> Health dashboards for monitoring platform status.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 4 | Observability.md | Observability |
| Phase 9 | Production-Monitoring.md | Monitoring setup |

## Dashboard: Platform Health

```
═══════════════════════════════════════════
PLATFORM HEALTH DASHBOARD (Real-time)
═══════════════════════════════════════════

INFRASTRUCTURE
──────────────
VPS CPU:      [░░░░░░░░░░] 0%    🔴 THRESHOLD: > 80%
VPS RAM:      [░░░░░░░░░░] 0%    🔴 THRESHOLD: > 80%
VPS Disk:     [░░░░░░░░░░] 0%    🔴 THRESHOLD: > 80%
Swap:         [░░░░░░░░░░] 0%    🔴 THRESHOLD: > 50%

SERVICES (Last Check: --)
────────
Nginx:        [🔴] DOWN           ❌
API:          [🔴] DOWN           ❌
Web:          [🔴] DOWN           ❌
PostgreSQL:   [🔴] DOWN           ❌
Worker:       [🔴] DOWN           ❌

API PERFORMANCE (Last 24h)
────────────────
Requests/min:  0
Avg Response:  0ms
P95 Response:  0ms
P99 Response:  0ms
Error Rate:    0%          🔴 THRESHOLD: > 1%

SSL CERTIFICATES
────────────────
app.triangleblack.com:  [🔴] EXPIRED / UNKNOWN
```

## Dashboard: Business Health

```
═══════════════════════════════════════════
BUSINESS HEALTH DASHBOARD
═══════════════════════════════════════════

CUSTOMERS
──────────
Active Hotels:      0
Active Users:       0
New Signups (7d):   0

RESERVATIONS
─────────────
Today:          0
This Week:      0
This Month:     0

REVENUE
────────
MRR:            $0
Setup Fees:     $0
Total Revenue:  $0

SUPPORT
────────
Open Tickets:   0
Avg Response:   0m
CSAT Score:     0.0/5
```

## Dashboard Access

| Dashboard | URL | Access | Notes |
|-----------|-----|--------|-------|
| Platform Health | localhost:3001 (Uptime Kuma) | DevOps + CTO | Docker host only |
| Docker Stats | `docker stats` (CLI) | DevOps | CLI access |
| Business Health | PostgreSQL query | COO | Manual query (V1) |

## Dashboard Maintenance

- Dashboards updated when new services added
- Alert thresholds reviewed monthly
- Dashboard access reviewed quarterly
- Historical data retained: 90 days (V1)

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT CONFIGURED
