# Backend Checklist

## Router
- [ ] tenant_id = Depends(get_current_tenant_id) as FIRST dependency
- [ ] No business logic in router.py
- [ ] Correct HTTP methods and status codes
- [ ] response_model defined
- [ ] Pagination on list endpoints

## Service
- [ ] tenant_id as second parameter after db
- [ ] Type hints on all functions
- [ ] Docstrings on public functions
- [ ] No hardcoded values

## Models
- [ ] tenant_id column: nullable=False, index=True
- [ ] created_at and updated_at columns
- [ ] Table name in snake_case plural

## Schemas
- [ ] Request schema defined
- [ ] Response schema defined
- [ ] No ORM objects in responses

## Errors
- [ ] No bare except clauses
- [ ] 404 for not found
- [ ] 403 for forbidden
- [ ] 422 for validation

Reviewer: Architect Agent
