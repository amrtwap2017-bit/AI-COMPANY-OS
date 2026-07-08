# Backend Development Tasks

## Overview

Backend development tasks cover server-side logic, API layers, service implementation, data processing, and system integration. These tasks are typically assigned to backend-specialized AI agents or backend engineers.

---

## 1. Implement Endpoint

Create a new API endpoint following REST, GraphQL, or gRPC conventions.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Expose a server-side operation to clients via a well-defined API contract. |
| **Inputs**      | API specification (OpenAPI schema), route path and HTTP method, request/response schema, authentication and authorization requirements, error response specifications. |
| **Outputs**     | Route handler, request parsing and validation, response serialization, HTTP status code mapping, OpenAPI operation implementation. |
| **Quality Gates**| Contract tests verify request/response alignment with spec, all defined error codes are implemented, authentication is enforced, rate limiting is applied, request tracing (X-Request-ID) is supported. |
| **Effort Range**| 2–4 hours for a standard CRUD endpoint; 4–8 hours for complex business logic endpoints. |

---

## 2. Create Service

Implement a service layer class or function encapsulating domain business logic.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Centralize business rules, orchestrate data access, and provide a clean API for the controller layer. |
| **Inputs**      | Story acceptance criteria, data model, repository interfaces, existing service patterns, validation rules. |
| **Outputs**     | Service implementation with all required methods, input validation, error handling, audit logging integration, unit tests. |
| **Quality Gates**| Service unit test coverage ≥80%, input validation rejects invalid data, error handling covers all documented scenarios, service methods are idempotent where required by spec. |
| **Effort Range**| 3–6 hours per service. |

---

## 3. Write Business Logic

Implement specific business rules, calculations, workflows, or decision trees.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Translate business requirements into executable logic with correct, testable behavior. |
| **Inputs**      | Business rules documentation, decision matrices, calculation formulas, workflow diagrams, example inputs/outputs. |
| **Outputs**     | Business logic functions, conditional branching, state transitions, aggregation/mapping logic, unit tests. |
| **Quality Gates**| Logic produces correct results for all documented inputs, edge cases are handled, performance is acceptable for expected volume, logic is testable in isolation. |
| **Effort Range**| 2–6 hours depending on rule complexity. |

---

## 4. Add Validation

Implement input validation for API requests, service inputs, or data ingestion.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Prevent invalid, malformed, or malicious data from entering the system. |
| **Inputs**      | Validation rules per field (type, format, range, required, uniqueness), error message standards, localization requirements. |
| **Outputs**     | Validation functions or middleware, field-level error messages, validation error responses, client feedback mechanisms. |
| **Quality Gates**| All defined validation rules are enforced, error messages are user-friendly and localized, injection attacks are prevented, validation does not degrade response time beyond SLA. |
| **Effort Range**| 1–3 hours per endpoint or service method. |

---

## 5. Implement Event Handler

Create or modify an event-driven handler for domain events, message queues, or streaming data.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Process asynchronous events for decoupled, scalable system interactions. |
| **Inputs**      | Event schema specification, event routing configuration, handler processing requirements, idempotency requirements, error handling and retry policy. |
| **Outputs**     | Event handler implementation, event deserialization, processing logic, acknowledgment or error publishing, dead-letter queue handling, idempotency key management. |
| **Quality Gates**| Handler processes events within SLA, idempotency prevents duplicate processing, error events are routed to DLQ, handler recovers from failures, processing is logged with correlation IDs. |
| **Effort Range**| 3–6 hours per handler. |

---

## 6. Create DTO

Define Data Transfer Objects for request and response payloads.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Define typed, validated data structures for API communication and internal service boundaries. |
| **Inputs**      | API specification, field definitions, data types, validation constraints, serialization format requirements. |
| **Outputs**     | DTO class/struct definitions, serialization annotations, validation decorators, mapping functions between DTOs and domain models. |
| **Quality Gates**| DTOs serialize/deserialize correctly, validation annotations match spec, mapping covers all fields, backward compatibility is maintained for existing contracts. |
| **Effort Range**| 1–2 hours per DTO set. |

---

## 7. Implement Repository

Create or extend a data access repository/factory for database operations.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Abstract database access behind an interface, providing CRUD operations, query methods, and transaction support. |
| **Inputs**      | Data model definitions, query requirements, pagination specifications, transaction boundaries, existing repository patterns. |
| **Outputs**     | Repository interface and implementation, query methods with filtering/pagination, transaction management, error translation (database errors to application errors), unit/integration tests. |
| **Quality Gates**| All CRUD operations work correctly, complex queries are optimized (no N+1), transactions roll back on failure, error handling covers connection failures and constraint violations. |
| **Effort Range**| 2–4 hours per repository. |

---

## 8. Implement Middleware

Create or modify request processing middleware for cross-cutting concerns.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Implement cross-cutting concerns such as authentication, authorization, logging, rate limiting, request tracing, or error handling at the middleware layer. |
| **Inputs**      | Middleware specifications, configuration parameters, integration points with existing middleware chain. |
| **Outputs**     | Middleware implementation, configuration, middleware registration in the pipeline, unit/integration tests. |
| **Quality Gates**| Middleware executes in correct order, performance overhead is within acceptable bounds (≤5ms per request), error propagation is correct, middleware is configurable via standard configuration mechanism. |
| **Effort Range**| 2–4 hours per middleware component. |
