# 06 — VPS

> VPS configuration validation.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-04 | DevOps-Architecture.md | VPS requirements |
| PHASE-02 | DevOps-Architecture.md | Infrastructure stack |

## VPS Specification

| Parameter | Specification | Status |
|-----------|--------------|--------|
| Provider | DigitalOcean | ✅ Selected |
| Plan | Basic ($6-40/mo) | ✅ Budget set |
| OS | Ubuntu 24.04 LTS | ❌ Pending |
| CPU | 1-2 vCPU | ❌ Pending |
| RAM | 1-4 GB | ❌ Pending |
| Storage | 25-80 GB | ❌ Pending |
| Region | Frankfurt / Amsterdam (EU) | ❌ Pending |

## Hardening Checklist

- [ ] SSH key authentication only (no passwords)
- [ ] UFW firewall enabled (ports 22, 80, 443 only)
- [ ] Fail2ban configured for SSH
- [ ] Automatic security updates enabled
- [ ] Root login disabled
- [ ] Docker installed and configured
- [ ] Docker Compose installed
- [ ] Nginx installed as reverse proxy
- [ ] Swap configured (2GB)
- [ ] Monitoring agent installed
- [ ] Timezone set to Cairo (Africa/Cairo)

## Validation

- [ ] VPS provisioned and accessible
- [ ] All hardening steps completed
- [ ] Security scan passes (open ports verified)
- [ ] Performance baseline recorded

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT PROVISIONED
