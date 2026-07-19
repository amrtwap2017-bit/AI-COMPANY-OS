# Triangle Black Engineering Standard

## Core Rules
1. **Multi-Tenancy**: Every SQL query MUST include `workspace_id`.
2. **Domain Logic**: Business rules live in `domain/services`, NOT in API routers.
3. **Architecture**: Use FastAPI (Backend) and Next.js 15 (Frontend).
4. **Data Model**: Follow the Hospitality Supply Chain Entities (Assets, MEP, Contracts).

## Technology Stack
- **Backend**: Python 3.12, SQLAlchemy 2.0 (Async), Pydantic v2.
- **Frontend**: TypeScript, Tailwind CSS, Shadcn UI.
- **Database**: PostgreSQL with pgvector.

## Implementation Guidelines
- Prefer async/await.
- Use explicit type hints.
- Write docstrings for every public function.