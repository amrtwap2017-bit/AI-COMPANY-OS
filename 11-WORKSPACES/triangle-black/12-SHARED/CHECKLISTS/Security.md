# Security Review Checklist

## Authentication
- [ ] Password policy enforced (minimum 12 characters, complexity)
- [ ] Multi-factor authentication (MFA) enabled for all users
- [ ] Session timeout configured (30 minutes idle)
- [ ] Account lockout after 5 failed attempts
- [ ] Login rate limiting configured
- [ ] Password reset flow secure (time-limited token)
- [ ] No default passwords in production
- [ ] OAuth/SSO configured with secure providers

## Authorization
- [ ] Role-based access control enforced
- [ ] Least privilege principle applied to all roles
- [ ] API endpoint authorization verified per role
- [ ] Data access restricted per tenant (multi-tenant isolation)
- [ ] Admin functions restricted to admin roles
- [ ] Elevation of privilege tested
- [ ] Insecure direct object reference (IDOR) tested

## Data Protection
- [ ] Data encrypted in transit (TLS 1.2+)
- [ ] Data encrypted at rest
- [ ] Secrets stored in secrets manager (not code)
- [ ] API keys and tokens stored securely
- [ ] Personally identifiable information (PII) identified and protected
- [ ] Data retention policy defined and enforced
- [ ] Backup encryption verified

## Network Security
- [ ] Firewall rules reviewed and minimized
- [ ] Only required ports exposed
- [ ] Database not publicly accessible
- [ ] SSH key-only access (no password)
- [ ] VPN required for administrative access
- [ ] DDoS protection configured
- [ ] Web application firewall (WAF) configured

## Application Security (OWASP Top 10)
- [ ] SQL injection tested
- [ ] Cross-site scripting (XSS) tested
- [ ] Cross-site request forgery (CSRF) protection enabled
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options, etc.)
- [ ] Input validation on all forms
- [ ] Output encoding on all user content
- [ ] File upload validation and sanitization
- [ ] API rate limiting and throttling

## Monitoring and Logging
- [ ] All authentication events logged
- [ ] All authorization failures logged
- [ ] All data changes logged (audit trail)
- [ ] Suspicious activity alerts configured
- [ ] Log retention policy defined
- [ ] Logs stored in tamper-proof location
- [ ] Incident response plan documented

## Third-Party and Supply Chain
- [ ] All dependencies reviewed for known vulnerabilities
- [ ] Third-party integrations security assessed
- [ ] Supplier security requirements documented
- [ ] API integration security tested

## Compliance
- [ ] Data privacy regulations identified and addressed
- [ ] Industry standard compliance (ISO 27001 framework)
- [ ] Client contractual security requirements met
- [ ] Penetration testing completed
- [ ] Vulnerabilities remediated before deployment
