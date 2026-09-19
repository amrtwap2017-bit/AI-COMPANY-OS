# API / Frontend Contract Audit

Contract status: FAIL / NOT VERIFIED. The active app has 225 route pairs while source has 961 decorators; OpenAPI generation fails. Frontend clients call numerous `/api/v1/*` paths with local fallback URLs; V15 recommendation, evidence, pilot, attention, import, invite and adoption calls target routes the runtime validator says are absent.

Examples of drift: portal recommendation page calls `/api/v1/recommendations/*`; pilot UI depends on pilot routes; portal login calls `/api/v1/auth/login`; the active imported route inventory does not contain the expected login path. This audit cannot certify request/response schema compatibility for all calls.
