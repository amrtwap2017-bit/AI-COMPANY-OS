# Prisma Schema Mapping

## Platform Schema (public)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum TenantStatus {
  active
  suspended
  archived
}

enum UserRole {
  super_admin
  admin
  manager
  sales_rep
  engineer
  viewer
  client_admin
  client_user
}

model Tenant {
  id        String       @id @default(uuid()) @db.Uuid
  name      String       @db.VarChar(255)
  slug      String       @unique @db.VarChar(100)
  domain    String?      @db.VarChar(255)
  status    TenantStatus @default(active)
  config    Json         @default("{}")
  currency  String       @default("EGP") @db.VarChar(3)
  timezone  String       @default("Africa/Cairo") @db.VarChar(50)
  createdAt DateTime     @default(now()) @map("created_at")
  updatedAt DateTime     @updatedAt @map("updated_at")
  createdBy String       @map("created_by") @db.Uuid
  updatedBy String       @map("updated_by") @db.Uuid
  deletedAt DateTime?    @map("deleted_at") @db.Timestamptz

  users User[]

  @@map("tenants")
}

model User {
  id           String   @id @default(uuid()) @db.Uuid
  tenantId     String   @map("tenant_id") @db.Uuid
  email        String   @unique @db.VarChar(255)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  firstName    String   @map("first_name") @db.VarChar(100)
  lastName     String   @map("last_name") @db.VarChar(100)
  role         UserRole
  isActive     Boolean  @default(true) @map("is_active")
  lastLoginAt  DateTime? @map("last_login_at") @db.Timestamptz
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  createdBy    String   @map("created_by") @db.Uuid
  updatedBy    String   @map("updated_by") @db.Uuid
  deletedAt    DateTime? @map("deleted_at") @db.Timestamptz

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@unique([email, tenantId])
  @@index([tenantId])
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  token     String   @unique
  expiresAt DateTime @map("expires_at") @db.Timestamptz
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@map("refresh_tokens")
}
```

## Tenant Schema (tenant_{hash})

> All models below are created per tenant schema. Prisma currently does not support multi-schema natively — use raw SQL for schema switching or pre-generate one PrismaClient per schema at build time.

```prisma
// === CRM Module ===

enum LeadSource {
  website
  referral
  event
  cold_outreach
  other
}

enum LeadStatus {
  new
  contacted
  qualified
  disqualified
  converted
}

model Lead {
  id          String     @id @default(uuid()) @db.Uuid
  firstName   String     @map("first_name") @db.VarChar(100)
  lastName    String     @map("last_name") @db.VarChar(100)
  email       String?    @db.VarChar(255)
  phone       String?    @db.VarChar(50)
  companyName String?    @map("company_name") @db.VarChar(255)
  jobTitle    String?    @map("job_title") @db.VarChar(100)
  source      LeadSource
  status      LeadStatus @default(new)
  score       Int?       @default(0)
  assignedTo  String?    @map("assigned_to") @db.Uuid
  notes       String?    @db.Text
  convertedAt DateTime?  @map("converted_at") @db.Timestamptz
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  createdBy   String     @map("created_by") @db.Uuid
  updatedBy   String     @map("updated_by") @db.Uuid
  deletedAt   DateTime?  @map("deleted_at") @db.Timestamptz

  opportunities Opportunity[]

  @@index([status])
  @@index([assignedTo])
  @@map("leads")
}

enum OppStage {
  qualification
  needs_analysis
  proposal
  negotiation
  closed_won
  closed_lost
}

model Opportunity {
  id          String   @id @default(uuid()) @db.Uuid
  leadId      String?  @map("lead_id") @db.Uuid
  companyId   String   @map("company_id") @db.Uuid
  name        String   @db.VarChar(255)
  value       Decimal  @db.Decimal(12, 2)
  stage       OppStage
  probability Int
  closeDate   DateTime @map("close_date") @db.Date
  assignedTo  String?  @map("assigned_to") @db.Uuid
  lostReason  String?  @map("lost_reason") @db.Text
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  createdBy   String   @map("created_by") @db.Uuid
  updatedBy   String   @map("updated_by") @db.Uuid
  deletedAt   DateTime? @map("deleted_at") @db.Timestamptz

  lead      Lead?       @relation(fields: [leadId], references: [id])
  company   Company     @relation(fields: [companyId], references: [id])
  quotations Quotation[]

  @@index([stage])
  @@index([assignedTo])
  @@map("opportunities")
}
```

> Full Prisma schema in `prisma/schema.prisma` at implementation phase. The above covers all types, models, enums, and relations per the Table Specifications.
