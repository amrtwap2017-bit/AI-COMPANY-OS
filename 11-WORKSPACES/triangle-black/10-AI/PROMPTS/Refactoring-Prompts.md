# Refactoring Prompts — Enterprise AI Delivery Framework

> **Framework:** AI Constitution v1.0
> **Model Requirement:** All prompts are model-agnostic.
> **Context Injection Point:** `[INSERT DOMAIN CONTEXT — business glossary, system architecture, organizational chart]`
> **Output Format:** Each refactoring produces changed files + summary of changes with traceability.

---

## 1. Improve Code Quality

**Prompt:**
```
You are acting as a Senior Developer operating under the AI Constitution.
Refactor the following code to improve code quality:

Source File(s): [INSERT FILE PATHS]
Issue Description: [INSERT — e.g., "complex conditional logic in OrderProcessor.process()"]
Related User Story / Tech Debt: [INSERT US-XXX / TECHDEBT-XXX]

Quality Goals:
- Improve readability — use meaningful names, extract intent-revealing functions
- Reduce duplication — DRY principle; extract shared logic
- Improve testability — break dependencies, use dependency injection
- Follow SOLID principles:
  - Single Responsibility: each class/method has one reason to change
  - Open/Closed: open for extension, closed for modification
  - Liskov Substitution: subtypes behave correctly
  - Interface Segregation: small, focused interfaces
  - Dependency Inversion: depend on abstractions, not concretions

Constraints:
- Maintain backward compatibility of public APIs
- Do not change external behavior or business logic
- Update existing tests to match refactored structure
- Add tests for newly extracted units
- Run lint and type-check after refactoring

Output Format:
- Summary of changes made
- Before/after comparison for key sections
- Updated file paths
- Test updates
- Traceability to [US-XXX] / [TECHDEBT-XXX]

Governance Reference (AI Constitution):
- Article II: Quality — continuous improvement of code quality is mandated
```

## 2. Reduce Complexity

**Prompt:**
```
You are acting as a Senior Developer operating under the AI Constitution.
Reduce the cyclomatic complexity of the following code:

Source File(s): [INSERT FILE PATHS]
Current Complexity Score: [INSERT — e.g., "Cyclomatic complexity: 45 (threshold: 15)"]
Related Metric: [INSERT LINK TO SONARQUBE / CODE QUALITY DASHBOARD]

Approach:
1. **Extract Methods** — Break large methods into smaller, focused ones (max 15 lines per method)
2. **Simplify Conditionals** — Replace nested conditionals with guard clauses, polymorphism, or strategy pattern
3. **Reduce Nesting** — Maximum nesting depth of 3; extract nested blocks
4. **Eliminate Switch Statements** — Replace with polymorphism, lookup tables, or command pattern where appropriate
5. **Decompose Complex Expressions** — Extract boolean expressions into well-named variables

Constraints:
- All existing tests must pass after refactoring
- Do not change the public interface
- Add unit tests for extracted methods
- Keep the code focused — one refactoring per PR if the change is large

Measurement:
- Target: Reduce complexity below [X]
- Verify with [INSERT STATIC ANALYSIS TOOL]

Output Format:
- Complexity before/after metrics
- Extracted methods and their responsibilities
- Updated file paths
- Traceability to technical debt item

Governance Reference (AI Constitution):
- Article II: Quality — complexity must be managed; maintainable code is a quality goal
```

## 3. Extract Service

**Prompt:**
```
You are acting as a Backend Developer operating under the AI Constitution.
Extract a new service from the existing codebase:

Source File(s): [INSERT FILE PATHS]
Responsibility to Extract: [INSERT — e.g., "payment processing logic from OrderService"]
Reason: [INSERT — e.g., "OrderService violates Single Responsibility Principle with 2000+ lines"]
Related ADR: [INSERT ADR-XXX — if applicable]

Extraction Plan:
1. Identify the cohesive set of operations to extract
2. Define the service interface (public methods, input/output types)
3. Create the new service class with extracted logic
4. Update dependency injection container to register the new service
5. Replace calls in the original class with delegation to new service
6. Write unit tests for the new service
7. Verify existing integration tests pass

Interface Design:
```typescript
interface [NewServiceName] {
    [method1(param: Type): ReturnType];
    [method2(param: Type): ReturnType];
}
```

Constraints:
- Do not change the external API contract
- Keep the extracted service stateless where possible
- Use constructor injection for dependencies
- Ensure the original service does not have cyclic dependency on the new service

Output Format:
- New service file(s)
- Modified file(s) with inline replacement
- Updated DI registration
- Unit tests for new service
- Traceability to [US-XXX] / [REFACTOR-XXX]

Governance Reference (AI Constitution):
- Article II: Quality — modular, maintainable architecture
- Article IV: Traceability — change linked to requirement or tech debt item
```

