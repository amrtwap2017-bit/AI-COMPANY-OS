# Security, Multi-Tenancy & Governance Matrix

## Security Baseline
- **Tenant Isolation:** Enforced via `hotel_id` filter across all repository queries.
- **Identity:** Dual auth via JWT OAuth2 form fields and `/api/v1/auth/login/json`.
- **RBAC:** Roles defined (`admin`, `manager`, `technician`, `client`, `supplier`).
- **AI Safety:** AI Gateway prevents raw LLM database mutations; all operations require human approval or structured use-case models.
