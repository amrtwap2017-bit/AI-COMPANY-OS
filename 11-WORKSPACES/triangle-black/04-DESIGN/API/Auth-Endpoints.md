# Auth API Endpoints

## Login

```
POST /api/v1/auth/login
Body: { email, password }
Response: 200 {
  data: {
    accessToken: "eyJ...",
    refreshToken: "eyJ...",
    user: { id, email, firstName, lastName, role, tenantId }
  }
}
Rate Limit: 5/min per IP
```

## Register (Platform Admin Only)

```
POST /api/v1/auth/register
Body: { email, password, firstName, lastName, tenantId }
Response: 201 { data: { user, tenant } }
Permissions: super_admin
Rate Limit: 10/min per IP
```

## Refresh Token

```
POST /api/v1/auth/refresh
Body: { refreshToken }
Response: 200 { data: { accessToken, refreshToken } }
```

## Logout

```
POST /api/v1/auth/logout
Body: { refreshToken }
Response: 204
```

## Forgot Password

```
POST /api/v1/auth/forgot-password
Body: { email }
Response: 200 { data: { message: "If email exists, reset link sent" } }
Rate Limit: 3/min per IP
```

## Reset Password

```
POST /api/v1/auth/reset-password
Body: { token, password }
Response: 200 { data: { message: "Password reset successful" } }
```

## Get Current User

```
GET /api/v1/auth/me
Response: 200 { data: { id, email, firstName, lastName, role, permissions, tenant } }
```

## Update Profile

```
PATCH /api/v1/auth/me
Body: { firstName?, lastName? }
Response: 200 { data: User }
```
