# V8: Sensitive Data Protection
**ASVS 5.0 Compliance Status:** SECURED

## Verified Controls
- **V8.1 Redaction:** API response schemas filter out salt hashes and password fields completely.
- **V8.2 Logging Safety:** Standard log configurations strip authorization headers and bearer tokens to prevent token leakage in traces.
- **V8.3 Data-at-Rest:** Databases are prepared for PostgreSQL transparent data encryption (TDE) parameters.
