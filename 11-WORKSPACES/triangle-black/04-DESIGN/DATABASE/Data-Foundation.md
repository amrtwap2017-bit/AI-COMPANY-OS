# Phase 05 — Data Foundation

> Prisma schema, database configuration, and migration strategy.

## Prisma Schema

The Prisma schema defines all platform models (shared kernel) and domain models.

| Model | Domain | Status |
|-------|--------|--------|
| Tenant | Platform | Built |
| User | Platform | Built |
| Role | Platform | Built |
| Permission | Platform | Built |
| AuditLog | Platform | Built |
| Notification | Platform | Built |
| Lead | Commercial | Specified |
| LeadScore | Commercial | Specified |
| Opportunity | Commercial | Specified |
| ... (14 more domain models) | Domain | Specified |

## Schema Design

```prisma
model Tenant {
  id        String   @id @default(uuid()) @db.Char(36)
  name      String
  slug      String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  users   User[]
  leads   Lead[]

  @@map("tenant")
}
```

## Migration Strategy

| Command | Purpose | Environment |
|---------|---------|-------------|
| `npx prisma migrate dev` | Development migration | Local |
| `npx prisma migrate deploy` | Production migration | CI/CD pipeline |
| `npx prisma db seed` | Seed data | All |

## Connection Management

- Max connections: 20 (VPS limit)
- Connection pool: Prisma `connectionLimit` option
- Timeout: 30 seconds query timeout
- SSL: Required in production

See `06-DATA-FOUNDATION/` for complete schema and migration files.
