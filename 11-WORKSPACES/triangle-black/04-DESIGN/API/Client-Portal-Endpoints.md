# Client Portal API Endpoints

Requires `client_user` or `client_admin` role with auth.

## Service Requests

### List My Requests

```
GET /api/v1/portal/service-requests
Query: ?page=1&limit=20&status=submitted,in_progress&type=maintenance
Response: 200 { data: ServiceRequest[], meta: PaginationMeta }
Permissions: client_user+, client_admin+
```

### Get Service Request

```
GET /api/v1/portal/service-requests/:id
Response: 200 { data: ServiceRequest & { statusHistory } }
Permissions: owner+, client_admin+
```

### Create Service Request

```
POST /api/v1/portal/service-requests
Body: { type, priority, subject, description }
Response: 201 { data: ServiceRequest }
Permissions: client_user+, client_admin+
Business Rules:
  - Auto-generates number: REQ-{YYYY}-{XXXXX}
  - Auto-sets status = 'submitted'
```

### Get Request Status Timeline

```
GET /api/v1/portal/service-requests/:id/timeline
Response: 200 { data: TimelineEvent[] }
Permissions: owner+, client_admin+
```

### Cancel Request

```
POST /api/v1/portal/service-requests/:id/cancel
Body: { reason: string }
Response: 200 { data: ServiceRequest }
Permissions: owner+
Business Rules:
  - Only cancellable in 'submitted' or 'acknowledged' status
  - Sets status = 'closed'
```

## Client Profile

### Get My Company Profile

```
GET /api/v1/portal/company
Response: 200 { data: Company & { activeContracts, activeProjects } }
```

## Documents

### List My Documents

```
GET /api/v1/portal/documents
Query: ?page=1&limit=20&category=invoice,contract&projectId=uuid
Response: 200 { data: Document[], meta: PaginationMeta }
```

### Download Document

```
GET /api/v1/portal/documents/:id/download
Response: 200 — file stream
```
