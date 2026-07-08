# Error Flows

## Global Error Patterns

| Error Type | User Impact | System Response | User Action |
|-----------|-------------|-----------------|-------------|
| Network failure | Cannot load data | ErrorState component with retry button | Click "Retry" |
| Server error (5xx) | Cannot process request | Toast: "Something went wrong. Please try again." + log error | Retry or contact support |
| Validation error | Form cannot submit | Inline error messages on fields + toast | Fix highlighted fields |
| Not found (404) | Page doesn't exist | Custom 404 page with navigation links | Use navigation or search |
| Forbidden (403) | No permission | Toast: "You don't have permission to do this" + redirect | Contact admin |
| Unauthorized (401) | Session expired | Redirect to login with message: "Your session has expired" | Log in again |
| Rate limited (429) | Too many requests | Toast: "Too many requests. Please wait." | Wait and retry |

---

## Per-Flow Error States

### Lead Creation Errors

| Scenario | Error Message | System Action |
|----------|--------------|---------------|
| Missing required fields | "Name and email are required" | Field-level validation |
| Invalid email format | "Please enter a valid email address" | Field-level validation |
| Duplicate lead found | "A lead with this email already exists" | Show duplicate dialog |
| API failure | "Failed to create lead. Please try again." | Toast + log error |
| Network timeout | "Connection lost. Please check your internet." | ErrorState component |

### Quotation Approval Errors

| Scenario | Error Message | System Action |
|----------|--------------|---------------|
| User lacks approval authority | "You don't have authority to approve quotations above EGP 50,000" | Disable approve button |
| Quotation expired | "This quotation has expired and cannot be approved" (BR-QTN-04) | Disable all actions |
| Missing line items | "Quotation must have at least one line item" | Block submission |
| Margin below threshold | "Warning: Margin is below 18% threshold. Additional approval required." | Route to higher approver |
| Missing predecessor | "Cannot complete milestone — predecessor milestones not complete" | Block with explanation |

### Client Portal Errors

| Scenario | Error Message | System Action |
|----------|--------------|---------------|
| Wrong tenant | "You don't have access to this data" | Redirect to own data |
| Session timeout | "Your session has expired. Please log in again." | Force logout to login page |
| Failed login (5 attempts) | "Account locked for 30 minutes due to too many failed attempts" (BR-POR-06) | Lock account, notify admin |
| Password expired | "Your password has expired. Please reset." | Force password reset |
| File too large | "File exceeds the 25MB limit" | Block upload, show limit |
| Invalid file type | "File type not supported. Allowed: PDF, DOCX, XLSX, JPG, PNG, DWG" (BR-PRJ-06) | Block upload |

### Dashboard Errors

| Scenario | Error Message | System Action |
|----------|--------------|---------------|
| No data source | "Unable to load dashboard data" | ErrorState with retry |
| Slow query (>3s) | Loading skeleton for >3s → "Still loading..." | Extended loading state |
| Partial data failure | One widget fails → others still render | Failed widget shows error, others normal |

---

## Error Response Contract

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "INVALID_FORMAT"
      }
    ],
    "requestId": "req_abc123",
    "timestamp": "2026-07-01T14:30:00Z"
  }
}
```

## Error Recovery Patterns

| Pattern | Description | Implementation |
|---------|-------------|---------------|
| Auto-retry | Automatic retry on network failure | 3 retries with exponential backoff |
| Optimistic UI | Assume success, rollback on failure | Update UI immediately; revert on error toast |
| Draft auto-save | Save progress periodically | Auto-save every 30 seconds; restore on reopen |
| Stale data indicator | Warn if data is > 15 minutes old | Subtle "Data may be stale" banner |
| Offline detection | Detect and warn on connection loss | Global banner: "You are offline. Changes will be saved when connected." (V2) |
