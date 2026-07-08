# Git

| Field | Value |
|---|---|
| Document ID | 17-Engineering-02 |
| Document Purpose | Define Git workflow, commit conventions, and repository configuration |
| Version | 1.0 |
| Status | Approved |

## Commit Conventions

All commits **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:

| Type | Usage |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `chore` | Maintenance, tooling, dependencies |
| `docs` | Documentation changes |
| `style` | Formatting, missing semicolons (not CSS) |
| `refactor` | Code change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `ci` | CI/CD configuration changes |
| `build` | Build system or external dependency changes |

Scopes:

| Scope | Area |
|---|---|
| `api` | NestJS backend API |
| `web` | Next.js frontend |
| `db` | Prisma schema, migrations, seeds |
| `infra` | Docker, Nginx, CI/CD |
| `docs` | Documentation files |
| `deps` | Dependency updates |

Examples:

```
feat(api): add user registration endpoint
fix(web): correct date format on booking summary
chore(deps): upgrade prisma to 5.10.0
docs(api): document rate limiting behavior
```

Breaking changes append `!` after type/scope:

```
feat(api)!: remove deprecated v1 endpoints
```

## .gitignore

```gitignore
node_modules/
dist/
.next/
*.log
.env
.env.local
.env.*.local
*.tsbuildinfo
coverage/
.turbo/
*.prisma-client/
.DS_Store
Thumbs.db
```

## .gitattributes

```gitattributes
# Normalize line endings
* text=auto

# TypeScript
*.ts text eol=lf
*.tsx text eol=lf

# Markdown
*.md text eol=lf diff=markdown

# YAML
*.yml text eol=lf
*.yaml text eol=lf

# JSON
*.json text eol=lf

# Images
*.png binary
*.jpg binary
*.svg text eol=lf

# Lock files
package-lock.json -diff
```

## Pre-Commit Hooks

Run `npm run lint-staged` before every commit:

- ESLint on staged `.ts`/`.tsx` files
- Prettier on staged files
- TypeScript type check on changed files

## Commit Messages Rules

1. Description is imperative present tense ("add" not "added")
2. Description does not begin with capital (unless proper noun)
3. No period at end of description
4. Wrap body at 72 characters
5. Footer contains `BREAKING CHANGE:` or issue references

## Cross-References

- [Branching.md](Branching.md) — Branch naming aligned with commits
- [PR-Review.md](PR-Review.md) — Squash merge strategy
- [CI-CD.md](CI-CD.md) — CI triggers on push
