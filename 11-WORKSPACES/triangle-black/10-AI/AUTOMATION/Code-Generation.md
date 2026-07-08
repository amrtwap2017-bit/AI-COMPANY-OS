# Automated Code Generation

## Overview

Code generation within the Enterprise AI Delivery Framework automates the creation of production-quality source code from structured task definitions and architectural templates. The Developer AI (Code Engineer) generates code that adheres to project conventions, passes compilation, linting, and test gates without human intervention.

## Code Generation Patterns

### Generation Triggers

Code is generated in response to:

1. **Task assignment**: Developer AI receives a task with clear acceptance criteria
2. **Template instantiation**: New component or service creation
3. **Boilerplate generation**: Repetitive patterns (CRUD, API endpoints, data models)
4. **Refactoring tasks**: Pattern-based code transformation
5. **Test generation**: Unit and integration tests for implementation

### Generation Approach by Task Type

| Task Type | Generation Strategy | Output |
|-----------|-------------------|--------|
| New feature | Top-down: interface to implementation to test | Complete feature files |
| Bug fix | Bottom-up: locate, understand, fix, test | Targeted file edits |
| Refactoring | Pattern-based: detect, transform, verify | Modified files |
| Boilerplate | Template-based: template, parameterize, render | Generated files |
| Test generation | Coverage-based: analyze, generate, validate | Test files |
| API endpoint | Spec-based: OpenAPI parse and implement | Controller, service, routes |

### Context Injection

Generated code is informed by:

1. **Architecture context**: Component diagram, layer structure, dependency graph
2. **Codebase context**: Existing similar components, naming conventions, patterns
3. **Task context**: Acceptance criteria, technical notes, related tasks
4. **Style context**: .editorconfig, tsconfig, prettier config, coding standards

The Code Engineer loads relevant context files before generation and uses them to guide style and structure decisions.

## Template Resolution

### Template Hierarchy

Code templates follow a hierarchy of specificity:

1. **Global templates**: Apply to all projects (license headers, base class patterns)
2. **Project templates**: Project-specific patterns (project component structure)
3. **Module templates**: Module-specific patterns (service layer, controller patterns)
4. **Task-specific templates**: Generated per-task with task-specific parameters

### Template Types

| Template Type | Description | Resolution Order |
|--------------|-------------|-----------------|
| File templates | Complete file structure with placeholders | 1 |
| Segment templates | Code blocks inserted into existing files | 2 |
| Pattern templates | Reusable implementation patterns (Repository, Factory, etc.) | 3 |
| Test templates | Test file structures with mock setups | 4 |

### Template Variables

Templates use a standard variable syntax with double curly braces:

Standard variables available to all templates:

| Variable | Description |
|----------|-------------|
| project_name | Project identifier |
| module_name | Current module name |
| component_name | Component being generated |
| task_id | Referring task ID |
| author | AI agent identifier |
| date | Generation date |
| base_path | Project base path |
| import_paths | Computed import paths |
| type_definitions | Relevant type imports |
| error_handling | Project error handling pattern |
| logging_config | Project logging setup |
| test_framework | Project test framework |

## Code Organization

### File Structure Rules

Generated code follows the project's established file organization. Two common patterns are supported:

**Feature-based structure:**
```
src/features/{feature-name}/
  api/{feature}.controller.ts, {feature}.routes.ts
  domain/{feature}.service.ts, {feature}.types.ts
  data/{feature}.repository.ts, {feature}.entity.ts
```

**Layer-based structure:**
```
src/
  controllers/{feature}.controller.ts
  services/{feature}.service.ts
  repositories/{feature}.repository.ts
  entities/{feature}.entity.ts
```

The Code Engineer detects the convention from existing code and follows it.

### Naming Conventions

Naming follows project conventions detected from existing files:

- **Files**: kebab-case or PascalCase as project dictates
- **Classes/Interfaces**: PascalCase
- **Functions/Methods**: camelCase
- **Constants/Enums**: UPPER_SNAKE_CASE
- **Directories**: kebab-case
- **Database tables**: snake_case (backend) or camelCase (ORM convention)

## Import Management

### Import Organization

Generated code organizes imports following a standard convention:

1. External dependencies (npm packages, libraries)
2. Internal modules (project imports)
3. Relative imports (same-module imports)
4. Type-only imports (import type vs import)

Each group is sorted alphabetically and separated by a blank line.

### Import Resolution

The Code Engineer resolves imports by:

1. Scanning package.json for dependency availability
2. Checking existing import patterns for alias configuration
3. Using project path aliases (e.g., @/ maps to src/)
4. Computing relative paths based on file location
5. Adding missing dependencies to package.json when needed

### Dead Import Detection

Generated code is checked for:

- Unused imports: removed automatically
- Unused variables: flagged and removed
- Circular imports: restructured to eliminate cycles
- Duplicate imports: deduplicated

## Generation Validation

Before code is committed, it passes through a validation pipeline:

### Stage 1: Compilation Check

- TypeScript: tsc --noEmit - zero errors
- Java: mvn compile - zero errors
- Python: python -m py_compile - zero syntax errors

### Stage 2: Lint Check

- ESLint / TSLint: zero warnings at error level, max N warnings at warning level
- Prettier: formatting must be consistent
- EditorConfig: file must comply with project editor settings

### Stage 3: Test Check

- New tests must pass (if test generation was part of task)
- Existing tests in affected module must still pass
- Coverage on new code must meet threshold (default 80%)

### Stage 4: Structure Check

- File placement follows project conventions
- No duplicate files created
- No orphaned files (unreferenced exports)

### Validation Failure Handling

| Failure | Action |
|---------|--------|
| Compilation error | Regenerate with corrected syntax, max 3 retries |
| Lint error | Auto-fix if possible, regenerate if not |
| Test failure | Analyze failure, fix generated code, re-validate |
| Structure violation | Reorganize files and re-verify |

If validation fails after max retries, the task is escalated for human review with a detailed failure report.
