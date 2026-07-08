# Secrets Management Strategy

## Purpose

Define how secrets are identified, stored, accessed, rotated, and audited across all environments. Proper secrets management is critical to preventing unauthorized access, data breaches, and compliance violations.

## What Constitutes a Secret

Any value that grants access to a system, service, or data must be treated as a secret. This includes but is not limited to:

| Category | Examples |
|----------|----------|
| API Keys | Third-party service keys (Stripe, SendGrid, AWS, OpenAI) |
| Database Credentials | Usernames, passwords, connection strings |
| Authentication Secrets | JWT signing secrets, OAuth client secrets, session keys |
| Encryption Keys | TLS/SSL private keys, data encryption keys, signing keys |
| Service Account Keys | Cloud provider service accounts, Kubernetes service accounts |
| Tokens | Personal access tokens, deployment tokens, bot tokens |
| Certificates | Private certificates, CA keys |
| Infrastructure Secrets | SSH keys, VPN credentials, database master keys |
| CI/CD Secrets | Pipeline tokens, registry credentials, artifact signing keys |

## What is NOT a Secret

- Public API keys that are designed to be exposed (e.g., Google Maps JavaScript API key with domain restriction)
- Environment names, region names, service endpoint URLs (without credentials)
- Feature flag names and values

## Storage: Secrets Manager

### Production and Staging Secrets

All secrets for production and staging environments must be stored in a dedicated **secrets manager**:

- **HashiCorp Vault** — for on-premises deployments
- **AWS Secrets Manager** — for AWS-native deployments
- **Azure Key Vault** — for Azure-native deployments
- **GCP Secret Manager** — for GCP-native deployments

### Development and CI/CD Secrets

- **Local development**: `.env.local` files (gitignored) or local Vault agent. Developers pull secrets from the secrets manager at application startup.
- **CI/CD pipelines**: Environment variables injected from the CI/CD platform's secret store (GitHub Actions secrets, GitLab CI variables, Jenkins credentials).
- **Container orchestration**: Kubernetes Secrets (encrypted at rest) or external-secrets operator syncing from Vault.

### Storage Rules

| Rule | Enforcement |
|------|-------------|
| Never commit secrets to repositories | Pre-commit hooks + CI secret scanning (e.g., GitLeaks, TruffleHog) |
| Never hardcode secrets in source code | Code review + automated scanning |
| Never log secrets | Log scrubbing middleware + periodic log audit |
| Never share secrets via chat, email, or document | Policy + training |
| Use separate secrets per environment | Secrets manager paths: `/dev/`, `/staging/`, `/prod/` |
| Use separate secrets per service | Each service has its own credentials |

## Secret Rotation Policy

| Secret Type | Rotation Frequency | Method |
|-------------|-------------------|--------|
| Database credentials | Every 90 days | Automated rotation via secrets manager |
| API keys (third-party) | Every 180 days | Manual rotation, automated propagation |
| JWT signing secrets | Every 30 days | Automated rotation, time-based dual keys |
| Encryption keys | Every 365 days | Automated re-encryption |
| TLS certificates | Every 90 days | Automated via cert-manager / ACME |
| Service account keys | Every 90 days | Automated via cloud provider |
| CI/CD tokens | Every 30 days | Automated rotation |
| Personal access tokens | Every 90 days | User responsibility + automated reminder |

### Rotation Process

1. Generate new secret in secrets manager (dual-key support during transition).
2. Update consuming services to use the new secret.
3. Verify all services are functioning with the new secret.
4. Deprecate the old secret after a cool-down period (typically 24-72 hours).
5. Delete the old secret.
6. Audit log the rotation event.

## Access Control

### Principle of Least Privilege

Every service and human user gets the minimum set of secrets required to perform their function.

### Access Models

| Role | Access Level |
|------|-------------|
| Application / Service | Read access to its own secrets only. Identity-based via IAM or Vault role |
| CI/CD Pipeline | Read access to environment-specific secrets for deployment |
| Developer | Read access to development and integration secrets only |
| Engineering Lead | Read access to staging secrets. On-call: read access to production secrets |
| SRE / On-Call Engineer | Read access to production secrets (logged). Break-glass mechanism for write |
| Security Team | Full audit access, no read access to secret values |

### Authentication to Secrets Manager

- **Applications**: Machine identity (AWS IAM role, Kubernetes service account, Vault role ID + secret ID).
- **Humans**: Multi-factor authentication + short-lived session tokens.
- **CI/CD**: Platform-specific identity (GitHub OIDC, GitLab JWT).

## Audit Logging

All secret access is logged and monitored:

| Event | Logged Data | Retention |
|-------|------------|-----------|
| Secret read | Who/what, which secret, timestamp, source IP | 12 months |
| Secret write/update | Who/what, which secret, timestamp | 12 months |
| Secret delete | Who/what, which secret, timestamp | 36 months |
| Access denied | Who/what, which secret, timestamp, reason | 6 months |
| Rotation event | Automated process, timestamps of old/new | 24 months |
| Break-glass access | Who, reason, approval, timestamp | 36 months |

## Incident Response

If a secret is suspected to be compromised:

1. **Immediate**: Revoke the compromised secret.
2. **Containment**: Rotate all secrets that share the same credential scope.
3. **Investigation**: Audit logs to determine scope of exposure.
4. **Remediation**: Fix the leak vector (update .gitignore, add pre-commit hook, update permissions).
5. **Communication**: Notify affected teams and stakeholders.
6. **Post-mortem**: Root cause analysis and preventive measures.

## Secret Scanning

All repositories are scanned for secrets:

- **Pre-commit**: GitLeaks or TruffleHog on every commit.
- **CI/CD**: GitLeaks or TruffleHog scan on every push and PR.
- **Scheduled**: Full repository scan weekly (detect historical leaks).
- **Monitoring**: Alert on any secret detection. Automated revocation of exposed keys.