## 4. Optimize Query

**Prompt:**
```
You are acting as a Database Developer operating under the AI Constitution.
Optimize the following database query:

Query / Location: [INSERT SQL QUERY OR ORM CODE LOCATION]
Performance Issue: [INSERT — e.g., "full table scan on orders(5M rows)", "N+1: 100+ queries per request"]
Current Execution Time: [INSERT — e.g., "p95: 2.3s"]
Target Execution Time: [INSERT — e.g., "p95: <200ms"]
Related User Story: [INSERT US-XXX]

Optimization Techniques (apply as appropriate):
1. **Indexing** — Analyze query plan; add missing indexes
2. **Query Restructuring** — Rewrite suboptimal joins, subqueries, or OR conditions
3. **Pagination** — Implement keyset/cursor pagination instead of offset
4. **Denormalization** — Consider denormalization for read-heavy patterns
5. **Materialized Views** — Pre-compute expensive aggregations
6. **Caching** — Add Redis/memcached layer for frequently accessed data
7. **Batch Processing** — Reduce round trips with batch operations

Constraints:
- Measure and document before/after query plans
- Do not introduce data inconsistency or race conditions
- Validate no regression on write operations
- Consider index maintenance overhead

Output Format:
- Optimized query / ORM code
- EXPLAIN ANALYZE before and after
- New index creation script (if applicable)
- Performance comparison table
- Traceability to [US-XXX]

Governance Reference (AI Constitution):
- Article II: Quality — performance is a defined quality attribute
- Article IV: Traceability — optimization linked to requirement
```

## 5. Improve Test Coverage

**Prompt:**
```
You are acting as a QA Developer operating under the AI Constitution.
Improve test coverage for the following code:

Source File(s): [INSERT FILE PATHS]
Current Coverage: [INSERT — e.g., "lines: 45%, branches: 30%"]
Target Coverage: [INSERT — e.g., "lines: 85%, branches: 75%"]
Coverage Report: [INSERT LINK TO COVERAGE REPORT]

Analysis:
1. Identify uncovered lines and branches from the coverage report
2. Categorize untested scenarios: happy path, error path, edge cases
3. Check existing test file(s): [INSERT PATHS]
4. Identify missing test cases for:
   - Error handling (exceptions, error responses)
   - Edge cases (empty input, boundary values, null, undefined)
   - Business logic branches (if/else, switch, ternary)
   - Async behavior (callbacks, promises, race conditions)

Implementation:
- Add unit tests for uncovered functions and methods
- Add integration tests for uncovered API paths
- Parameterize tests to cover multiple input combinations
- Use test coverage tool to verify improvement

Constraints:
- Do not delete or modify existing tests unless they are incorrect
- Follow existing test patterns in the project
- Use project test utilities and fixtures

Output Format:
- Updated test file(s)
- Coverage before/after metrics
- Summary of added test scenarios
- Traceability to [US-XXX] / [TEST-XXX]

Governance Reference (AI Constitution):
- Article II: Quality — adequate test coverage is a quality gate
- Article V: Risk Management — untested code is a risk
```

## 6. Migrate Pattern

**Prompt:**
```
You are acting as a Technical Lead operating under the AI Constitution.
Migrate the following code from the [old] pattern to the [new] pattern:

Source File(s): [INSERT FILE PATHS]
Old Pattern: [INSERT — e.g., "class-based React components"]
New Pattern: [INSERT — e.g., "functional components with hooks"]
Related ADR: [INSERT ADR-XXX]
Scope: [INSERT — e.g., "all components in the /pages/admin directory"]

Migration Plan:
1. Audit all files in scope to identify pattern usage
2. Create a migration checklist for each file
3. Convert each file individually, verifying tests pass after each conversion
4. Remove old pattern dependencies from package.json (if applicable)
5. Update documentation and examples

Conversion Rules:
- [Insert specific conversion rules for the pattern change]
- Example: State → useState / useReducer
- Example: Lifecycle methods → useEffect
- Example: PropTypes → TypeScript interfaces
- Example: Redux connect() → useSelector / useDispatch

Constraints:
- One file at a time; no bulk changes across multiple files
- Maintain the same behavior and UI output
- Update all corresponding tests
- Do not mix concerns — pure migration without feature changes
- Each file change should be in a separate commit for traceability

Output Format:
- List of converted files with status (done / pending)
- Summary of pattern differences encountered
- Any deviations or workarounds needed
- Updated dependency list
- Traceability to [ADR-XXX] and [REFACTOR-XXX]

Governance Reference (AI Constitution):
- Article II: Quality — pattern consistency improves maintainability
- Article IV: Traceability — migration tracks to architecture decision
```
