# Deliverable Validation

## Purpose

Validates that development deliverables (code, tests, docs) match the requirements specified in the context pack.

## Validation Rules

### 1. All Required Documents Loaded

| Document Type | Validation | Severity |
|--------------|------------|----------|
| Context Pack | Present and current version | Critical |
| Domain Specification | Present and current version | Critical |
| API Specification | OpenAPI spec present | Critical |
| Entity Definitions | Present in domain docs | High |
| Business Rules | Present in domain docs | High |
| Test Plan | Present | Medium |

**Check**: Verify every document listed in the context pack's document section exists in the deliverable.

### 2. All Acceptance Criteria Addressed

Each AC from the context pack must map to at least one test:

| AC Pattern | Must Map To | Example |
|-----------|------------|---------|
| AC-COMP-001 | Integration test | `test_create_customer()` |
| AC-COMP-002 | Unit test | `test_sales_order_total()` |
| AC-COMP-003 | E2E test | `test_complete_order_flow()` |
| AC-COMP-004 | Validation test | `test_mandatory_fields()` |

**Check**: Parse context pack for all AC-XXX patterns, verify each has a corresponding test.

### 3. All Entities Implemented

Every entity defined in the context pack data model must exist in the codebase:

| Entity Check | Rule |
|-------------|------|
| Entity class/model | Must exist in backend code |
| Entity properties | Must match defined fields (name, type) |
| Entity relationships | Must match FK definitions |
| Entity validation | Must implement domain rules |

**Check**: Extract entity list from context pack, verify each in the codebase.

### 4. All Endpoints Created

Every API endpoint defined in the context pack must exist:

| Endpoint Check | Rule |
|---------------|------|
| Route | Must match defined path exactly |
| Method | Must match (GET, POST, PUT, DELETE) |
| Request body | Must match defined schema |
| Response body | Must match defined schema |
| Error codes | Must match defined error responses |

**Check**: Extract endpoint list from OpenAPI spec, verify each implemented.

## Validation Report Format

```
Deliverable Validation Report
==============================
Domain: [Domain Name]
Pack Version: [Version]

1. Document Load: [PASS/FAIL] ([X]/[Y] documents loaded)
2. AC Coverage: [PASS/FAIL] ([X]/[Y] ACs covered)
3. Entity Coverage: [PASS/FAIL] ([X]/[Y] entities implemented)
4. Endpoint Coverage: [PASS/FAIL] ([X]/[Y] endpoints created)

Overall: [PASS/FAIL]
Coverage: [XX]%
```

## Pass Thresholds

| Metric | Minimum |
|--------|---------|
| Document Load | 100% |
| AC Coverage | 90% |
| Entity Coverage | 100% |
| Endpoint Coverage | 100% |
| **Overall** | **95%** |
