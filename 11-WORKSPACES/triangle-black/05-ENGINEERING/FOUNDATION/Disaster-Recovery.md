# Disaster Recovery Procedures

## Overview

Disaster recovery for a single-VPS deployment focuses on three scenarios: data loss, total server failure, and configuration drift. All procedures assume regular backups exist and are verified.

## Prerequisites

Before a disaster occurs:

- [ ] Backup script running daily
- [ ] Off-site backup configured and tested
- [ ] `docker-compose.yml` committed to git
- [ ] `.env` file stored in password manager (1Password / Bitwarden)
- [ ] SSH key to VPS stored securely
- [ ] VPS provider credentials documented
- [ ] Cloudflare API token documented
- [ ] Domain registrar credentials documented
- [ ] Restore test performed in last 90 days

## Scenario 1: Database Corruption or Data Loss

### Symptoms
- Application returns 500 errors
- `docker compose logs backend` shows database errors
- Queries return incorrect/empty results

### Recovery Steps

1. **Stop the application** to prevent further writes:
   ```bash
   docker compose stop backend frontend nginx
   ```

2. **Identify the latest valid backup:**
   ```bash
   ls -lt /home/deploy/backups/*.sql.gz | head -5
   ```

3. **Verify backup integrity:**
   ```bash
   gunzip -t /home/deploy/backups/triangleblack_YYYY-MM-DD_HHMMSS.sql.gz
   sha256sum -c /home/deploy/backups/triangleblack_YYYY-MM-DD_HHMMSS.sql.gz.sha256
   ```

4. **Restore the database:**
   ```bash
   # Drop and recreate the database
   docker exec tb-postgres dropdb -U tb_user --if-exists triangleblack_old
   docker exec tb-postgres createdb -U tb_user triangleblack_restore

   # Restore from backup
   gunzip -c /home/deploy/backups/triangleblack_YYYY-MM-DD_HHMMSS.sql.gz | \
     docker exec -i tb-postgres psql -U tb_user -d triangleblack_restore
   ```

5. **Verify restoration:**
   ```bash
   docker exec tb-postgres psql -U tb_user -d triangleblack_restore \
     -c "SELECT count(*) FROM information_schema.schemata;"
   ```

6. **Swap databases and restart:**
   ```bash
   docker exec tb-postgres psql -U tb_user -c \
     "ALTER DATABASE triangleblack RENAME TO triangleblack_corrupted;"
   docker exec tb-postgres psql -U tb_user -c \
     "ALTER DATABASE triangleblack_restore RENAME TO triangleblack;"
   docker compose up -d
   ```

7. **Validate application:**
   ```bash
   curl -s https://api.triangleblack.com/health
   curl -s https://app.triangleblack.com | head -20
   ```

### Point-in-Time Recovery (if WAL archiving enabled)

Not configured in V1. If data loss is between backups, data since last backup is unrecoverable. PITR is a V2 enhancement.

## Scenario 2: Total VPS Failure

### Symptoms
- Server unreachable
- VPS provider shows "stopped" or "offline" status
- Cloudflare shows 521 (web server down) or origin unreachable

### Recovery Steps

1. **Provision a new VPS** with the same or better spec:
   - Ubuntu 22.04 LTS
   - Same region (for latency)
   - Private network enabled (for future stages)

2. **Run the Ubuntu setup** (see [Ubuntu.md](./Ubuntu.md)):
   ```bash
   # Basic setup
   apt update && apt upgrade -y
   adduser deploy
   usermod -aG sudo deploy
   # SSH key, fail2ban, UFW, Docker
   ```

3. **Clone the repository:**
   ```bash
   git clone https://github.com/triangleblack/digital-ops-ecosystem.git /home/deploy/triangleblack
   cd /home/deploy/triangleblack
   ```

4. **Restore environment file** from password manager:
   ```bash
   nano /home/deploy/triangleblack/.env
   ```

5. **Restore the latest backup** from off-site storage:
   ```bash
   # If using rsync backup
   rsync -avz user@backup-server:/backups/triangleblack/ /home/deploy/backups/

   # If using rclone
   rclone sync remote:triangleblack-backups/ /home/deploy/backups/
   ```

6. **Start infrastructure services:**
   ```bash
   docker compose up -d postgres redis
   ```

7. **Wait for PostgreSQL to initialize**, then restore:
   ```bash
   gunzip -c /home/deploy/backups/latest.sql.gz | \
     docker exec -i tb-postgres psql -U tb_user -d triangleblack
   ```

8. **Start remaining services:**
   ```bash
   docker compose up -d
   ```

9. **Run initial SSL certificate:**
   ```bash
   docker compose run --rm certbot certonly --webroot \
     --webroot-path /var/www/certbot \
     -d triangleblack.com -d app.triangleblack.com -d api.triangleblack.com
   ```

