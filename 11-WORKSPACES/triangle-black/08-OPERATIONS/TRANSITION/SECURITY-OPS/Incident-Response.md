# 07 — Incident Response (Security)

> Security incident response procedures.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 5 | Security-Foundation.md | Security foundation |
| Phase 8 | 05-SECURITY-READINESS/Incident-Response.md | Incident response |

## Security Incident Types

| Type | Definition | Severity | Examples |
|------|-----------|----------|----------|
| Unauthorized Access | Someone accessed without permission | CRITICAL | Account takeover, SSH breach |
| Data Breach | Customer data exposed | CRITICAL | DB leaked, API data exposed |
| Denial of Service | Service unavailable due to attack | HIGH | DDOS, resource exhaustion |
| Malware | Malicious software on systems | CRITICAL | Ransomware, cryptominer |
| Social Engineering | Team member tricked | HIGH | Phishing, pretexting |
| Policy Violation | Security policy not followed | MEDIUM | Password sharing, unapproved access |

## Security Incident Response Process

```
Detect ──► Contain ──► Eradicate ──► Recover ──► Postmortem
   │         │            │            │            │
  Alert     Isolate     Remove       Restore      Learn
  received  affected    threat       from         and
            system      vector       backup       improve
```

## Immediate Response Actions

### Unauthorized Access
1. Revoke affected credentials immediately
2. Block source IP at Nginx level
3. Force password reset for all users
4. Review audit logs for scope of access
5. Notify affected customers within 24 hours

### Data Breach
1. Take affected service offline
2. Rotate all secrets and keys
3. Restore from pre-breach backup
4. Engage legal counsel
5. Notify data protection authority (if required)
6. Notify affected customers within 72 hours
7. Conduct forensic analysis

### Denial of Service
1. Enable rate limiting at Nginx
2. Block attacking IPs
3. Scale up VPS if needed
4. Engage VPS provider for DDOS mitigation
5. Monitor for re-emergence

## Security Incident Log

```
─────────────────────────────────────────────
SECURITY INCIDENT LOG
─────────────────────────────────────────────

Incident ID: SEC-001
Date/Time: _____________
Type: [Unauthorized Access / Data Breach / DoS / Malware / Social / Policy]
Severity: [Critical / High / Medium / Low]
Detected by: _____________

Description:
_______________________________________________

Impact:
- Data exposed: [Yes/No] — [details]
- Customers affected: [count]
- Duration: [time]

Actions Taken:
1. ___________________________________________
2. ___________________________________________

Current Status: [Open / Contained / Resolved / Closed]

Notified:
- Authorities: [Yes/No] — Date: _____
- Customers: [Yes/No] — Date: _____
- Legal: [Yes/No] — Date: _____

Postmortem Required: [Yes/No]
```

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT DOCUMENTED
