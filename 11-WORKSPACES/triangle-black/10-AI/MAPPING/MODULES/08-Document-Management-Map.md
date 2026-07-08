# Document Management Module Map

## Scope
Document library with folder organization, version control, document approval workflows, template management and generation, access control and sharing, retention policies and archival.

## Sub-Modules
| Module | Capabilities | Lines of Docs |
|--------|-------------|---------------|
| Document Library | 6 | 250 |
| Version Control | 4 | 180 |
| Document Approval | 5 | 230 |
| Document Templates | 4 | 170 |
| Access Control | 5 | 200 |
| Retention & Archival | 4 | 160 |

## Documents Consumed (from Program 1)
- `02-DOMAINS/08-Document-Management-Domain.md` — Full document management domain spec
- `03-FEATURES/22-Document-Management.md` — Document management feature spec
- `03-FEATURES/23-Document-Approval.md` — Document approval feature spec

## Documents Produced (to Program 3)
| Artifact | Type | Estimated Count |
|----------|------|----------------|
| Backend modules | NestJS modules | 6 |
| Frontend pages | Next.js pages | 14 |
| Database tables | Prisma models | 12 |
| API endpoints | REST routes | 36 |
| Test files | spec/test files | 42 |

## Key Entities
| Entity | Table | Description |
|--------|-------|-------------|
| Document | Document | Document record with metadata |
| DocumentFolder | DocumentFolder | Hierarchical folder structure |
| DocumentVersion | DocumentVersion | Versioned document content |
| DocumentApproval | DocumentApproval | Approval workflow instance |
| DocumentTemplate | DocumentTemplate | Document generation template |
| DocumentPermission | DocumentPermission | Access control entry |
| RetentionPolicy | RetentionPolicy | Retention rules |
| ArchiveRecord | ArchiveRecord | Archived document record |

## Key APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /documents | GET/POST | List and upload documents |
| /documents/:id | GET/PUT | Read and update document |
| /documents/:id/versions | GET/POST | List and create versions |
| /documents/:id/versions/compare | GET | Compare document versions |
| /documents/approvals | GET/POST | List and create approvals |
| /documents/approvals/:id/approve | POST | Approve document |
| /documents/approvals/:id/reject | POST | Reject document |
| /documents/templates | GET/POST | List and create templates |
| /documents/templates/:id/generate | POST | Generate document from template |
| /documents/permissions | GET/POST | Manage permissions |
| /documents/archive | GET/POST | List and archive documents |
| /documents/retention-policies | GET/POST | Manage retention policies |

## Key Screens
| Route | Components | Purpose |
|-------|-----------|---------|
| /documents | DocumentLibraryView, FolderTreeView | Document library |
| /documents/:id | DocumentDetail, VersionHistoryView | Document detail and versions |
| /documents/approvals | ApprovalListView, ApprovalDetailView | Document approvals |
| /documents/templates | TemplateList, TemplateEditor | Template management |
| /documents/permissions | PermissionForm, AccessControlView | Access control |
| /documents/archive | ArchiveListView, RetentionPolicyForm | Retention and archival |

## AI Agents Involved
| Agent | Responsibility |
|-------|---------------|
| DocumentClassificationAI | Auto-classify uploaded documents |
| SmartSearchAI | Semantic document search |
| VersionDiffAI | Highlight version differences |
| ApprovalRoutingAI | Smart approval routing |
| SmartTemplateAI | Intelligent template suggestions |
| AnomalousAccessDetectionAI | Detect unusual access patterns |
| RetentionClassificationAI | Classify documents for retention |

## Estimated Sprint Allocation: 3 sprints

## Dependencies
- Shared Kernel — Strong (base entities, enums)
- All domains — Weak (documents attached to entities)

## Quality Gates
- ESLint — Automated linting
- Jest — Unit test coverage ≥ 80%
- Playwright — E2E for upload→approve flow
- Prisma — Schema validation
- OWASP — Security scanning (document access)
