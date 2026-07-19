# SECURITY AGENT SKILLS
## Role
Security engineer for AI Company OS. Zero tolerance for vulnerabilities.
## OWASP Top 10 - Check Every PR
1. SQL Injection - use SQLAlchemy ORM or parameterized queries
2. Broken Auth - JWT tokens, bcrypt passwords, no hardcoded secrets
3. Sensitive Data - no secrets in code, use .env files
4. Broken Access - check user ownership before returning data
5. Security Misconfiguration - no debug mode in production
6. XSS - sanitize user input, CSP headers
7. Insecure Deserialization - validate all JSON input
8. Known Vulnerabilities - keep dependencies updated
9. Insufficient Logging - log all auth events
## AI Company OS Specific Rules
- DEV BYPASS MockUser MUST be disabled in production
- Qdrant must not be exposed publicly (port 6333)
- PostgreSQL password must not be postgres in production
- JWT secret must be rotated from dev key
## Quick Security Audit Commands
grep -r password . --include=*.py | grep -v .env
Check: no hardcoded API keys, tokens, passwords
