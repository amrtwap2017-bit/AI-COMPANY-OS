# Enterprise SaaS Architecture v4

## SaaS tenancy model

`Company` is the platform commercial account. An `Organization` is the isolation tenant. An organization may operate multiple business units, sites/hotels and brands. Users receive memberships, scoped permissions and optional customer/supplier portal identities.

## Platform services

| Service | Target responsibility |
|---|---|
| Organizations and provisioning | create tenant, initial admin, industry package, region/storage policy and baseline configuration. |
| Subscription, plans and licensing | plan entitlements, seats, modules, usage limits, contract dates, trials and grace rules. |
| Feature flags | decouple deployment from enablement; enable phased customer rollout and kill switches. |
| Usage and billing | meter active seats, transactions, storage, exports, AI tokens/credits and premium integrations. |
| Branding | tenant domain, theme, assets, terminology and document template isolation. |
| Storage | tenant-scoped paths, encryption, retention, legal hold, virus scanning and signed access. |
| Marketplace | signed extensions/integration manifests, permissions, lifecycle, billing and revocation. |
| Support/governance | tenant support access with time-boxed consent, audit trail and break-glass policy. |

## Isolation and compliance requirements

- Every query carries an immutable organization scope; database RLS is the defense-in-depth target.
- Tenant data, vectors, files, caches, queues, events and analytics partitions must share the same scope.
- Maintain tenancy migration/backfill tools, export/deletion processes, retention policy and backup restore tests.
- Do not infer tenant from a client header alone; validate membership and allowed data scope server-side.

## Backward compatibility

Existing `hotel_id` users remain valid through a tenant/site mapping. Existing deployments start as a single organization with one site; tenants are expanded without URL or API breakage through compatibility adapters.

