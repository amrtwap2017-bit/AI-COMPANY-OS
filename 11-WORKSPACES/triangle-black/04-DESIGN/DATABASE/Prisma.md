# DATA-001 — Prisma Schema

## `packages/database/package.json`

```json
{
  "name": "@tb/database",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:deploy": "prisma migrate deploy",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0"
  },
  "devDependencies": {
    "prisma": "^6.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.5.0"
  },
  "prisma": {
    "schema": "prisma/schema.prisma"
  }
}
```

## `packages/database/prisma/schema.prisma`

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// ENUMS
// ============================================================================

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

enum OppStage {
  qualification
  needs_analysis
  proposal
  negotiation
  closed_won
  closed_lost
}

enum CompanyStatus {
  active
  inactive
  prospect
}

enum ActivityType {
  call
  email
  meeting
  note
  task
}

enum QuotationStatus {
  draft
  sent
  under_review
  approved
  rejected
  expired
}

enum RfqStatus {
  draft
  submitted
  under_review
  approved
  rejected
}

enum ContractStatus {
  draft
  sent
  signed
  active
  completed
  terminated
}

enum ProjectStatus {
  planning
  in_progress
  on_hold
  completed
  cancelled
}

enum MilestoneStatus {
  not_started
  in_progress
  completed
  approved
}

enum SurveyStatus {
  scheduled
  in_progress
  completed
}

enum AssessmentStatus {
  draft
  completed
  approved
}

enum RequestType {
  maintenance
  procurement
  inquiry
  emergency
}

enum RequestPriority {
  low
  medium
  high
  critical
}

enum RequestStatus {
  submitted
  acknowledged
  in_progress
  resolved
  closed
}

enum AuditAction {
  create
  update
  delete
}

// ============================================================================
// PLATFORM SCHEMA (public)
// ============================================================================

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
  auditLogs AuditLog[]

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
  refreshTokens RefreshToken[]
  notifications Notification[]

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

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("refresh_tokens")
}

model AuditLog {
  id        BigInt      @id @default(autoincrement())
  tenantId  String?     @map("tenant_id") @db.Uuid
  tableName String      @map("table_name") @db.VarChar(100)
  recordId  String      @map("record_id") @db.Uuid
  action    AuditAction
  oldValues Json?       @map("old_values")
  newValues Json?       @map("new_values")
  changedBy String      @map("changed_by") @db.Uuid
  changedAt DateTime    @default(now()) @map("changed_at") @db.Timestamptz
  ipAddress String?     @map("ip_address") @db.Inet
  userAgent String?     @map("user_agent") @db.VarChar(500)

  tenant Tenant? @relation(fields: [tenantId], references: [id])

  @@index([tableName, recordId])
  @@index([changedAt])
  @@index([changedBy])
  @@map("audit_logs")
}

// ============================================================================
// CRM MODULE
// ============================================================================

model Lead {
  id          String     @id @default(uuid()) @db.Uuid
  tenantId    String     @map("tenant_id") @db.Uuid
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

  @@index([tenantId])
  @@index([status])
  @@index([assignedTo])
  @@map("leads")
}

model Opportunity {
  id          String   @id @default(uuid()) @db.Uuid
  tenantId    String   @map("tenant_id") @db.Uuid
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

  @@index([tenantId])
  @@index([stage])
  @@index([assignedTo])
  @@map("opportunities")
}

model Company {
  id        String        @id @default(uuid()) @db.Uuid
  tenantId  String        @map("tenant_id") @db.Uuid
  name      String        @db.VarChar(255)
  industry  String?       @db.VarChar(100)
  size      String?       @db.VarChar(50)
  website   String?       @db.VarChar(255)
  phone     String?       @db.VarChar(50)
  address   Json?         @db.JsonB
  notes     String?       @db.Text
  status    CompanyStatus @default(active)
  createdAt DateTime      @default(now()) @map("created_at")
  updatedAt DateTime      @updatedAt @map("updated_at")
  createdBy String        @map("created_by") @db.Uuid
  updatedBy String        @map("updated_by") @db.Uuid
  deletedAt DateTime?     @map("deleted_at") @db.Timestamptz

  @@index([tenantId])
  @@map("companies")
}

model Contact {
  id         String   @id @default(uuid()) @db.Uuid
  tenantId   String   @map("tenant_id") @db.Uuid
  companyId  String   @map("company_id") @db.Uuid
  firstName  String   @map("first_name") @db.VarChar(100)
  lastName   String   @map("last_name") @db.VarChar(100)
  email      String?  @db.VarChar(255)
  phone      String?  @db.VarChar(50)
  jobTitle   String?  @map("job_title") @db.VarChar(100)
  department String?  @db.VarChar(100)
  isPrimary  Boolean  @default(false) @map("is_primary")
  notes      String?  @db.Text
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  createdBy  String   @map("created_by") @db.Uuid
  updatedBy  String   @map("updated_by") @db.Uuid
  deletedAt  DateTime? @map("deleted_at") @db.Timestamptz

  @@index([tenantId])
  @@index([companyId])
  @@map("contacts")
}

// ============================================================================
// QUOTATIONS MODULE
// ============================================================================

