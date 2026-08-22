# V4: Access Control Verification
**ASVS 5.0 Compliance Status:** SECURED

## Verified Controls
- **V4.1 Tenant Isolation:** Every repository method implements strict `hotel_id` parameters bound to JWT claims.
- **V4.2 Role Gating:** Custom decorator `require_role(*roles)` actively guards financial and administrative endpoints.
- **V4.3 IDOR Defense:** Direct resource lookups enforce tenant boundaries (`id == target_id AND hotel_id == bound_tenant`).
