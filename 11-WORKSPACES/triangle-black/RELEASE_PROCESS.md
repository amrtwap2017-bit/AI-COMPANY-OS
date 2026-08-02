# RELEASE_PROCESS.md — Triangle Black

## Versioning

Format: MAJOR.MINOR.PATCH

MAJOR = breaking API change
MINOR = new feature backward compatible
PATCH = bug fix

## Branch Strategy

main       production protected requires Amr approval
develop    integration branch
feature    feature/sprint-010-procurement
fix        fix/123-tenant-query
hotfix     hotfix/null-pointer branched from main
release    release/1.3.0 branched from develop

## Regular Release Steps

1. Create release branch from develop
   git checkout -b release/1.3.0 develop

2. Run all quality gates

3. Update CHANGELOG.md

4. Bump version in enterprise.manifest.yaml

5. QA Agent sign-off

6. Amr approval REQUIRED

7. Merge to main
   git merge release/1.3.0

8. Tag the release
   git tag -a v1.3.0 -m "Release 1.3.0"

9. Merge back to develop

## Hotfix Steps P0 emergency only

1. Branch from main
   git checkout -b hotfix/description main

2. Fix the issue

3. Amr approval REQUIRED no exceptions

4. Merge to main and create tag

5. Merge to develop

## Database Migration Rules

1. Every migration needs upgrade() AND downgrade()
2. Zero downtime approach no table locks
3. Test sequence: upgrade then downgrade then upgrade again
4. Never modify a migration already applied to production
5. Run migrations BEFORE deploying new code

## Migration Commands

Create new migration:
  alembic revision --autogenerate -m "description"

Apply migrations:
  alembic upgrade head

Rollback one step:
  alembic downgrade -1

Check current state:
  alembic current

## Rollback Application

  git revert HEAD

## Rollback Database

  alembic downgrade -1

## Release Checklist

Before any production release:
- All quality gates passed
- CHANGELOG.md updated
- Migrations tested upgrade and downgrade
- Staging deployment successful
- QA Agent sign-off given
- Amr approval given
- Database backed up before migration
