# 09 Authentication Audit

JWT HS256/bcrypt/access+refresh tokens and role helpers exist. Access expiry 8h, refresh 30d. Registration accepts user-provided role; logout has no revocation; refresh tokens are not persisted. Production secret is environment-backed but development credential/default references remain tracked (redacted). Tenant binding can fall back to a default hotel or unbound header context. Status PARTIAL, not secure-by-proof.
