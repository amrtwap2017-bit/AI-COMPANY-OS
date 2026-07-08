# Module Architecture

## Overview

NestJS modular monolith with strict module boundaries. Each module owns its domain logic, controllers, services, DTOs, and route definitions.

## Module Dependency Graph

```
                    ┌──────────────┐
                    │    Auth      │
                    │  (no deps)   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Prisma      │
                    │ (shared)     │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼────┐ ┌────▼────┐ ┌─────▼──────┐
       │   CRM     │ │  Admin  │ │Documents   │
       │           │ │         │ │(shared)    │
       └──────┬────┘ └─────────┘ └─────┬──────┘
              │                        │
       ┌──────▼────┐                   │
       │Quotations │                   │
       │           │                   │
       └──────┬────┘                   │
              │                        │
       ┌──────▼────┐                   │
       │  Projects │                   │
       │           │                   │
       └──────┬────┘                   │
              │                        │
       ┌──────▼──────┐                 │
       │ Client      │                 │
       │ Portal      │◄────────────────┘
       └──────┬──────┘
              │
       ┌──────▼────────┐
       │  Executive    │
       │  Dashboard    │
       └───────────────┘
```

## Module Responsibilities

| Module | Controllers | Services | Entities |
|--------|-------------|---------|----------|
| Auth | login, register, refresh, logout, me | AuthService, JwtService, RefreshTokenService | User (partial) |
| CRM | LeadsController, OpportunitiesController, CompaniesController, ContactsController, ActivitiesController | LeadService, OpportunityService, CompanyService, ContactService, ActivityService, PipelineService | Lead, Opportunity, Company, Contact, Activity |
| Quotations | RfqController, QuotationController, ContractController | RfqService, QuotationService, ContractService | RFQ, Quotation, QuotationLineItem, Contract |
| Projects | ProjectController, MilestoneController, FileController, SurveyController, AssessmentController | ProjectService, MilestoneService, FileService, SurveyService, AssessmentService | Project, Milestone, ProjectFile, Survey, Assessment |
| Portal | ServiceRequestController, CompanyProfileController | ServiceRequestService, PortalService | ServiceRequest, PortalUser |
| Admin | UserController, RoleController, AuditLogController, TenantController | UserService, RoleService, AuditService, TenantService | User, AuditLog, Tenant |
| Notifications | NotificationController | NotificationService | Notification |
| Documents | DocumentController | DocumentService | Document |
| Executive | DashboardController | DashboardService | — (aggregates) |
| Reports | ReportController | ReportService | — (aggregates) |

## Cross-Cutting Concerns

| Concern | Implementation |
|---------|---------------|
| Authentication | JwtAuthGuard, @CurrentUser decorator |
| Authorization | RolesGuard, @Roles decorator |
| Audit | AuditInterceptor |
| Logging | LoggerModule (Winston) |
| Validation | ValidationPipe (class-validator) |
| Rate Limiting | ThrottlerModule |
| CORS | NestJS CORS configuration |
| Health Checks | Terminus health endpoint |
| Swagger | @nestjs/swagger integration |
