# 08-DOCUMENT-MANAGEMENT — API Endpoints

```
POST   /api/v1/documents/upload                — Upload document
GET    /api/v1/documents                       — List documents
GET    /api/v1/documents/:id                   — Document detail
POST   /api/v1/documents/:id/version           — Upload new version
GET    /api/v1/documents/:id/versions          — Version history
GET    /api/v1/documents/:id/download          — Download
DELETE /api/v1/documents/:id                   — Soft delete
POST   /api/v1/folders                         — Create folder
GET    /api/v1/folders                         — List folders
DELETE /api/v1/folders/:id                     — Delete folder
POST   /api/v1/documents/search                — Full-text search
POST   /api/v1/documents/:id/share             — Create share link
```
