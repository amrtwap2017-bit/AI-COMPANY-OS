# 09 — Backend Standards

## Module Structure (NestJS)

```
modules/{domain}/
├── {domain}.module.ts
├── {domain}.controller.ts
├── {domain}.service.ts
├── dto/
│   ├── create-{entity}.dto.ts
│   ├── update-{entity}.dto.ts
│   └── query-{entity}.dto.ts
├── guards/
├── interceptors/
├── tests/
│   ├── {domain}.controller.spec.ts
│   └── {domain}.service.spec.ts
└── index.ts
```

## Layering Rules

```
Controller  ←  DTO validation, routing, HTTP concerns
    ↓
Service     ←  Business logic, rules, orchestration
    ↓
Prisma      ←  Data access only
```

- Controllers never contain business logic
- Services never handle HTTP concerns (headers, status codes)
- Cross-service calls go through module exports, never direct imports

## Transaction Rules

```typescript
// Prisma transactions for multi-table operations
@Injectable()
export class LeadService {
  async convertToOpportunity(leadId: string, dto: ConvertDto) {
    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.update({
        where: { id: leadId },
        data: { status: 'converted', convertedAt: new Date() },
      });
      const opportunity = await tx.opportunity.create({
        data: { leadId, ...dto, stage: 'qualification' },
      });
      return { lead, opportunity };
    });
  }
}
```

## Event Handling (In-Process)

```typescript
// @nestjs/event-emitter — synchronous in-process events
@Injectable()
export class QuotationApprovedListener {
  @OnEvent('quotation.approved')
  async handle(payload: QuotationApprovedEvent) {
    await this.notificationService.notifySalesRep(payload.quotationId);
    await this.auditService.write({ ... });
  }
}
```

## Background Jobs

```typescript
// @nestjs/schedule — cron + interval jobs
@Injectable()
export class QuotationExpiryJob {
  @Cron('0 8 * * *')  // Daily at 8 AM
  async checkExpiringQuotations() {
    const expiring = await this.prisma.quotation.findMany({
      where: {
        status: 'sent',
        validUntil: { lte: addDays(new Date(), 7) },
      },
    });
    for (const q of expiring) {
      this.eventEmitter.emit('quotation.expiring', q);
    }
  }
}
```

## Dependency Rules

| Module | Can Import From |
|--------|----------------|
| CRM | PrismaService, NotificationService, DocumentService |
| Quotations | PrismaService, NotificationService, DocumentService, CRM (opportunities) |
| Projects | PrismaService, NotificationService, DocumentService, Quotations (contracts) |
| Portal | PrismaService, NotificationService, DocumentService, Projects |
| Admin | PrismaService |
