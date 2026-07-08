# Security Incident Response Plan

## Overview

This plan defines how Triangle Black detects, responds to, and recovers from security incidents. The plan follows NIST SP 800-61 guidelines: Preparation, Detection & Analysis, Containment Eradication & Recovery, and Post-Incident Activity.

## Incident Severity Levels

| Level | Name | Description | Response Time | Examples |
|-------|------|-------------|---------------|----------|
| **SEV-1** | Critical | Active data breach, system compromise, ransomware | Immediate (< 15 min) | Database exfiltrated, admin account compromised, ransomware |
| **SEV-2** | High | Potential breach, active attack, significant data exposure | < 1 hour | WAF alerts showing attack pattern, unusual API activity |
| **SEV-3** | Medium | Suspicious activity, attempted breach, policy violation | < 4 hours | Failed login spike, unusual IP pattern, policy violation |
| **SEV-4** | Low | Minor incident, configuration issue, false positive | < 24 hours | Rate limit exceeded, accidental data exposure (non-sensitive) |

## Roles & Responsibilities

| Role | Person | Responsibilities | Backup |
|------|--------|------------------|--------|
| Incident Commander (IC) | DevOps Lead | Overall coordination, decision-making, communication | CTO |
| Security Lead | CTO | Technical investigation, containment, evidence collection | DevOps Lead |
| Communications Lead | CEO/COO | Client communication, public statements, regulatory reporting | IC |
| Engineering Support | Engineering Lead | System restoration, patching, forensic support | DevOps Lead |
| Legal Counsel | External | Regulatory requirements, liability assessment, breach notification | - |

## Incident Response Phases

### Phase 1: Detection & Analysis

#### How Incidents Are Detected

| Detection Method | Source | Typical Severity |
|------------------|--------|------------------|
| Cloudflare WAF alerts | Cloudflare dashboard | SEV-3 |
| Uptime Robot downtime | External monitoring | SEV-2 |
| Fail2ban notifications | Server logs | SEV-4 |
| Audit log anomalies | Manual review / automated pattern | SEV-3 |
| User reports | Support email / in-app report | SEV-2 |
| Resource alerts | Cron-based monitoring | SEV-4 |
| External notification | Bug bounty, security researcher, law enforcement | SEV-1 |

#### Initial Analysis Checklist

```
□ Confirm incident is real (not false positive)
□ Determine severity level (SEV-1 through SEV-4)
□ Identify affected systems and data
□ Capture initial evidence (logs, timestamps, screenshots)
□ Determine attack vector (how did this happen?)
□ Check if attack is ongoing
□ Notify Incident Commander
```

### Phase 2: Containment

#### Short-Term Containment (Immediate)

| Action | SEV-1 | SEV-2 | SEV-3 | SEV-4 |
|--------|-------|-------|-------|-------|
| Block attacker IP in Cloudflare WAF | ✅ | ✅ | ✅ | Optional |
| Disable compromised user account | ✅ | ✅ | ✅ | ✅ |
| Rotate exposed credentials | ✅ | ✅ | Review | Review |
| Isolate compromised container | ✅ | ✅ | Optional | - |
| Disable public access (maintenance page) | ✅ | Optional | - | - |
| Block outbound traffic from container | ✅ | ✅ | Optional | - |
| Take forensic snapshot of server | ✅ | ✅ | - | - |

#### Long-Term Containment

```
□ Implement temporary WAF rules
□ Create rate limits on affected endpoints
□ Enable additional logging on affected systems
□ Deploy hotfix if vulnerability identified
□ Move to read-only mode if data integrity at risk
```

### Phase 3: Eradication

```
□ Identify root cause
□ Remove attacker access / persistence mechanisms
□ Patch vulnerability
□ Rotate ALL credentials (not just exposed ones)
□ Verify no backdoors remain
□ Rebuild compromised systems from clean backups
□ Update WAF rules to prevent similar attacks
```

### Phase 4: Recovery

```
□ Restore from clean backup (if data compromised)
□ Verify system integrity
□ Restore services in order:
   1. Database (confirm integrity)
   2. Backend (verify with health check)
   3. Frontend (verify application works)
   4. Nginx (verify secure configuration)
   5. Monitoring (verify alerts active)
□ Test application functionality
□ Gradually restore user access
□ Monitor logs intensely for 48 hours post-recovery
```

### Phase 5: Post-Incident

#### Post-Mortem Meeting

Held within 48 hours of incident resolution.

**Agenda:**

