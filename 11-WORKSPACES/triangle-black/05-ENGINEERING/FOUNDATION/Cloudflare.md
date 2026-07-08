# Cloudflare Setup (Free Plan)

## Overview

Cloudflare Free tier provides DNS management, CDN caching, DDoS protection, WAF rules, and SSL/TLS management at zero cost. It sits in front of the Nginx reverse proxy.

```
User ──► Cloudflare ──► Nginx ──► Docker Containers
          (CDN,          (Reverse
           WAF,           Proxy,
           DDoS,          SSL
           SSL)           Term)
```

## 1. DNS Configuration

### Add Domain to Cloudflare

1. Sign up at cloudflare.com
2. Add `triangleblack.com`
3. Cloudflare scans existing DNS records
4. Update nameservers at domain registrar to Cloudflare's nameservers

### DNS Records

| Type | Name | Content | Proxy Status | TTL |
|------|------|---------|--------------|-----|
| A | `@` | `<VPS_IP_ADDRESS>` | Proxied (orange cloud) | Auto |
| A | `www` | `<VPS_IP_ADDRESS>` | Proxied (orange cloud) | Auto |
| A | `app` | `<VPS_IP_ADDRESS>` | Proxied (orange cloud) | Auto |
| A | `api` | `<VPS_IP_ADDRESS>` | Proxied (orange cloud) | Auto |

**Proxied (orange cloud)** enables Cloudflare's CDN, DDoS protection, and SSL termination. All traffic to these records flows through Cloudflare's network before reaching the VPS.

## 2. SSL/TLS Settings

### SSL/TLS Encryption Mode

| Setting | Value |
|---------|-------|
| SSL/TLS encryption mode | **Full (strict)** |
| Minimum TLS version | **1.2** |
| Opportunistic Encryption | On |
| TLS 1.3 | On |
| Automatic HTTPS Rewrites | On |
| Certificate Transparency | On |

**Full (strict)** requires a valid SSL certificate on the origin server (Let's Encrypt). Cloudflare encrypts traffic between the browser and Cloudflare, and between Cloudflare and the origin.

### Origin Server Certificate

Generate a Cloudflare Origin CA certificate for the Nginx-to-Cloudflare connection:

1. Cloudflare Dashboard → SSL/TLS → Origin Server → Create Certificate
2. Select hostnames: `triangleblack.com`, `*.triangleblack.com`
3. Validity: 5 years
4. Install on Nginx (replaces or supplements Let's Encrypt):
   - `origin-cert.pem` → `/etc/nginx/ssl/origin.pem`
   - `origin-key.pem` → `/etc/nginx/ssl/origin.key`

**Authenticated Origin Pulls** (recommended):

1. Cloudflare Dashboard → SSL/TLS → Origin Server → Turn on Authenticated Origin Pulls
2. In Nginx, add to server block:

```nginx
ssl_client_certificate /etc/nginx/ssl/cloudflare.crt;
ssl_verify_client on;
```

Download the Cloudflare CA certificate from: `https://developers.cloudflare.com/ssl/static/authenticated_origin_pull_ca.pem`

## 3. CDN Caching

### Cache Rules

| Setting | Value |
|---------|-------|
| Caching level | **Standard** |
| Browser Cache TTL | **4 hours** |
| Edge Cache TTL | **2 hours** (override with Page Rules) |
| Always Online | **Off** (avoid serving stale content) |

### Page Rules (3 Free)

| Priority | URL Pattern | Settings |
|----------|-------------|----------|
| 1 | `*triangleblack.com/assets/*` | Cache Level: Cache Everything, Edge Cache TTL: 7 days |
| 2 | `*triangleblack.com/_next/static/*` | Cache Level: Cache Everything, Edge Cache TTL: 30 days |
| 3 | `api.triangleblack.com/*` | Cache Level: Bypass (dynamic API) |

## 4. WAF (Web Application Firewall)

### Managed Rulesets (Free Plan)

| Rule Set | Action | Notes |
|----------|--------|-------|
| Cloudflare Managed | Enabled (High sensitivity) | Blocks common web attacks |
| OWASP Core Rules | Enabled (Paranoia Level 2) | CRS 3.x paranoia level |
| Cloudflare Leaked Credential Check | Disabled (V1) | Enable in V2 |

### Custom WAF Rules

| Rule Name | Expression | Action |
|-----------|------------|--------|
| Block known bots | `(cf.client.bot) and not (cf.bot_management.verified_bot)` | Block |
| Rate limit auth | `http.request.uri.path contains "/api/auth/"` | Rate limit: 20 req/min |
| Block admin areas (non-office) | `http.request.uri.path contains "/admin" and ip.geoip.country ne "EG"` | Block (review in V2) |
| Block common scanners | `http.user_agent contains "sqlmap" or http.user_agent contains "nmap"` | Block |

## 5. DDoS Protection

All defaults from Cloudflare Free tier:

| Protection | Status |
|------------|--------|
| Layer 3/4 DDoS | Always On |
| Layer 7 DDoS | Always On (adaptive) |
| Maximum number of simultaneous requests per IP | 200 |
| Under Attack mode | Manual enable (dashboard) |

No additional configuration required. Cloudflare's Free tier includes unlimited DDoS mitigation up to 100 Mbps/500k requests per second.

## 6. Additional Security Settings

| Setting | Value | Location |
|---------|-------|----------|
| Bot Fight Mode | **On** | Security → Bots |
| Email Address Obfuscation | **On** | Speed → Optimization |
| HTTPS Rewrites | **On** | SSL/TLS → Edge Certificates |
| Always Use HTTPS | **On** | SSL/TLS → Edge Certificates |
| Brotli Compression | **On** | Speed → Optimization |
| Early Hints | **On** | Speed → Optimization |

## 7. Network Settings

| Setting | Value | Notes |
|---------|-------|-------|
| HTTP/2 | On | Faster page loads |
| HTTP/3 (QUIC) | On | Modern protocol |
| gRPC | Off | Not used in V1 |
| WebSockets | On | Required for V2 real-time features |
| IP Geolocation | On | Used for analytics and geo-routing |
| Pseudo IPv4 | Off | Add if origin has IPv4-only restrictions |

## 8. Real User Metrics (Free)

Enable **Web Analytics** (privacy-focused alternative to Google Analytics):

1. Dashboard → Analytics & Logs → Web Analytics
2. Add site: `triangleblack.com`
3. Add script tag to Next.js layout (analytics.js.erb snippet)

## 9. Verification

```bash
# Verify Cloudflare is proxying traffic
curl -sI https://triangleblack.com | grep -i "cf-ray"

# Check SSL
curl -sI https://triangleblack.com | grep -i "cf-ssl"

# Verify WAF
curl -s -o /dev/null -w "%{http_code}" \
  -H "User-Agent: sqlmap/1.0" \
  https://triangleblack.com
# Expected: 403 (blocked by WAF)
```

## 10. Limitations (Free Plan)

| Feature | Free | Pro ($20/mo) | Note |
|---------|------|--------------|------|
| Page Rules | 3 | 20 | Enough for V1 |
| WAF Rules | 5 custom | 20 | Use managed rulesets |
| Rate Limiting | Basic (10 rules) | Advanced | Sufficient for V1 |
| Analytics | Web (basic) | Full | Upgrade when data-driven |
| Argo Smart Routing | No | Yes | Not needed for single-VPS |
| Load Balancing | No | Yes | Needed only in Stage 3+ |
| Workers | 100k req/day | Unlimited | May be useful in V2 |
