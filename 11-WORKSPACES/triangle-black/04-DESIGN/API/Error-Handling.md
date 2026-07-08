# Error Handling

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "email",
        "message": "Email is required",
        "code": "REQUIRED"
      }
    ]
  }
}
```

## Error Codes

### 400 — Validation Errors

| Code | Message | When |
|------|---------|------|
| VALIDATION_ERROR | One or more validation errors | Field validation fails |
| INVALID_EMAIL | Invalid email format | Email format check |
| INVALID_ENUM | Invalid value for {field} | Invalid enum value |
| REQUIRED | {field} is required | Missing required field |
| MAX_LENGTH | {field} exceeds {n} characters | String too long |
| MIN_VALUE | {field} must be at least {n} | Number too low |

### 401 — Authentication Errors

| Code | Message | When |
|------|---------|------|
| UNAUTHENTICATED | Authentication required | No token |
| INVALID_TOKEN | Invalid or expired token | Bad JWT |
| TOKEN_EXPIRED | Token has expired | Expired access token |

### 403 — Authorization Errors

| Code | Message | When |
|------|---------|------|
| FORBIDDEN | Insufficient permissions | Wrong role |
| NOT_OWNER | You do not own this resource | Cross-resource access |
| TENANT_MISMATCH | Resource belongs to different tenant | Cross-tenant access |

### 404 — Not Found

| Code | Message | When |
|------|---------|------|
| NOT_FOUND | {resource} not found | Invalid ID |

### 409 — Conflict

| Code | Message | When |
|------|---------|------|
| DUPLICATE_EMAIL | Email already in use | Duplicate email |
| DUPLICATE_NAME | Company name already exists | Duplicate company |
| ALREADY_EXISTS | {resource} already exists | General duplicate |

### 422 — Business Rule Violations

| Code | Message | When |
|------|---------|------|
| LOST_REASON_REQUIRED | Reason required when closing lost | Opportunity lost |
| LINE_ITEMS_REQUIRED | At least one line item required | Quotation submit |
| INVALID_STAGE_TRANSITION | Cannot transition from {from} to {to} | Wrong stage order |
| MILESTONES_NOT_APPROVED | All milestones must be approved | Project completion |
| ACTIVE_PROJECTS_EXIST | Cannot terminate contract with active projects | Contract termination |
| QUOTATION_EXPIRED | Quotation has expired | Expired validity |
| CANNOT_CANCEL | Cannot cancel in current status | Wrong request status |

### 429 — Rate Limit

| Code | Message | When |
|------|---------|------|
| RATE_LIMIT_EXCEEDED | Too many requests, try again in {n} seconds | Rate limit hit |

### 500 — Server Errors

| Code | Message | When |
|------|---------|------|
| INTERNAL_ERROR | An unexpected error occurred | Unhandled error |
| DATABASE_ERROR | Database operation failed | DB error |
| STORAGE_ERROR | File storage operation failed | File error |

## Error Handling Middleware

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ValidationException) {
      return response.status(400).json(this.formatError(exception, 400));
    }

    if (exception instanceof BusinessRuleException) {
      return response.status(422).json(this.formatError(exception, 422));
    }

    // Default: 500
    console.error('Unhandled exception:', exception);
    return response.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }

  private formatError(exception: any, status: number) { ... }
}
```
