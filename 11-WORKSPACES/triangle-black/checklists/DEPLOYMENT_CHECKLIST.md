# Deployment Checklist

## Before Deploy
- [ ] Configuration verified for target environment
- [ ] Database backup created
- [ ] Migration tested

## Deploy Steps
- [ ] Run: alembic upgrade head
- [ ] Deploy containers
- [ ] Verify: curl http://localhost:8000/health
- [ ] Run smoke tests
- [ ] Monitor logs 30 minutes

## Rollback Triggers
Rollback if:
- Error rate above 5%
- Response time 10x normal
- Health check failing

Owner: DevOps Agent
Production: Amr approval required
