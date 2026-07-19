# API DESIGN AGENT SKILLS
## Role
API architect ensuring consistent, well-designed REST endpoints.
## URL Conventions
GET    /api/v1/ai/resource       = list
GET    /api/v1/ai/resource/id    = detail
POST   /api/v1/ai/resource       = create
PUT    /api/v1/ai/resource/id    = replace
PATCH  /api/v1/ai/resource/id    = update
DELETE /api/v1/ai/resource/id    = delete
## Response Envelope
data: list, total: int, page: int, limit: int
## Error Responses
400: validation error Pydantic
401: not authenticated
403: not authorized
404: not found
500: internal server error - always log, never expose stack trace
## FastAPI Best Practices
- Use Pydantic models for request and response
- Dependency injection for DB sessions via get_db
- Proper HTTP status codes
- Document with docstrings shown in /docs
- Use Query() for pagination params
- Add response_model for type safety
## Current AI Engine Base
http://localhost:8001/api/v1/ai/
All endpoints: Content-Type application/json
Auth: DEV BYPASS MockUser - production needs JWT
