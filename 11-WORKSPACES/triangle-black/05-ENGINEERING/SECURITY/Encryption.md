# Encryption Strategy

## Overview

Encryption is applied at three layers: in transit (TLS 1.3 between all services), at rest (encrypted volumes), and application-level (sensitive field encryption). V1 focuses on transit and rest encryption. Application-level encryption for PII is added in V2.

## Encryption Layers

```
┌─────────────────────────────────────────────┐
│           Application Layer                   │
│  Field-level encryption (V2)                │
│  ── encrypt(PII fields) before storage      │
├─────────────────────────────────────────────┤
│           Database Layer                      │
│  Encrypted volumes (LUKS / DM-Crypt)        │
│  PostgreSQL TDE (future)                    │
├─────────────────────────────────────────────┤
│           Storage Layer                       │
│  Encrypted disk (cloud provider default)    │
├─────────────────────────────────────────────┤
│           Transport Layer                     │
│  TLS 1.2/1.3 for all network communication  │
│  HTTPS between browser and Cloudflare       │
│  HTTPS between Cloudflare and Nginx         │
│  Internal TLS for DB connections (V2)       │
└─────────────────────────────────────────────┘
```

## In Transit (TLS)

### External Communication

| Path | Protocol | Certificate | Encryption |
|------|----------|-------------|------------|
| Browser ↔ Cloudflare | TLS 1.3 | Cloudflare Edge Cert | AES-256-GCM |
| Cloudflare ↔ Nginx | TLS 1.2/1.3 | Let's Encrypt / Origin CA | AES-256-GCM |
| Nginx ↔ Frontend | HTTP (internal) | None | Plaintext (Docker network) |
| Nginx ↔ Backend | HTTP (internal) | None | Plaintext (Docker network) |

### Internal Communication

All internal Docker network traffic is considered trusted within the VPS. If multi-host deployment occurs (Stage 1+), internal TLS is required:

```yaml
# Stage 1+ internal TLS
services:
  postgres:
    command:
      - -c ssl=on
      - -c ssl_cert_file=/etc/ssl/certs/postgres.crt
      - -c ssl_key_file=/etc/ssl/private/postgres.key
    volumes:
      - ./certs/postgres.crt:/etc/ssl/certs/postgres.crt:ro
      - ./certs/postgres.key:/etc/ssl/private/postgres.key:ro
```

### TLS Configuration

See [SSL.md](../14-Infrastructure/SSL.md) and [Nginx.md](../14-Infrastructure/Nginx.md) for full TLS configuration.

Key settings:
- **TLS version:** 1.2 minimum, 1.3 preferred
- **Ciphers:** ECDHE + AES-GCM + ChaCha20 only
- **Perfect forward secrecy:** Enabled (ECDHE key exchange)
- **HSTS:** Enabled (`max-age=63072000` = 2 years)
- **OCSP Stapling:** Enabled
- **Certificate:** Let's Encrypt (auto-renewed)

## At Rest (Storage)

### VPS Disk Encryption

```bash
# Check if disk is encrypted (cloud providers may have default encryption)
sudo dmsetup status
sudo cryptsetup status /dev/mapper/root

# If not encrypted, enable LUKS on data volumes
# Note: Cannot encrypt root volume after installation without reinstall

# For Docker data volumes, create encrypted partition
sudo cryptsetup luksFormat /dev/sdb
sudo cryptsetup open /dev/sdb docker_data
sudo mkfs.ext4 /dev/mapper/docker_data
sudo mount /dev/mapper/docker_data /var/lib/docker
```

### Cloud Provider Encryption

| Provider | Default Encryption | Additional |
|----------|--------------------|------------|
| Vultr | AES-256 at rest | Included by default |
| DigitalOcean | AES-256 at rest | Included by default |
| Linode | AES-256 at rest | Included by default |
| Hetzner | AES-256 at rest | Included by default |

All major VPS providers encrypt storage at rest by default. Verify in provider dashboard.

### Database Encryption

PostgreSQL data is encrypted at rest via the disk encryption layer. Additional database-level protections:

