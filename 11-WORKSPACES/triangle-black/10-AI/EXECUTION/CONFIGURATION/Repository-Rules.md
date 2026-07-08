# Repository Management Rules

## Purpose

Establish consistent rules for repository structure, access, protection, and content management across all projects. These rules ensure security, maintainability, and audibility of the codebase.

## Repository Structure

### Standard Layout

Every repository should follow this structure:

```
/
├── .github/              # GitHub Actions workflows, templates
│   ├── workflows/
│   ├── CODEOWNERS
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/                 # Project documentation
├── scripts/              # Build and utility scripts
├── src/                  # Source code
│   ├── main/             # Production code
│   └── test/             # Test code
├── .gitignore
├── .pre-commit-config.yaml
├── README.md
├── package.json          # (or equivalent: pom.xml, Cargo.toml, etc.)
├── LICENSE
└── CHANGELOG.md
```

### Language-Specific Conventions

- **Node.js**: Use `src/`, `test/`, monorepo with workspaces
- **Java/Kotlin**: Standard Maven or Gradle layout (`src/main/java`, `src/test/java`)
- **Python**: `src/` layout with `pyproject.toml`
- **Rust**: Standard Cargo layout
- **Infrastructure**: Terraform modules in `terraform/`, Helm charts in `charts/`

## Branch Protection Rules

### Main Branch Protection

The following rules are enforced on all `main` and release branches:

| Rule | Setting |
|------|---------|
| Require pull request | Enabled — no direct pushes |
| Required approvals | Minimum 1 reviewer |
| Dismiss stale approvals | Enabled — approval resets on new pushes |
| Require status checks | Enabled — all required checks must pass |
| Require signed commits | Enabled — all commits must be signed with a GPG or SSH key |
| Require linear history | Enabled — no merge commits |
| Include administrators | Enabled — applies to admins too |
| Restrict push access | Only CI/CD service accounts |
| Lock branch | Disabled (restricted) |

### Status Checks Required

- Build and compilation
- All unit tests (passing)
- All integration tests (passing)
- Linting and static analysis (no new warnings)
- Security vulnerability scan (no critical/high findings)
- Secret scanning (no secrets detected)
- Code coverage threshold (no decrease below target)
- Dependency license check (all licenses approved)
- Branch up-to-date with main

## CODEOWNERS

Every repository must maintain a `.github/CODEOWNERS` file that defines:

- **Default owners** for the entire repository (team leads)
- **Specific owners** for critical directories (e.g., security, infrastructure, database migrations)
- **Review requirements** — matches CODEOWNERS are automatically requested

### Example CODEOWNERS

```
# Default owners
* @team-leads

# Security-sensitive areas
/src/security/ @security-team
/src/infrastructure/ @platform-team
/database/migrations/ @data-team

# Documentation
/docs/ @tech-writers

# CI/CD
/.github/workflows/ @platform-team
```

## File Size Limits

| Limit | Rule |
|-------|------|
| **Single file max** | 10 MB |
| **Generated files** | 5 MB — must be in `.gitattributes` as `linguist-generated=true` |
| **Binary files** | 100 KB preferred — larger files must use Git LFS |
| **Repository total** | 1 GB soft limit |

Files exceeding these limits must use Git LFS (Large File Storage).

## Binary File Policy

- **Prohibited**: Binary files that are build artifacts, dependencies, or generated outputs (`.exe`, `.dll`, `.jar`, `.class`, `.log`, `.pyc`, `node_modules/`)
- **Conditional**: Assets like images, fonts, PDFs under 100 KB may be committed. Larger assets must use Git LFS or external asset storage.
- **Allowed via LFS**: Large datasets, trained ML models, audio/video files, design files (`.psd`, `.ai`)

## .gitignore Standards

Every repository must include a baseline `.gitignore` covering:

```
# Build outputs
dist/
build/
target/
*.class
*.pyc

# Dependencies
node_modules/
vendor/
.venv/

# Environment files
.env
.env.local
.env.*.local

# IDE files
.idea/
.vscode/
*.swp
*.swo
.DS_Store
Thumbs.db

# Logs
*.log
/logs/

# Secrets (additional catch-all)
*.pem
*.key
credentials.json
service-account.json

# Coverage reports
coverage/
.coverage

# Generated documentation
/docs/generated/
```

## Git LFS Configuration

Track the following file types with Git LFS:

```
*.psd filter=lfs diff=lfs merge=lfs -text
*.ai filter=lfs diff=lfs merge=lfs -text
*.zip filter=lfs diff=lfs merge=lfs -text
*.tar.gz filter=lfs diff=lfs merge=lfs -text
*.pkl filter=lfs diff=lfs merge=lfs -text
*.h5 filter=lfs diff=lfs merge=lfs -text
*.onnx filter=lfs diff=lfs merge=lfs -text
*.bin filter=lfs diff=lfs merge=lfs -text
```

## Enforcement

| Rule | Enforcement Method |
|------|-------------------|
| Branch protection | Repository settings (platform-enforced) |
| File size limits | Pre-commit hook + CI check |
| Binary files | `.gitignore` + pre-commit hook |
| Secrets | Pre-commit hook + CI secret scanner |
| Commit signing | Repository settings (required) |
| License compliance | CI check |
| Deprecated dependencies | CI check weekly |

## Repository Access Control

| Role | Default Access |
|------|---------------|
| Repository admin | Platform team leads only |
| Write access | All team members |
| Read access | All organization members |
| External contributors | Fork + PR only (read via fork) |
| CI/CD service accounts | Write access to `main`-protected branches only |
