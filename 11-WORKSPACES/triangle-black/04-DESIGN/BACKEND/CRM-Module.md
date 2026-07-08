# CRM Module

## Structure

```
crm/
├── crm.module.ts
├── leads/
│   ├── leads.controller.ts
│   ├── leads.service.ts
│   ├── dto/
│   │   ├── create-lead.dto.ts
│   │   ├── update-lead.dto.ts
│   │   └── query-lead.dto.ts
│   └── tests/
│       ├── leads.controller.spec.ts
│       └── leads.service.spec.ts
├── opportunities/
│   ├── opportunities.controller.ts
│   ├── opportunities.service.ts
│   ├── dto/
│   │   ├── create-opportunity.dto.ts
│   │   ├── update-opportunity.dto.ts
│   │   └── query-opportunity.dto.ts
│   └── tests/
├── companies/
│   ├── companies.controller.ts
│   ├── companies.service.ts
│   └── dto/
├── contacts/
│   ├── contacts.controller.ts
│   ├── contacts.service.ts
│   └── dto/
├── activities/
│   ├── activities.controller.ts
│   ├── activities.service.ts
│   └── dto/
└── pipeline/
    ├── pipeline.controller.ts
    └── pipeline.service.ts
```

## Service Layer

### LeadService

```typescript
@Injectable()
export class LeadService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(dto: CreateLeadDto, userId: string): Promise<Lead> {
    // Creates lead, auto-assigns if score > threshold
    // Sends notification to assigned user
  }

  async convertToOpportunity(leadId: string, dto: ConvertDto, userId: string): Promise<{ lead: Lead, opportunity: Opportunity }> {
    // Validates lead status
    // Creates opportunity
    // Updates lead status to 'converted'
    // Creates company if needed
    // Transactional
  }

  async findPipeline(tenantId: string): Promise<PipelineSummary> {
    // Aggregates leads and opportunities by stage
  }

  private async calculateScore(lead: Lead): Promise<number> {
    // Based on: email domain quality, phone presence, company size, source
  }
}
```

## Business Rules Enforced

| Rule | Location | Logic |
|------|----------|-------|
| BR-CRM-01 | LeadService.create | If source=website and score<20 → auto-assign to lowest-workload sales rep |
| BR-CRM-02 | OpportunityService.update | If stage='closed_lost' → lostReason required |
| BR-CRM-03 | OpportunityService.update | Stage transitions must follow order: qualification→analysis→proposal→negotiation→closed |
| BR-CRM-04 | PipelineService.getWinLoss | Won/lost ratio calculated monthly for forecast |
