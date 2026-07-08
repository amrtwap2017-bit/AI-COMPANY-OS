# 99-RELEASE — API Endpoints

```
GET    /api/v1/release/versions                  — Release history
POST   /api/v1/release/versions                  — Create release
PATCH  /api/v1/release/versions/:id/status       — Update release status
GET    /api/v1/release/uat/test-cases            — UAT test cases
PATCH  /api/v1/release/uat/test-cases/:id        — Update test result
GET    /api/v1/release/defects                   — Defect list
POST   /api/v1/release/defects                   — Log defect
PATCH  /api/v1/release/defects/:id               — Update defect
GET    /api/v1/release/health                     — System health check
GET    /api/v1/release/metrics                    — System performance metrics
```
