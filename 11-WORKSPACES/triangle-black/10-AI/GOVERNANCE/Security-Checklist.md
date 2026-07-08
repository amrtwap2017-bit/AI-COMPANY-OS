# Security Review Checklist

This checklist is used during security reviews to verify that all security requirements are met before release. Items are categorized by security domain.

## Authentication

- [ ] All API endpoints and resources require authentication (unless explicitly public)
- [ ] Authentication mechanism follows industry standards (OAuth 2.0, OIDC, SAML, JWT)
- [ ] Passwords are stored using a strong hashing algorithm (bcrypt, Argon2, PBKDF2)
- [ ] Password policies enforce minimum length, complexity, and rotation
- [ ] Multi-factor authentication (MFA) is enforced for privileged operations
- [ ] Session management uses secure, HTTP-only, SameSite cookies
- [ ] Token expiration is enforced with appropriate timeouts
- [ ] Token refresh mechanism is secure (rotation, revocation)
- [ ] Brute-force protection is implemented (account lockout, rate limiting)
- [ ] Authentication failures are logged without exposing sensitive details

## Authorization

- [ ] Authorization checks are performed at every API endpoint (not just UI-level)
- [ ] Role-based access control (RBAC) or attribute-based access control (ABAC) is implemented
- [ ] Principle of least privilege is applied to all roles and permissions
- [ ] Server-side authorization is enforced; client-side checks are not relied upon
- [ ] Horizontal privilege escalation is prevented (users cannot access others' data)
- [ ] Vertical privilege escalation is prevented (users cannot escalate roles)
- [ ] API-level access controls match the defined authorization model
- [ ] Service-to-service authentication uses mutual TLS or API keys with scopes
- [ ] Authorization decisions are logged for audit purposes

## Input Validation & Sanitization

- [ ] All user input is validated against a whitelist (allow-list) approach
- [ ] Input length, format, and type constraints are enforced on the server
- [ ] SQL injection is prevented via parameterized queries or ORM
- [ ] NoSQL injection is prevented via query sanitization
- [ ] Cross-site scripting (XSS) is prevented via output encoding
- [ ] Command injection is prevented by avoiding shell execution with user input
- [ ] File uploads are validated for type, size, and content (magic byte verification)
- [ ] XML input is protected against XXE (XML External Entity) attacks
- [ ] Server-side request forgery (SSRF) protections are in place
- [ ] Deserialization of untrusted data uses safe methods

## Data Sanitization & Privacy

- [ ] Personally identifiable information (PII) is identified and handled per policy
- [ ] Data masking or anonymization is applied in non-production environments
- [ ] Data minimization principle is followed (only necessary data collected)
- [ ] User data deletion and export mechanisms comply with privacy regulations
- [ ] Sensitive data is not logged (passwords, tokens, PII, financial data)
- [ ] Data classification labels are applied where required

## Secrets Management

- [ ] No secrets, API keys, or credentials are hard-coded in source code
- [ ] Secrets are stored in a dedicated secrets management solution (vault, key store)
- [ ] Secrets are injected at runtime via environment variables or sidecars
- [ ] Service accounts use short-lived credentials where possible
- [ ] Certificate management includes renewal and revocation processes
- [ ] Secrets are rotated on a defined schedule or after compromise
- [ ] Commit history is scanned for accidentally committed secrets

## Dependency Vulnerabilities

- [ ] All third-party dependencies are scanned for known vulnerabilities (SCA)
- [ ] No critical or high severity vulnerabilities are unresolved
- [ ] Dependency versions are pinned or locked (lock files committed)
- [ ] Transitive dependencies are reviewed for supply chain risks
- [ ] Base container images are scanned and free of critical vulnerabilities
- [ ] Dependency update policy is defined and enforced

## Transport Security

- [ ] HTTPS is enforced for all communication (TLS 1.2 minimum, TLS 1.3 preferred)
- [ ] HSTS (HTTP Strict Transport Security) header is configured
- [ ] TLS certificates are valid and managed with auto-renewal
- [ ] Internal service communication also uses TLS where feasible
- [ ] Weak cipher suites and protocols are disabled
- [ ] Certificate pinning is considered for mobile clients

## CORS & HTTP Security

- [ ] CORS policy is restrictive (specific origins, not wildcard in production)
- [ ] CORS does not allow credentials with wildcard origins
- [ ] Content Security Policy (CSP) headers are configured
- [ ] X-Content-Type-Options: nosniff header is set
- [ ] X-Frame-Options header is set (DENY or SAMEORIGIN)
- [ ] Cache-Control headers prevent caching of sensitive responses

## Rate Limiting & Abuse Prevention

- [ ] Rate limiting is applied to all public API endpoints
- [ ] Rate limits are differentiated by endpoint sensitivity and user tier
- [ ] Distributed denial-of-service (DDoS) protections are in place
- [ ] Account enumeration is prevented (generic error messages for login failures)
- [ ] CAPTCHA or challenge mechanisms protect form submissions and login
- [ ] IP-based blocking is implemented for abusive traffic patterns

## Audit Logging

- [ ] All authentication and authorization events are logged
- [ ] All data mutations (create, update, delete) are logged with user identity
- [ ] Logs include timestamp, user ID, action, resource, and outcome
- [ ] Audit logs are immutable and tamper-evident
- [ ] Log aggregation and monitoring is configured with alerting
- [ ] Log retention policy meets compliance requirements
- [ ] Logs do not contain sensitive data (PII, secrets, tokens)
