# Platform, Security and Operations Inventory

## Configuration and environment keys

Observed configuration families include database URL variants (`DATABASE_URL`, `TRIANGLE_BLACK_DB_URL`, `POSTGRES_URL`), JWT variants (`JWT_SECRET`, `TB_SECRET_KEY`, `JWT_SECRET_KEY`), SMTP variables, environment mode, public API/AI URLs, auth-bypass flags and AI/report engine URLs. Values are intentionally not reproduced.

## Secrets and identity

- Defaults and seeded credentials exist in source/runtime paths and must be replaced by secret-managed environment injection.
- Core authentication uses one secret name while production compose supplies another; JWT generation also appears in additional paths.
- RBAC exists both in `src/core/auth.py` and custom code in `src/main.py`; role vocabularies differ.
- Browser token handling varies across portals and direct page calls.

## Runtime and deployment

| Artifact | Inventory finding |
|---|---|
| Dockerfiles | API Dockerfile expects an absent `pyproject.toml`; portal/client images are separate. |
| Compose | local and production compose files differ materially; ports 8000/8020/8030 are used across scripts/config. |
| Proxy | Nginx proxies API and portal routes but does not demonstrate production TLS/certificate, CSP, HSTS or full security-header policy. |
| Health | multiple health endpoints and port assumptions exist. |
| Observability | request IDs and health checks exist; no governed metrics/tracing/logging/alert stack or SLO catalogue. |
| Backups/recovery | database artifacts and scripts exist; no demonstrated automated restore drill. |

## Notifications, emails, PDFs and integrations

Notifications are split across notifications, system notifications, notification engine, SSE, email notifications, email alert and email service. PDF/export capabilities are split across core PDF, PDF service/export, quotation PDF, CSV export and report code. Integrations are mostly documented; external gateway, retry, DLQ and contract registry are not active runtime services.

## Security baseline required

Central settings and secrets provider; verified JWT/OIDC session service; organization-aware authorization policies; OWASP ASVS controls; request limits backed by shared storage; CSP/HSTS/security headers; encrypted tenant storage; audit/log retention; dependency/SBOM/secret scanning; and incident/recovery evidence.