model Quotation {
  id          String          @id @default(uuid()) @db.Uuid
  tenantId    String          @map("tenant_id") @db.Uuid
  number      String          @unique @db.VarChar(50)
  opportunityId String?       @map("opportunity_id") @db.Uuid
  companyId   String          @map("company_id") @db.Uuid
  status      QuotationStatus @default(draft)
  version     Int             @default(1)
  subtotal    Decimal         @db.Decimal(12, 2)
  taxRate     Decimal         @default(14) @db.Decimal(5, 2)
  taxTotal    Decimal         @db.Decimal(12, 2)
  total       Decimal         @db.Decimal(12, 2)
  margin      Decimal?        @db.Decimal(5, 2)
  currency    String          @default("EGP") @db.VarChar(3)
  validUntil  DateTime        @map("valid_until") @db.Date
  notes       String?         @db.Text
  terms       String?         @db.Text
  approvedBy  String?         @map("approved_by") @db.Uuid
  approvedAt  DateTime?       @map("approved_at") @db.Timestamptz
  sentAt      DateTime?       @map("sent_at") @db.Timestamptz
  clientApprovedAt DateTime?  @map("client_approved_at") @db.Timestamptz
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")
  createdBy   String          @map("created_by") @db.Uuid
  updatedBy   String          @map("updated_by") @db.Uuid
  deletedAt   DateTime?       @map("deleted_at") @db.Timestamptz

  lineItems QuotationLineItem[]

  @@index([tenantId])
  @@index([status])
  @@index([companyId])
  @@map("quotations")
}

model QuotationLineItem {
  id              String   @id @default(uuid()) @db.Uuid
  quotationId     String   @map("quotation_id") @db.Uuid
  description     String   @db.VarChar(500)
  quantity        Decimal  @db.Decimal(10, 2)
  unit            String   @db.VarChar(50)
  unitPrice       Decimal  @db.Decimal(12, 2)
  discountPercent Decimal? @default(0) @db.Decimal(5, 2)
  total           Decimal  @db.Decimal(12, 2)
  sortOrder       Int      @default(0) @map("sort_order")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at") @db.Timestamptz

  quotation Quotation @relation(fields: [quotationId], references: [id])

  @@index([quotationId])
  @@map("quotation_line_items")
}

// ============================================================================
// PROJECTS MODULE
// ============================================================================

model Project {
  id                String        @id @default(uuid()) @db.Uuid
  tenantId          String        @map("tenant_id") @db.Uuid
  contractId        String        @map("contract_id") @db.Uuid
  companyId         String        @map("company_id") @db.Uuid
  name              String        @db.VarChar(255)
  code              String        @unique @db.VarChar(50)
  status            ProjectStatus @default(planning)
  value             Decimal?      @db.Decimal(12, 2)
  budget            Decimal?      @db.Decimal(12, 2)
  startDate         DateTime      @map("start_date") @db.Date
  endDate           DateTime?     @map("end_date") @db.Date
  completionPercent Int           @default(0) @map("completion_percent")
  managerId         String?       @map("manager_id") @db.Uuid
  notes             String?       @db.Text
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")
  createdBy         String        @map("created_by") @db.Uuid
  updatedBy         String        @map("updated_by") @db.Uuid
  deletedAt         DateTime?     @map("deleted_at") @db.Timestamptz

  milestones Milestone[]
  files      ProjectFile[]
  surveys    Survey[]

  @@index([tenantId])
  @@index([status])
  @@index([managerId])
  @@index([companyId])
  @@map("projects")
}

model Milestone {
  id          String          @id @default(uuid()) @db.Uuid
  projectId   String          @map("project_id") @db.Uuid
  name        String          @db.VarChar(255)
  description String?         @db.Text
  sequence    Int
  dueDate     DateTime        @map("due_date") @db.Date
  completedAt DateTime?       @map("completed_at") @db.Timestamptz
  approvedAt  DateTime?       @map("approved_at") @db.Timestamptz
  status      MilestoneStatus @default(not_started)
  assignedTo  String?         @map("assigned_to") @db.Uuid
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")
  deletedAt   DateTime?       @map("deleted_at") @db.Timestamptz

  project Project @relation(fields: [projectId], references: [id])

  @@index([projectId, sequence])
  @@index([status, dueDate])
  @@map("milestones")
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

model Notification {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  type      String   @db.VarChar(50)
  title     String   @db.VarChar(255)
  body      String   @db.Text
  link      String?  @db.VarChar(500)
  isRead    Boolean  @default(false) @map("is_read")
  readAt    DateTime? @map("read_at") @db.Timestamptz
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@index([userId, isRead])
  @@index([createdAt])
  @@map("notifications")
}

// ============================================================================
// SERVICE REQUESTS
// ============================================================================

model ServiceRequest {
  id           String         @id @default(uuid()) @db.Uuid
  tenantId     String         @map("tenant_id") @db.Uuid
  companyId    String         @map("company_id") @db.Uuid
  portalUserId String         @map("portal_user_id") @db.Uuid
  number       String         @unique @db.VarChar(50)
  type         RequestType
  priority     RequestPriority @default(medium)
  subject      String         @db.VarChar(255)
  description  String         @db.Text
  status       RequestStatus  @default(submitted)
  assignedTo   String?        @map("assigned_to") @db.Uuid
  resolvedAt   DateTime?      @map("resolved_at") @db.Timestamptz
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")
  deletedAt    DateTime?      @map("deleted_at") @db.Timestamptz

  @@index([tenantId])
  @@index([status, priority])
  @@index([assignedTo])
  @@map("service_requests")
}

// ============================================================================
// DOCUMENTS
// ============================================================================

model Document {
  id          String   @id @default(uuid()) @db.Uuid
  tenantId    String   @map("tenant_id") @db.Uuid
  companyId   String   @map("company_id") @db.Uuid
  name        String   @db.VarChar(255)
  storagePath String   @map("storage_path") @db.VarChar(500)
  fileType    String   @map("file_type") @db.VarChar(50)
  fileSize    Int      @map("file_size")
  category    String   @db.VarChar(50)
  projectId   String?  @map("project_id") @db.Uuid
  version     Int      @default(1)
  uploadedBy  String   @map("uploaded_by") @db.Uuid
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at") @db.Timestamptz

  @@index([tenantId])
  @@index([companyId])
  @@map("documents")
}
```
