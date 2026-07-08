# Context Pack: Contract Management

**Pack ID:** CP-CRM-Contracts
**Version:** 1.0
**Domain:** Commercial
**Sprint:** 005

## Contents

### Required Documents
| # | Document | Source | Agent |
|---|----------|--------|-------|
| 1 | Business Overview | `../02-DOMAIN-DOCS/01-Commercial/CRM-Overview.md` | Business Analyst AI |
| 2 | Business Capabilities | `../02-DOMAIN-DOCS/01-Commercial/Contract-Management.md` | Business Analyst AI |
| 3 | Workflows | `../03-WORKFLOWS/Contract-Flows.md` | Solution Architect AI |
| 4 | Business Rules | `../01-BUSINESS-RULES/Contract-Rules.md` | Backend Lead AI |
| 5 | Contract Lifecycle | `../02-DOMAIN-DOCS/01-Commercial/Contract-Lifecycle.md` | Solution Architect AI |
| 6 | Approval Workflows | `../02-DOMAIN-DOCS/01-Commercial/Approval-Workflows.md` | Solution Architect AI |
| 7 | E-Signature | `../02-DOMAIN-DOCS/01-Commercial/E-Signature.md` | Integration AI |
| 8 | API Design Guide | `../04-STANDARDS/API-Design-Guide.md` | Backend Lead AI |
| 9 | Coding Standards | `../04-STANDARDS/Coding-Standards.md` | All Agents |
| 10 | UI Patterns | `../04-STANDARDS/UI-Patterns.md` | Frontend Lead AI |
| 11 | Data Modeling | `../04-STANDARDS/Data-Modeling.md` | Database Architect AI |
| 12 | Integration Standards | `../04-STANDARDS/Integration-Standards.md` | Integration AI |

### Required Schema
| Entity | Table | Fields | Agent |
|--------|-------|--------|-------|
| Contract | `crm_contracts` | id, quotation_id, contract_number, name, type, status, start_date, end_date, total_value, signed_date, activated_date, created_at | Database Architect AI |
| ContractTemplate | `crm_contract_templates` | id, name, type, content, version, is_active | Database Architect AI |
| ContractClause | `crm_contract_clauses` | id, template_id, title, content, is_required, sort_order | Database Architect AI |
| ContractVersion | `crm_contract_versions` | id, contract_id, version_number, data, created_by, created_at | Database Architect AI |
| ContractApproval | `crm_contract_approvals` | id, contract_id, approver_id, status, comments, decided_at, created_at | Database Architect AI |
| ContractSignature | `crm_contract_signatures` | id, contract_id, signatory_id, signed_at, signature_data, ip_address | Database Architect AI |
| ContractMilestone | `crm_contract_milestones` | id, contract_id, name, description, due_date, amount, status, completed_at | Database Architect AI |
| ContractAmendment | `crm_contract_amendments` | id, contract_id, amendment_number, reason, changes, approved_by, effective_date | Database Architect AI |

### Required APIs
| Endpoint | Method | Purpose | Agent |
|----------|--------|---------|-------|
| `/api/contracts` | GET/POST | List and create contracts | Backend Lead AI |
| `/api/contracts/{id}` | GET/PUT/DELETE | Contract detail | Backend Lead AI |
| `/api/contracts/{id}/versions` | GET/POST | Version management | Backend Lead AI |
| `/api/contracts/{id}/versions/{vId}` | GET | Version detail | Backend Lead AI |
| `/api/contracts/{id}/approve` | POST | Submit for approval | Backend Lead AI |
| `/api/contracts/{id}/approve/action` | POST | Approve/reject | Backend Lead AI |
| `/api/contracts/{id}/sign` | POST | Request signature | Backend Lead AI |
| `/api/contracts/{id}/sign/status` | GET | Signature status | Backend Lead AI |
| `/api/contracts/{id}/activate` | POST | Activate contract | Backend Lead AI |
| `/api/contracts/{id}/amend` | POST | Create amendment | Backend Lead AI |
| `/api/contracts/templates` | GET/POST | Template management | Backend Lead AI |
| `/api/contracts/clauses` | GET/POST | Clause library | Backend Lead AI |
| `/api/contracts/{id}/milestones` | GET/POST | Milestone tracking | Backend Lead AI |

### Required Screens
| Route | Purpose | Agent |
|-------|---------|-------|
| `/contracts` | Contract list with status filters | Frontend Lead AI |
| `/contracts/new` | Create contract from quotation | Frontend Lead AI |
| `/contracts/{id}` | Contract detail with clauses | Frontend Lead AI |
| `/contracts/{id}/edit` | Edit contract | Frontend Lead AI |
| `/contracts/{id}/approvals` | Approval workflow view | Frontend Lead AI |
| `/contracts/{id}/sign` | Signature request and status | Frontend Lead AI |
| `/contracts/templates` | Template library | Frontend Lead AI |
| `/contracts/templates/new` | Create template | Frontend Lead AI |
| `/contracts/clauses` | Clause library | Frontend Lead AI |
| `/contracts/{id}/milestones` | Milestone tracking | Frontend Lead AI |

### Dependencies
- CP-CRM-Quotations

### Output Checklist
- [ ] Backend module with 13+ endpoints
- [ ] Frontend pages with 10+ components
- [ ] Database migration (8 tables)
- [ ] Unit tests (60 minimum)
- [ ] Integration tests
- [ ] API documentation
- [ ] Screen documentation

### Estimated Metrics
- **Backend files:** 12
- **Frontend files:** 14
- **Test files:** 22
- **Document files:** 4
- **Total sprint effort:** 22 days
