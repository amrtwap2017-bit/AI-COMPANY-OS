# SSL/TLS with Let's Encrypt

## Overview

Let's Encrypt provides free, automated SSL certificates via Certbot. Certificates are issued for `triangleblack.com`, `app.triangleblack.com`, and `api.triangleblack.com`. Renewal is fully automated within the Docker Compose stack.

## Certbot Setup (Docker)

Certbot runs as a companion container that handles certificate issuance and renewal.

### Initial Issuance

```bash
# Run certbot manually for first issuance
docker compose run --rm certbot certonly --webroot \
  --webroot-path /var/www/certbot \
  --email admin@triangleblack.com \
  --agree-tos \
  --no-eff-email \
  -d triangleblack.com \
  -d www.triangleblack.com \
  -d app.triangleblack.com \
  -d api.triangleblack.com
```

Nginx must be running for the webroot challenge to succeed. The certbot container writes challenge files to `/var/www/certbot/.well-known/acme-challenge/` which is served by Nginx.

### Certificate Location

After issuance, certificates are stored in the `certbot_conf` Docker volume:

```
/etc/letsencrypt/live/triangleblack.com/
├── fullchain.pem    # Full certificate chain
├── privkey.pem      # Private key
└── chain.pem        # Intermediate chain
```

## Automated Renewal

The Certbot container in `docker-compose.yml` runs `certbot renew` every 12 hours:

```yaml
certbot:
  image: certbot/certbot:latest
  entrypoint: |
    sh -c 'trap exit TERM; while true; do
      certbot renew --quiet --no-self-upgrade
      sleep 12h &
      wait $${!}
    done'
  volumes:
    - certbot_www:/var/www/certbot
    - certbot_conf:/etc/letsencrypt
```

Nginx reloads automatically because the certificate paths are mounted as volumes — Nginx reads the live files, and Certbot updates symlinks on renewal.

## Manual Renewal Test

```bash
# Dry-run renewal
docker compose run --rm certbot renew --dry-run

# Force renewal
docker compose run --rm certbot renew --force-renewal
```

## Nginx SSL Configuration

See [Nginx.md](./Nginx.md#sslconf) for the full SSL configuration snippet.

Key settings:

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:...;
ssl_prefer_server_ciphers off;
ssl_ecdh_curve secp384r1;
ssl_stapling on;
ssl_stapling_verify on;
```

### SSL Stapling

OCSP stapling is enabled to improve TLS handshake performance:

```nginx
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/triangleblack.com/chain.pem;
resolver 1.1.1.1 8.8.8.8 valid=300s;
```

## Certificate Monitoring

### Check Expiry

```bash
# Via OpenSSL
docker run --rm -it --entrypoint openssl alpine:latest \
  s_client -connect triangleblack.com:443 -servername triangleblack.com 2>/dev/null \
  | openssl x509 -noout -dates

# Via certbot
docker compose run --rm certbot certificates
```

### Cron-Based Monitoring (Host Level)

Add to root crontab on VPS:

```bash
sudo crontab -e
```

```
0 6 * * * /usr/bin/docker compose -f /home/deploy/triangleblack/docker-compose.yml run --rm certbot certificates 2>&1 | /usr/bin/mail -s "TB SSL Cert Status" admin@triangleblack.com
```

## SSL Test

After setup, verify at: https://www.ssllabs.com/ssltest/

Target scores:

| Test | Target |
|------|--------|
| Overall Rating | A+ |
| Certificate | Valid, trusted |
| Protocol Support | TLS 1.2, TLS 1.3 |
| Key Exchange | ECDHE |
| Cipher Strength | 256-bit AES-GCM |
| HSTS | Present (max-age=63072000) |

## Troubleshooting

### Certificate Not Found

```bash
# Check if certificate exists
docker compose run --rm certbot certificates

# Re-issue
docker compose run --rm certbot certonly --webroot \
  --webroot-path /var/www/certbot \
  --force-renewal \
  -d triangleblack.com -d app.triangleblack.com -d api.triangleblack.com
```

### Nginx Won't Start

```bash
# Check config
docker exec tb-nginx nginx -t

# Missing certificates? Issue them first
docker compose up certbot
```

### Renewal Failing

```bash
# Check logs
docker compose logs certbot

# Manual renewal with debug
docker compose run --rm certbot renew --verbose
```

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Private key exposure | Keys stored in Docker volume, not committed to git |
| Certificate spoofing | Cloudflare Authenticated Origin Pulls (recommended) |
| Expired certificate | Automated renewal every 12 hours + monitoring |
| Weak cipher | Explicit cipher list, TLS 1.2+ only |
| MITM during issuance | DNS-based validation (future: DNS-01 challenge) |