1. **Timeline** — What happened, when, and who was involved
2. **Root cause** — Why did this happen? (5 Whys analysis)
3. **Detection** — How was it detected? Could it have been detected earlier?
4. **Response** — What went well? What went wrong?
5. **Containment** — Was containment effective? Could it be faster?
6. **Recovery** — How long did recovery take? Data loss?
7. **Improvements** — What changes prevent recurrence?

#### Post-Mortem Document Template

```markdown
# Security Incident Post-Mortem

## Incident Summary
- **Date:** YYYY-MM-DD
- **Severity:** SEV-X
- **Duration:** X hours X minutes
- **Affected Systems:** [list]
- **Impact:** [data loss, downtime, exposure]

## Timeline
| Time | Event |
|------|-------|
| HH:MM | Initial detection |
| HH:MM | Incident declared |
| HH:MM | Containment initiated |
| HH:MM | Eradication complete |
| HH:MM | Recovery started |
| HH:MM | Services restored |
| HH:MM | Post-mortem held |

## Root Cause
[Description of root cause]

## What Went Well
- [List]

## What Went Wrong
- [List]

## Action Items
| # | Action | Owner | Due |
|---|--------|-------|-----|
| 1 | [Action] | [Owner] | [Date] |
| 2 | [Action] | [Owner] | [Date] |

## Lessons Learned
[Key takeaways]
```

## Communication Templates

### Internal Notification (Slack #ops)

```
🚨 SECURITY INCIDENT DECLARED
Severity: SEV-[1-4]
Time: [HH:MM UTC]
Status: [Detecting / Containing / Eradicating / Recovering]
Affected: [systems]
Lead: [IC name]
Next update: [time]
```

### Client Communication (if required)

```
Subject: Security Incident Notification — Triangle Black

Dear [Client Name],

Triangle Black has identified and contained a security incident
affecting [brief description of scope]. Our investigation indicates
that [affected data, if any].

We have taken the following actions:
1. [Action taken]
2. [Action taken]

Your data remains [protected / we are taking steps to protect].

We will provide updates [timeline]. For questions, contact
security@triangleblack.com.

Sincerely,
[Name]
CTO, Triangle Black
```

### Regulatory Notification (if required)

Follow jurisdiction-specific requirements:
- **Egypt:** Data Protection Law (Law No. 151 of 2020) — 72 hours
- **EU (GDPR):** 72 hours to supervisory authority
- **Client contracts:** Review contractual breach notification terms

## Incident Classification Tree

```
Is there evidence of unauthorized data access?
├── YES ──► Is the data exfiltrated?
│   ├── YES ──► SEV-1: Data breach
│   └── NO  ──► SEV-2: Potential breach
└── NO  ──► Is there an active attack?
    ├── YES ──► Is it automated (bot)?
    │   ├── YES ──► SEV-3: Automated attack
    │   └── NO  ──► SEV-2: Targeted attack
    └── NO  ──► Was there unauthorized access?
        ├── YES ──► SEV-2: Unauthorized access
        └── NO  ──► SEV-3/4: Suspicious activity
```

## Contact Tree

```
Incident Detected
    │
    ▼
Notify Incident Commander (DevOps Lead)
    │
    ├── Not available? ──► Notify CTO (Security Lead)
    │                           │
    │                           └── Not available? ──► Notify CEO
    │
    ▼
IC Assesses Severity
    │
    ├── SEV-1/2 ──► Full response team activated
    │   ├── Security Lead (CTO) ──► Technical investigation
    │   ├── Communications Lead (CEO/COO) ──► External communication
    │   └── Engineering Support ──► Technical response
    │
    └── SEV-3/4 ──► IC + Security Lead handle; notify team if needed
```

## Post-Incident Improvement

| Item | Frequency | Owner |
|------|-----------|-------|
| Review and update incident response plan | Quarterly | Security Lead |
| Tabletop exercise | Bi-annual | DevOps Lead |
| Test backup restoration | Quarterly | DevOps Lead |
| Review WAF rules | Monthly | DevOps Lead |
| Update detection rules | Monthly | Security Lead |
| Security awareness training | Annual + on incident | CTO |

## Digital Forensics (V2)

For SEV-1 incidents in V2+, maintain forensic readiness:

- **Log preservation:** Immutable audit logs in separate storage
- **Container forensics:** Ability to capture container snapshots without destroying evidence
- **Network forensics:** pcap or flow logs for traffic analysis
- **Memory forensics:** Tooling to capture and analyze container memory
- **Chain of custody:** Documented evidence handling procedure

## References

- NIST SP 800-61 Rev 2: Computer Security Incident Handling Guide
- SANS Incident Handler's Handbook
- Cloudflare Security Incident Response Guide
