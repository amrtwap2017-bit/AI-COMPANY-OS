# 07 — Security Monitoring

> Security monitoring for production operations.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 3 | Security-Architecture.md | Security design |
| Phase 4 | Security-Standards.md | Security standards |
| Phase 5 | Security-Foundation.md | Security implementation |

## Security Monitoring Scope

| Monitor | Tool | Frequency | Data Source |
|---------|------|-----------|-------------|
| SSH access attempts | Fail2ban + auth.log | Real-time | VPS |
| Failed login attempts | App auth logs | Real-time | PostgreSQL |
| API abuse (rate limiting) | Nginx + custom | Real-time | Nginx logs |
| Suspicious IPs | Nginx access log | Daily | Nginx logs |
| File integrity | Manual (V1) | Monthly | VPS |
| User permission changes | App audit logs | Ongoing | PostgreSQL |
| API key usage | App audit logs | Daily | PostgreSQL |
| Database access logs | PostgreSQL logs | Weekly | PostgreSQL |

## Security Alerting

| Alert | Threshold | Severity | Action |
|-------|-----------|----------|--------|
| SSH brute force | > 5 failed attempts/min | CRITICAL | Block IP, notify CTO |
| App login brute force | > 10 failed attempts/min | CRITICAL | Block IP, notify CTO |
| Rate limit exceeded | > 100 requests/min from single IP | WARNING | Auto-block (Nginx) |
| Suspicious SQL | SQL injection pattern in query | CRITICAL | Block IP, notify CTO |
| Unknown SSH key added | Any change | CRITICAL | Investigate, notify CTO |

## Security Monitoring Setup

```bash
# Fail2ban configuration
# /etc/fail2ban/jail.local
[sshd]
enabled = true
maxretry = 5
bantime = 3600

[nginx-http-auth]
enabled = true
maxretry = 10
bantime = 3600

# Check Fail2ban status
sudo fail2ban-client status

# Review auth logs
sudo journalctl -u ssh -n 50
```

## Security Review Cadence

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Review auth logs | Weekly | DevOps Lead |
| Review access list | Monthly | CTO |
| Audit user permissions | Monthly | COO |
| Penetration test | Quarterly | External (V2) |
| Security training | Quarterly | All team |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT CONFIGURED
