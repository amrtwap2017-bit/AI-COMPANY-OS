# Shared Modules

## AuthModule

```
auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── jwt-refresh.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   ├── roles.guard.ts
│   └── tenant.guard.ts
├── decorators/
│   ├── current-user.decorator.ts
│   ├── roles.decorator.ts
│   └── public.decorator.ts
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   └── forgot-password.dto.ts
└── auth.utils.ts
```

JWT payload structure:
```typescript
interface JwtPayload {
  sub: string;       // user id
  email: string;
  role: UserRole;
  tenantId: string;
  iat: number;
  exp: number;
}
```

## PrismaModule

```
prisma/
├── prisma.module.ts      — GlobalModule export
├── prisma.service.ts      — Connection management, schema switching
├── prisma.constants.ts
└── filters/
    └── prisma-exception.filter.ts
```

Schema switching logic:
```typescript
async onModuleInit() {
  await this.$connect();
}

switchSchema(tenantId: string) {
  const hash = md5(tenantId).substring(0, 8);
  this.$executeRawUnsafe(`SET search_path TO tenant_${hash}`);
}
```

## DocumentsModule

```
documents/
├── documents.module.ts
├── documents.controller.ts
├── documents.service.ts
├── storage/
│   └── local-storage.service.ts   — Local disk storage
└── dto/
    └── upload-document.dto.ts
```

Storage rules:
- Local disk at `/data/uploads/{tenant_hash}/{entity}/{id}/`
- File naming: `{uuid}_{original_filename}`
- 50MB max per file
- Authorized types: PDF, DOCX, XLSX, DWG, JPG, PNG

## NotificationsModule

```
notifications/
├── notifications.module.ts
├── notifications.controller.ts
├── notifications.service.ts
├── templates/
│   ├── lead-assigned.ts
│   ├── quotation-status.ts
│   ├── milestone-complete.ts
│   ├── service-request.ts
│   └── contract-expiring.ts
└── notifications.gateway.ts       — (stub for future WebSocket)
```

Notification types:
```
lead_assigned
opportunity_stage_changed
quotation_submitted
quotation_approved
quotation_rejected
quotation_expiring
contract_signed
contract_activating
contract_expiring
milestone_completed
milestone_approved
survey_scheduled
service_request_submitted
service_request_updated
project_status_changed
```

## MailModule

```
mail/
├── mail.module.ts
├── mail.service.ts
├── mailer.config.ts
└── templates/
    ├── quotation-pdf.hbs
    └── contract-signed.hbs
```

## CommonModule

```
common/
├── common.module.ts
├── decorators/
│   ├── current-user.decorator.ts
│   ├── roles.decorator.ts
│   ├── permissions.decorator.ts
│   └── public.decorator.ts
├── filters/
│   ├── http-exception.filter.ts
│   └── prisma-exception.filter.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   ├── roles.guard.ts
│   └── tenant.guard.ts
├── interceptors/
│   ├── audit.interceptor.ts
│   ├── logging.interceptor.ts
│   └── transform.interceptor.ts
├── pipes/
│   └── validation.pipe.ts
└── utils/
    ├── generate-number.ts
    ├── currency.ts
    └── date-utils.ts
```
