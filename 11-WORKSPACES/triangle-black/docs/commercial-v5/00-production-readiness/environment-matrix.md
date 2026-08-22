# Environment Variable Matrix

| Variable | Purpose | Set? |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ❌ No |
| `REDIS_URL` | Redis cache connection | ❌ No |
| `TB_SECRET_KEY` | JWT signing secret | ❌ No |
| `DEFAULT_HOTEL_ID` | Fallback tenant identifier | ❌ No |
| `DISABLE_RATE_LIMIT` | Development rate limit bypass | ❌ No |
| `ENABLE_TENANT_RATE_LIMIT` | Production per-tenant throttling | ❌ No |
| `TENANT_RATE_LIMIT_MAX` | Max requests per tenant window | ❌ No |
| `LOG_FORMAT` | Structured logging format (json) | ❌ No |
| `ETA_CLIENT_ID` | Egyptian e-invoicing integration | ❌ No |
| `ETA_CLIENT_SECRET` | Egyptian e-invoicing secret | ❌ No |
