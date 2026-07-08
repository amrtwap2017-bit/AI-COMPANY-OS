# Module Dependencies

## Dependency Graph

```
01-COMMERCIAL
  ├── depends on: 00-SHARED-KERNEL
  └── used by: 02, 06, 09, 10

02-PROJECT-DELIVERY
  ├── depends on: 00, 01 (Contracts)
  └── used by: 03, 05, 06, 07, 09

03-PROCUREMENT
  ├── depends on: 00, 02 (Projects)
  └── used by: 04, 05, 06, 09

04-SUPPLIER-MANAGEMENT
  ├── depends on: 00, 03
  └── used by: 03, 05, 06

05-INVENTORY
  ├── depends on: 00, 02, 03
  └── used by: 02, 03, 06

06-FINANCIAL-CONTROL
  ├── depends on: 00, 01, 02, 03, 05
  └── used by: 09

07-MAINTENANCE
  ├── depends on: 00, 02
  └── used by: 09

08-DOCUMENT-MANAGEMENT
  ├── depends on: 00
  └── used by: ALL

09-EXECUTIVE-INTELLIGENCE
  ├── depends on: 00, 01, 02, 03, 04, 05, 06, 07
  └── used by: NONE (terminal)

10-AI-COPILOTS
  ├── depends on: ALL (reads from all domains)
  └── used by: ALL (writes recommendations)

11-INTEGRATIONS
  ├── depends on: ALL (adapter layer)
  └── used by: NONE (external)

12-MOBILE
  ├── depends on: ALL (API consumption)
  └── used by: NONE (client)
```

## Build Order

```
Phase 6.1: 00-SHARED-KERNEL + 01-COMMERCIAL (revenue engine)
Phase 6.2: 02-PROJECT-DELIVERY (revenue delivery)
Phase 6.3: 03-PROCUREMENT + 04-SUPPLIER-MANAGEMENT (spend management)
Phase 6.4: 05-INVENTORY + 06-FINANCIAL-CONTROL (cost control)
Phase 6.5: 07-MAINTENANCE (client retention)
Phase 6.6: 08-DOCUMENT-MANAGEMENT (cross-cutting)
Phase 6.7: 09-EXECUTIVE-INTELLIGENCE (visibility)
Phase 6.8: 10-AI-COPILOTS (amplification)
Phase 6.9: 11-INTEGRATIONS + 12-MOBILE (extension)
```

## Shared Kernel Contracts

Every domain uses these from 00-SHARED-KERNEL:

| Contract | Used By |
|----------|---------|
| Enum: StatusCode | ALL |
| Entity: Address | 01, 02, 04 |
| Entity: Money | 01, 03, 05, 06 |
| Entity: Period | 01, 02, 06, 07 |
| Event: EntityCreated | ALL |
| Event: StatusChanged | ALL |
| Policy: ApprovalRequired | 01, 02, 03, 06 |
| Policy: NotificationRequired | ALL |
| Value Object: Currency | 01, 03, 06 |
| Value Object: UnitOfMeasure | 03, 05 |
