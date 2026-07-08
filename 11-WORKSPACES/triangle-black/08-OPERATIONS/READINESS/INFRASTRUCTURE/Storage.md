# 06 — Storage

> Storage configuration validation.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-05 | DevOps-Foundation.md | Docker volumes |
| PHASE-04 | DevOps-Architecture.md | Storage strategy |
| PHASE-03 | Physical-Database.md | File storage design |

## Storage Configuration

| Data | Type | Location | Size | Backup | Status |
|------|------|----------|------|--------|--------|
| PostgreSQL data | Docker volume | pgdata | 10GB+ | Daily to DO Spaces | ❌ |
| File uploads | Local (V1) → DO Spaces (V2) | /data/uploads | 5GB+ | Daily | ❌ |
| Logs | Docker logs | stdout | 1GB | journald | ❌ |
| Backups | DO Spaces bucket | /backups | 50GB | — | ❌ |
| SSL certificates | Docker volume | certbot | 100MB | — | ❌ |

## DO Spaces (V2 — Planned)

| Feature | Configured | Status |
|---------|-----------|--------|
| Bucket created | — | ❌ |
| Access keys generated | — | ❌ |
| CORS configured | — | ❌ |
| CDN enabled | — | ❌ |
| Lifecycle policies (backup retention) | — | ❌ |

## Validation

- [ ] Docker volumes persist across container restarts
- [ ] File uploads work correctly (API → local storage)
- [ ] Storage cleanup process documented (old files)
- [ ] Storage monitoring (disk usage alerts)

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT CONFIGURED
