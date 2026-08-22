# API Route Governance Matrix
Total Registered Routes: 302

## Governance Compliance
- **Auth Scheme:** JWT (`Bearer <access_token>`) via `tb_access_token`
- **Tenant Extraction:** `get_hotel_id` from JWT `sub` / `X-Hotel-ID`
- **Rate Limiting:** Global whitelist for local/tests + Per-Tenant sliding counters
- **Response Headers:** `X-Request-ID`, `X-Response-Time-Ms`, `X-DB-Query-Count`
