# ENGINEERING-STANDARDS.md — Triangle Black

> Version: 1.0 | Authority: CTO Agent | References: 05-ENGINEERING/HANDBOOK[23D[K
05-ENGINEERING/HANDBOOK/

---

## 1. Architecture Standards

### 1.1 Domain-Driven Design (DDD)
**Bounded Contexts** (see 03-BUSINESS/DOMAIN/Bounded-Contexts.md):
- Each domain module has its own bounded context.
- Bounded contexts should be isolated and communicate through well-defined [K
interfaces.

**Aggregates**:
- Aggregates are the core elements of a domain model, representing complex [K
objects that consist of one or more entities and value objects.
- Aggregates have a root entity that represents the aggregate as a whole.

**Value Objects**:
- Value objects encapsulate data that has no identity but is an integral pa[2D[K
part of an aggregate.
- Value objects are used to represent attributes of entities and aggregates[10D[K
aggregates, such as addresses, phone numbers, etc.

**Domain Events**:
- Domain events are messages that are published when something significant [K
happens within the domain model.
- Domain events are used to communicate changes between bounded contexts an[2D[K
and to trigger side effects in other parts of the system.

### 1.2 Clean Architecture
The architecture should follow the clean architecture principles, which sep[3D[K
separates concerns into different layers:

**Presentation Layer (portal/, api/)**
- Handles user input and output.
- Contains routes, controllers, views, and UI components.

**Application Layer (service.py)**
- Orchestrates business logic and use cases.
- Contains application services that call domain objects to perform actions[7D[K
actions.

**Domain Layer (schemas.py + logic)**
- Contains the core business rules, domain entities, value objects, and agg[3D[K
aggregate roots.
- Defines the data model and behavior of the system.

**Infrastructure Layer (models.py)**
- Handles external dependencies, such as databases, external services, and [K
messaging systems.
- Contains database models, repositories, and adapters that interact with t[1D[K
the domain layer.

---

## 2. Python / FastAPI Standards

### 2.1 Router Standards
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix='/api/v1/{module}', tags=['{Module}'])

@router.get('/', response_model=list[ItemResponse])
async def list_items(
    tenant_id: str = Depends(get_current_tenant_id),  # ALWAYS FIRST
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
) -> list[ItemResponse]:
    return await service.list_items(db, tenant_id, skip, limit)
```

**Router Rules**:
- Every endpoint has tenant_id as first dependency.
- All list endpoints support pagination (skip/limit).
- Use appropriate HTTP methods (GET/POST/PUT/PATCH/DELETE).
- Return proper HTTP status codes.

### 2.2 Service Standards
```python
async def create_item(
    db: AsyncSession,
    tenant_id: str,  # ALWAYS second parameter after db
    data: ItemCreate
) -> ItemResponse:
    # 1. Validate business rules
    # 2. Create domain object
    # 3. Persist via repository
    # 4. Publish domain event
    # 5. Return response schema
```

### 2.3 Model Standards
```python
class Item(Base):
    __tablename__ = 'items'

    id = Column(String, primary_key=True, default=generate_id)
    tenant_id = Column(String, nullable=False, index=True)  # REQUIRED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)  # soft delete
```

### 2.4 Error Handling
```python
# Standard error responses:
raise HTTPException(status_code=404, detail='Item not found')
raise HTTPException(status_code=403, detail='Access denied')
raise HTTPException(status_code=422, detail='Validation failed')
```

---

## 3. CQRS Standards

**Commands** (write operations):
- Named: {Verb}{Entity}Command — CreateLeadCommand
- Handler: {Verb}{Entity}Handler
- Returns: Created/Updated entity ID

**Queries** (read operations):
- Named: Get{Entity}Query, List{Entity}Query
- Handler: {Entity}QueryHandler
- Returns: Read model / DTO (never domain aggregate)

**Separation Rule**: Query handlers MUST NOT modify state.

---

## 4. Event-Driven Standards

**Event Catalog**: 04-DESIGN/EVENTS/Event-Catalog.md

**Event Schema**:
```python
class DomainEvent:
    event_id: str           # UUID
    event_type: str         # {Entity}{PastTenseVerb}
    tenant_id: str          # ALWAYS present
    aggregate_id: str       # The entity this event is about
    occurred_at: datetime
    payload: dict           # Event-specific data
```

**Current Event Infrastructure**:
- Workflow engine: src/commercial/workflow_engine/
- Domain events: src/commercial/procurement_events/
- Real-time push: src/commercial/sse_notifications/
- Webhook delivery: src/commercial/webhook_notifications/

---

## 5. Database Standards

### 5.1 Alembic Migration Rules
```
BEFORE creating migration:
□ Every migration must have both upgrade() AND downgrade()
□ Zero-downtime: no locking on large tables
□ Test downgrade before committing
□ Migration name: {timestamp}_{description}.py
```

### 5.2 Multi-Tenant Data Rules
- ALL tables have tenant_id column (NOT NULL, INDEXED)
- ALL queries filter by tenant_id
- NEVER join across tenant_id boundaries
- Uploads stored at: uploads/{tenant_id}/{category}/

### 5.3 Naming Conventions
- Tables: snake_case plural (purchase_orders, work_orders)
- Columns: snake_case (tenant_id, created_at)
- Indexes: ix_{table}_{column}
- Foreign keys: fk_{table}_{ref_table}_{column}

---

## 6. API Standards

### 6.1 URL Patterns
```
/api/v1/{domain}/{resource}          # list + create
/api/v1/{domain}/{resource}/{id}     # get + update + delete
/api/v1/{domain}/{resource}/{id}/{action}  # specific actions
```

### 6.2 Response Standards
```json
{
  "data": {...},
  "meta": {"total": 100, "skip": 0, "limit": 50}
}
```

### 6.3 Pagination
Use src/commercial/pagination/ — ALWAYS for list endpoints.

---

## 7. Frontend Standards (Next.js / portal/)

### 7.1 Route Structure
```
portal/app/(app)/
├── {domain}/
│   ├── page.tsx        # List view
│   ├── [id]//
│   │   └── page.tsx    # Detail view
│   └── new/
│       └── page.tsx    # Create view
```

### 7.2 Component Rules
- Use components from packages/ui/ first
- Custom components in portal/components/
- Every page: loading state + error state + empty state
- Use portal/lib/api/ for ALL API calls

### 7.3 Type Safety
- Zod schemas in portal/lib/schemas/
- Types from portal/lib/types/
- Never use 'any' type

---

## 8. Testing Standards

### 8.1 Backend Tests (tests/commercial/)
```
tests/commercial/{module}/
├── test_{module}_router.py    # API integration tests
├── test_{module}_service.py   # Unit tests
└── test_{module}_models.py    # DB model tests
```

Coverage requirement: 80% minimum per module

### 8.2 Frontend Tests (portal/__tests__/)
- Unit tests for utility functions
- Component tests for complex components
- Integration tests for portal/tests/api/

---

## 9. Naming Standards

| Context | Convention | Example |
|---------|-----------|---------|
| Python files | snake_case | purchase_order_service.py |
| Python classes | PascalCase | PurchaseOrderService |
| Python functions | snake_case | create_purchase_order() |
| TypeScript files | kebab-case | purchase-order-form.tsx |
| React components | PascalCase | PurchaseOrderForm |
| CSS classes | kebab-case | purchase-order-table |
| DB tables | snake_case plural | purchase_orders |
| API endpoints | kebab-case | /purchase-orders |
| Domain events | PascalCase | PurchaseOrderCreated |
| Git branches | kebab-case | feature/purchase-order-approval

---

## 10. Git & Branch Standards

```
Branch naming:
  feature/{sprint}-{description}    feature/sprint-010-procurement-approval[39D[K
feature/sprint-010-procurement-approval
  fix/{issue-id}-{description}      [K
fix/123-tenant-isolation-query
  hotfix/{description}              hotfix/purchase-order-null-pointer
  docs/{description}                docs/update-domain-map

Commit format (Conventional Commits):
  feat(procurement): add supplier approval workflow
  fix(tenant): add missing tenant_id filter to inventory query
  docs(architecture): add ADR-011 for caching strategy
  test(maintenance): add work order service unit tests
  refactor(commercial): extract pagination to shared module
```

---

## Cross-References
- AI Governance: AI-GOVERNANCE.md
- Quality Gates: QUALITY_GATES.md
- Full handbook: 05-ENGINEERING/HANDBOOK/Engineering-Constitution.md
- Coding standards: 05-ENGINEERING/FOUNDATION/Coding-Standards.md
- AI delivery standards: 10-AI/DELIVERY/STANDARDS/