```sql
-- V2: pgcrypto extension for field-level encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: encrypted PII fields
CREATE TABLE tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    -- Encrypted fields (V2)
    pii_data BYTEA,
    encryption_key_id UUID REFERENCES encryption_keys(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Encrypt sensitive data
INSERT INTO tenant_settings (tenant_id, pii_data, encryption_key_id)
VALUES (
    $1,
    pgp_sym_encrypt($2, current_setting('app.encryption_key')),
    $3
);

-- Decrypt
SELECT pgp_sym_decrypt(pii_data, current_setting('app.encryption_key'))
FROM tenant_settings
WHERE tenant_id = $1;
```

### Backup Encryption

All database backups are encrypted:

```bash
#!/bin/bash
# Encrypt backup with GPG
ENCRYPTION_KEY="/home/deploy/.backup-key.gpg"

pg_dump -U tb_user triangleblack | gzip | \
  gpg --encrypt --recipient admin@triangleblack.com \
  > /home/deploy/backups/db_$(date +%Y%m%d).sql.gz.gpg
```

Decryption:

```bash
gpg --decrypt backup.sql.gz.gpg | gunzip | psql -U tb_user triangleblack
```

## Application-Level Encryption (V2+)

### Sensitive Fields

| Field | Sensitivity | Encryption | V1 | V2 |
|-------|-------------|------------|----|----|
| Password hash | Critical | bcrypt (12 rounds) | Yes | Yes |
| MFA secret | Critical | AES-256-GCM | - | Yes |
| Email address | High | AES-256-GCM | Plaintext | Encrypted |
| Phone number | High | AES-256-GCM | Plaintext | Encrypted |
| Tax ID / VAT | High | AES-256-GCM | Plaintext | Encrypted |
| Bank account | Critical | AES-256-GCM with HSM | - | Encrypted |
| Credit card | Critical | Not stored (use Stripe) | - | - |
| Contract content | High | AES-256-GCM | Plaintext | Encrypted |

### Encryption Service

```typescript
// src/common/services/encryption.service.ts
@Injectable()
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor() {
    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Format: iv:authTag:ciphertext (all hex)
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(encryptedString: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedString.split(':');

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

## Key Management

### Current (V1)

| Key | Type | Storage | Rotation |
|-----|------|---------|----------|
| ENCRYPTION_KEY | 256-bit symmetric | `.env` file + password manager | Every 6 months |

### Future (V2+)

```
┌──────────────┐     ┌──────────────────┐
│  Application  │────►│  Key Management   │
│               │     │  Service (KMS)    │
│               │     │                   │
│               │     │  ├─ Master keys   │
│               │     │  ├─ Data keys     │
│               │     │  └─ Key rotation  │
│               │     └──────────────────┘
```

Integration with AWS KMS or Hashicorp Vault for:
- Automatic key rotation
- Access audit trails
- Key versioning
- Hardware Security Module (HSM) support

## Encryption Standards

| Standard | Usage | Configuration |
|----------|-------|---------------|
| TLS 1.3 | HTTPS transport | Nginx + Cloudflare |
| TLS 1.2 | Fallback transport | Nginx |
| AES-256-GCM | Symmetric encryption | Application-level (V2) |
| RSA-2048 / ECDSA P-384 | Certificate key pairs | Let's Encrypt |
| bcrypt (12 rounds) | Password hashing | Auth module |
| SHA-256 | Integrity checks | HMAC, checksums |
| PGP/GPG | Backup encryption | Off-site backups |

## Compliance Considerations

| Requirement | V1 Status | V2 Enhancement |
|-------------|-----------|----------------|
| Encryption in transit | ✅ TLS 1.2/1.3 | Internal TLS for inter-service |
| Encryption at rest | ✅ Provider disk encryption | LUKS on Docker volumes |
| Field-level encryption (PII) | ❌ | AES-256-GCM per field |
| Key rotation | ✅ Manual | Automated via KMS |
| Backup encryption | ✅ GPG | Automated key management |
| HSM support | ❌ | Future compliance requirement |
