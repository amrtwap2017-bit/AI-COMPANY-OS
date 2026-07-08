# API Authentication

All API endpoints (except auth) require authentication. Triangle Black uses **JWT Bearer tokens** for first-party clients and will support **API keys** for third-party integrations in a future phase.

## JWT Authentication

### Request

```http
GET /v1/bookings
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Token Format

JWT payload:

```json
{
  "sub": "user-uuid",
  "email": "admin@triangleblack.com",
  "role": "ADMIN",
  "iat": 1718765432,
  "exp": 1718766332
}
```

### Token Lifecycle

| Token          | Duration | Stored In          | Usage                          |
| -------------- | -------- | ------------------ | ------------------------------ |
| Access Token   | 15 min   | Memory (Zustand)   | Authorize API requests         |
| Refresh Token  | 7 days   | HTTP-only cookie + DB | Obtain new access token     |

### Refresh Flow

```http
POST /v1/auth/refresh
Content-Type: application/json

{ "refreshToken": "eyJhbGciOiJIUzI1NiIs..." }
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Token Revocation

- Logout: refresh token is removed from database
- Password change: all refresh tokens for the user are invalidated
- Admin force-logout: specific user's tokens revoked

## API Keys (Future -- V2)

For third-party integrations, API keys will be supported:

| Header             | Description                     |
| ------------------ | ------------------------------- |
| `X-API-Key`        | Static key for server-to-server |
| `X-API-Secret`     | HMAC-signed request payload     |

API keys will be scoped to specific permissions and rate-limited separately.

## Error Responses

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-06-30T14:30:00Z"
  }
}
```

| HTTP Code | Meaning                        | Possible Cause                      |
| --------- | ------------------------------ | ----------------------------------- |
| 401       | Unauthorized                   | Missing/invalid/expired JWT         |
| 401       | Token Expired                  | Access token past 15 min lifetime   |
| 403       | Forbidden                      | Valid token but insufficient role   |
| 403       | Inactive Account               | User account is disabled            |