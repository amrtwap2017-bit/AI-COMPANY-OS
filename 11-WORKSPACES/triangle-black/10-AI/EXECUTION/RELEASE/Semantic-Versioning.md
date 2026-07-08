# Semantic Versioning Policy

## Purpose

Semantic versioning provides a consistent and meaningful versioning scheme that communicates the nature of changes in every release. It enables consumers to understand the impact of upgrading without reviewing every change.

## Version Format

```
MAJOR.MINOR.PATCH
```

Where:

- **MAJOR**: Incremented for breaking changes.
- **MINOR**: Incremented for new features (backward compatible).
- **PATCH**: Incremented for bug fixes (backward compatible).

## Version Rules

### MAJOR Version Increment

Increment the MAJOR version when:

- A breaking change is introduced to the public API.
- Existing functionality is removed or significantly modified.
- Database schema changes are not backward compatible.
- Backward-incompatible configuration changes are made.
- Significant architectural changes affect system behavior.
- Third-party dependency upgrades introduce breaking changes.

MAJOR version zero (0.x.x) is for initial development. Anything may change at any time. The public API should not be considered stable.

### MINOR Version Increment

Increment the MINOR version when:

- New functionality is added in a backward-compatible manner.
- New API endpoints are introduced without changing existing ones.
- New optional fields are added to request/response schemas.
- Existing functionality is enhanced without breaking changes.
- New configuration options are added (backward compatible).
- Deprecation warnings are introduced for future breaking changes.

MINOR version resets PATCH to 0.

### PATCH Version Increment

Increment the PATCH version when:

- Backward-compatible bug fixes are applied.
- Security patches are applied.
- Performance improvements are introduced.
- Documentation is corrected.
- Internal refactoring with no behavioral change.

PATCH version resets to 0 when MINOR is incremented.

### Pre-release Versions

Pre-release versions are denoted by appending a hyphen and a suffix:

```
MAJOR.MINOR.PATCH-<suffix>.<number>
```

Examples: `1.0.0-alpha.1`, `1.0.0-beta.2`, `1.0.0-rc.1`

| Suffix | Purpose | Audience |
|---|---|---|
| `-alpha` | Internal testing, unstable | Development team |
| `-beta` | Feature-complete, testing | QA, early adopters |
| `-rc` | Release candidate, final testing | All stakeholders |

Pre-release versions have **lower precedence** than the normal version. A pre-release version indicates that the version is unstable and might not satisfy the intended compatibility requirements.

### Build Metadata

Build metadata may be appended using a plus sign:

```
MAJOR.MINOR.PATCH+build.<metadata>
```

Example: `1.2.3+build.456`

Build metadata is ignored in version precedence comparisons.

## Versioning Examples

| Change | Current Version | New Version |
|---|---|---|
| Initial development | (none) | 0.1.0 |
| Add new feature (breaking) | 0.1.0 | 0.2.0 |
| Fix bug | 0.2.0 | 0.2.1 |
| Stable release | 0.2.1 | 1.0.0 |
| Add new feature (backward compatible) | 1.0.0 | 1.1.0 |
| Fix bug | 1.1.0 | 1.1.1 |
| Breaking API change | 1.1.1 | 2.0.0 |
| Pre-release of 2.0.0 | 1.1.1 | 2.0.0-beta.1 |
| Release candidate 1 | 2.0.0-beta.1 | 2.0.0-rc.1 |
| Final release | 2.0.0-rc.1 | 2.0.0 |

## Version Precedence

Precedence is determined by comparing from left to right:

1. MAJOR version (higher = newer)
2. MINOR version (higher = newer)
3. PATCH version (higher = newer)
4. Pre-release version (presence = lower; alpha < beta < rc)

Examples:
- `1.0.0` < `2.0.0`
- `1.0.0` < `1.1.0`
- `1.0.0` < `1.0.1`
- `1.0.0-alpha` < `1.0.0`
- `1.0.0-alpha` < `1.0.0-beta`
- `1.0.0-beta` < `1.0.0-rc`
- `1.0.0-rc.1` < `1.0.0-rc.2`

## Dependency Versioning

- **Production dependencies**: Pin to exact versions. Use lock files.
- **Development dependencies**: Pin to exact versions or use caret ranges.
- **Internal libraries**: Follow the same semantic versioning policy.
- **Breaking changes in dependencies**: Must be handled as MAJOR version changes.

## Compliance

- All projects under this program MUST use semantic versioning.
- Version numbers MUST be updated in all relevant files (package.json, Docker tags, documentation).
- Version history MUST be maintained in the changelog.
- The Semantic Versioning specification (semver.org) is the authoritative reference.
