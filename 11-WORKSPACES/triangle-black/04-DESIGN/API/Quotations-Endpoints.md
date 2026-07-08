# Quotations API Endpoints

## RFQs

### List RFQs

```
GET /api/v1/quotations/rfqs
Query: ?page=1&limit=20&status=draft,submitted&opportunityId=uuid
Response: 200 { data: RFQ[], meta: PaginationMeta }
Permissions: manager+, admin+
```

### Create RFQ

```
POST /api/v1/quotations/rfqs
Body: { opportunityId, responseDeadline?, notes? }
Response: 201 { data: RFQ }
Permissions: manager+, admin+
Business Rules:
  - Auto-generates RFQ number: RFQ-{YYYY}-{XXXXX}
```

### Update RFQ Status

```
PATCH /api/v1/quotations/rfqs/:id/status
Body: { status: "submitted"|"approved"|"rejected" }
Response: 200 { data: RFQ }
Permissions: manager+, admin+
```

## Quotations

### List Quotations

```
GET /api/v1/quotations/quotations
Query: ?page=1&limit=20&status=draft,sent&companyId=uuid&opportunityId=uuid
Response: 200 { data: Quotation[], meta: PaginationMeta }
Permissions: sales_rep+, manager+, admin+, viewer
```

### Get Quotation

```
GET /api/v1/quotations/quotations/:id
Response: 200 { data: Quotation & { lineItems, company, opportunity } }
Permissions: owner+, manager+, admin+, viewer
```

### Create Quotation

```
POST /api/v1/quotations/quotations
Body: {
  opportunityId, companyId,
  lineItems: [{ description, quantity, unit, unitPrice, discountPercent? }],
  validUntil, notes?, terms?, margin?
}
Response: 201 { data: Quotation }
Permissions: sales_rep+, manager+, admin+
Business Rules (BR-QTN-01):
  - Auto-generates number: QTN-{YYYY}-{XXXXX}
  - Auto-calculates subtotal, tax (14%), total
  - Sets version = 1 for initial
```

### Update Quotation

```
PATCH /api/v1/quotations/quotations/:id
Body: { lineItems?, validUntil?, notes?, ... }
Response: 200 { data: Quotation }
Permissions: owner+, manager+, admin+
Business Rules:
  - Only updatable in 'draft' status
  - Increments version on re-send
```

### Submit Quotation

```
POST /api/v1/quotations/quotations/:id/submit
Body: {}
Response: 200 { data: Quotation }  — status → 'sent', sent_at = now()
Permissions: owner+, manager+, admin+
Business Rules (BR-QTN-02):
  - Validates at least 1 line item
  - Validates validUntil is at least 7 days from now
```

### Approve Quotation (Internal)

```
POST /api/v1/quotations/quotations/:id/approve
Body: {}
Response: 200 { data: Quotation }  — status → 'approved', approved_by, approved_at
Permissions: manager+, admin+
Business Rules:
  - Status must be 'sent' or 'under_review'
  - Sets approved_by to current user
```

### Reject Quotation (Internal)

```
POST /api/v1/quotations/quotations/:id/reject
Body: { reason: string }
Response: 200 { data: Quotation }  — status → 'rejected'
Permissions: manager+, admin+
```

### Clone Quotation

```
POST /api/v1/quotations/quotations/:id/clone
Body: {}
Response: 201 { data: Quotation }  — New draft, version 1, copied line items
Permissions: sales_rep+, manager+, admin+
```

### Get Quotation PDF

```
GET /api/v1/quotations/quotations/:id/pdf
Response: 200 — application/pdf
Permissions: owner+, manager+, admin+
```

## Contracts

### List Contracts

```
GET /api/v1/quotations/contracts
Query: ?page=1&limit=20&status=active,signed&companyId=uuid
Response: 200 { data: Contract[], meta: PaginationMeta }
Permissions: manager+, admin+, owner+, viewer
```

### Get Contract

```
GET /api/v1/quotations/contracts/:id
Response: 200 { data: Contract & { quotation, company, projects } }
Permissions: manager+, admin+, owner+, viewer
```

### Create Contract from Quotation

```
POST /api/v1/quotations/contracts
Body: { quotationId, title, startDate, endDate, terms? }
Response: 201 { data: Contract }
Permissions: manager+, admin+
Business Rules (BR-CTR-01):
  - Quotation must be 'approved'
  - Auto-generates number: CNT-{YYYY}-{XXXXX}
  - Sets value from quotation.total
```

### Sign Contract

```
POST /api/v1/quotations/contracts/:id/sign
Body: {}
Response: 200 { data: Contract }  — status → 'signed', signed_at = now()
Permissions: manager+, admin+
```

### Activate Contract

```
POST /api/v1/quotations/contracts/:id/activate
Body: {}
Response: 200 { data: Contract }  — status → 'active'
Permissions: manager+, admin+
```

### Terminate Contract

```
POST /api/v1/quotations/contracts/:id/terminate
Body: { reason: string }
Response: 200 { data: Contract }  — status → 'terminated'
Permissions: admin+
Business Rules:
  - Cannot terminate if active projects exist
  - Sets terminated_at = now()
```