10. **Update DNS** (if VPS IP changed):
    - Cloudflare dashboard → DNS
    - Update A records to new VPS IP

11. **Verify everything:**
    ```bash
    docker compose ps
    curl -s https://api.triangleblack.com/health
    ```

### Recovery Time Objective (RTO)

| Step | Time (estimated) |
|------|-----------------|
| Provision new VPS | 5-10 min |
| Ubuntu setup | 10-15 min |
| Clone repo + config | 2-5 min |
| Restore backup | 5-30 min (depends on DB size) |
| SSL cert | 1-2 min |
| DNS update | 5-10 min (propagation) |
| **Total** | **30-75 min** |

### Recovery Point Objective (RPO)

| Backup Schedule | Data Loss Window |
|----------------|-----------------|
| Daily backup | Up to 24 hours |
| Daily + off-site | Up to 24 hours |

## Scenario 3: Configuration Drift or Failed Update

### Symptoms
- Application broken after deployment
- Docker compose fails to start
- Nginx configuration errors

### Recovery Steps

1. **Revert to previous working version:**
   ```bash
   git log --oneline -5
   git checkout <previous-working-commit>

   # Rebuild and restart
   docker compose up -d --build
   ```

2. **Rollback Docker images:**
   ```bash
   # Tag previous image
   docker tag triangleblack/backend:1.0.0 triangleblack/backend:latest
   docker compose up -d
   ```

3. **Restore Nginx configuration from backup:**
   ```bash
   cp /home/deploy/nginx-backup/nginx.conf ./nginx/nginx.conf
   docker compose restart nginx
   ```

### Rollback Checklist

- [ ] Revert code to last known good commit
- [ ] Rebuild affected Docker images
- [ ] Restart services
- [ ] Verify health endpoint
- [ ] Run smoke tests (manual: login, create, view)
- [ ] Monitor logs for 10 minutes

## Scenario 4: Security Breach

### Symptoms
- Unauthorized access detected
- Suspicious database queries
- Unexpected user accounts
- Alert from Cloudflare WAF or fail2ban

### Immediate Actions

1. **Isolate the server:**
   ```bash
   # Block all incoming traffic except your IP
   sudo ufw default deny incoming
   sudo ufw allow from YOUR_IP to any port 22
   ```

2. **Stop application containers:**
   ```bash
   docker compose down
   ```

3. **Rotate all credentials:**
   - Database password
   - JWT secret
   - API keys (SendGrid, Stripe, etc.)
   - SSH keys
   - Cloudflare API token

4. **Audit and investigate:**
   ```bash
   # Check auth logs
   sudo cat /var/log/auth.log | grep -i "accepted\|failed"

   # Check Docker access logs
   docker compose logs --since "2 days ago" nginx | grep -i "401\|403\|error"

   # Check running processes
   ps aux | grep -i docker
   ```

5. **Recover from clean backup** (see Scenario 1 or 2):
   - Provision new VPS
   - Do NOT copy user data from compromised server
   - Restore from pre-breach backup

## Scenario 5: Accidental Deletion

### If Docker volumes are deleted

```bash
# Volumes are gone, but database might still be recoverable
# Check if any raw data remains
ls -la /var/lib/docker/volumes/

# Restore from backup
gunzip -c /home/deploy/backups/latest.sql.gz | \
  docker exec -i tb-postgres psql -U tb_user -d triangleblack
```

### If source code is deleted

```bash
git clone https://github.com/triangleblack/digital-ops-ecosystem.git
```

## Preventive Measures

| Measure | Frequency | Owner |
|---------|-----------|-------|
| Backup verification | Weekly (automated) | DevOps |
| Restore test | Quarterly | DevOps |
| Off-site backup | Daily (automated) | DevOps |
| Docker Compose config in git | On change | All devs |
| .env in password manager | On change | DevOps |
| Disaster recovery drill | Bi-annual | DevOps + Lead |
| Cloud backup of Docker volumes | Monthly | DevOps |

## Communication

In the event of a disaster:

1. **Status page** — Update on company status page / Slack
2. **Internal notification** — Notify team via Slack #ops channel
3. **Client communication** — If data loss or extended downtime > 1 hour, email affected clients
4. **Post-mortem** — Document root cause, resolution, and prevention within 48 hours

## Post-Recovery Checklist

- [ ] All services healthy
- [ ] All tenants visible and operational
- [ ] Recent data verified (spot-check 3 tenants)
- [ ] SSL certificates valid
- [ ] DNS resolving correctly
- [ ] Backups resumed
- [ ] Monitoring alerts reset
- [ ] Incident report written
- [ ] Playbook updated with lessons learned
