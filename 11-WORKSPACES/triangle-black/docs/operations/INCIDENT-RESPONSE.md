# TRIANGLE BLACK — Incident Response Procedure
## Version: V14.5.1

## SEVERITY LEVELS

| Level | Definition | Response Target |
|-------|-----------|-----------------|
| P0 | Security breach or full outage | Immediate |
| P1 | Major customer functionality unavailable | 1 hour |
| P2 | Degraded functionality | 4 hours |
| P3 | Minor issue | Next business day |

## RESPONSE PROCEDURE

1. DETECT — monitoring alert or customer report
2. ACKNOWLEDGE — confirm incident, assign severity, notify owner
3. CONTAIN — prevent further damage (disable affected feature if needed)
4. RECOVER — restore service (use PRODUCTION-ROLLBACK.md)
5. VERIFY — confirm recovery with smoke test
6. COMMUNICATE — notify affected customers
7. RCA — root cause analysis (within 24h for P0/P1)
8. PREVENT — implement prevention measures

## COMMUNICATION TEMPLATE

Subject: [Triangle Black] Service Update - [Date]
Status: Investigating | Identified | Monitoring | Resolved
Impact: [description of what is affected]
Next Update: [time]

## MONITORING ALERTS TO WATCH
- API DOWN (UptimeRobot)
- Portal DOWN (UptimeRobot)
- Disk > 80%
- 5xx spike
- Backup age > 25h
- SSL expiry < 30 days
- Container restart loop

## POST-INCIDENT REPORT TEMPLATE
File: docs/operations/INCIDENT-<YYYY-MM-DD>-<slug>.md

Fields:
- Start time
- Detection method
- Severity
- Customer impact
- Root cause
- Actions taken
- Resolution time
- Prevention measures
- Risk register update
