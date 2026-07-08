# Context Pack: HR Employee Management

**Pack ID:** CP-HR-Employee
**Version:** 1.0
**Domain:** HR
**Sprint:** 019

## Contents

### Required Documents
| # | Document | Source | Agent |
|---|----------|--------|-------|
| 1 | Business Overview | `../02-DOMAIN-DOCS/09-HR/HR-Overview.md` | Business Analyst AI |
| 2 | Business Capabilities | `../02-DOMAIN-DOCS/09-HR/Employee-Management.md` | Business Analyst AI |
| 3 | Workflows | `../03-WORKFLOWS/HR-Flows.md` | Solution Architect AI |
| 4 | Business Rules | `../01-BUSINESS-RULES/HR-Rules.md` | Backend Lead AI |
| 5 | Organization Structure | `../02-DOMAIN-DOCS/09-HR/Organization-Structure.md` | Solution Architect AI |
| 6 | Employee Self-Service | `../02-DOMAIN-DOCS/09-HR/Employee-Self-Service.md` | Frontend Lead AI |
| 7 | HR Reporting | `../02-DOMAIN-DOCS/09-HR/HR-Reporting.md` | Business Analyst AI |
| 8 | API Design Guide | `../04-STANDARDS/API-Design-Guide.md` | Backend Lead AI |
| 9 | Data Modeling | `../04-STANDARDS/Data-Modeling.md` | Database Architect AI |
| 10 | Security Standards | `../04-STANDARDS/Security-Standards.md` | Security AI |

### Required Schema
| Entity | Table | Fields | Agent |
|--------|-------|--------|-------|
| Employee | `hr_employees` | id, user_id, employee_number, first_name, last_name, email, phone, department_id, position_id, hire_date, status, manager_id | Database Architect AI |
| EmploymentDetail | `hr_employment_details` | id, employee_id, contract_type, start_date, end_date, probation_end, salary, tax_id, bank_info | Database Architect AI |
| Department | `hr_departments` | id, name, code, division_id, manager_id, parent_id, is_active | Database Architect AI |
| Division | `hr_divisions` | id, name, code, head_id, is_active | Database Architect AI |
| Position | `hr_positions` | id, title, code, grade, department_id, job_description, requirements | Database Architect AI |
| OrgUnit | `hr_org_units` | id, name, type, parent_id, head_id, is_active | Database Architect AI |
| EmployeeDocument | `hr_employee_documents` | id, employee_id, document_type, file_url, uploaded_by, uploaded_at, expiry_date | Database Architect AI |
| EmployeeContact | `hr_employee_contacts` | id, employee_id, contact_type, value, is_emergency, notes | Database Architect AI |
| EmployeeEducation | `hr_employee_education` | id, employee_id, institution, degree, field, start_date, end_date, grade | Database Architect AI |
| EmployeeCertification | `hr_employee_certifications` | id, employee_id, name, issuing_body, certificate_number, issue_date, expiry_date | Database Architect AI |

### Required APIs
| Endpoint | Method | Purpose | Agent |
|----------|--------|---------|-------|
| `/api/hr/employees` | GET/POST | Employee list and create | Backend Lead AI |
| `/api/hr/employees/{id}` | GET/PUT/DELETE | Employee detail | Backend Lead AI |
| `/api/hr/employees/{id}/employment` | GET/PUT | Employment details | Backend Lead AI |
| `/api/hr/employees/{id}/contacts` | GET/POST/PUT | Contacts | Backend Lead AI |
| `/api/hr/employees/{id}/education` | GET/POST | Education records | Backend Lead AI |
| `/api/hr/employees/{id}/certifications` | GET/POST | Certifications | Backend Lead AI |
| `/api/hr/employees/{id}/documents` | GET/POST | Documents | Backend Lead AI |
| `/api/hr/employees/search` | GET | Search employees | Backend Lead AI |
| `/api/hr/departments` | GET/POST | Department management | Backend Lead AI |
| `/api/hr/departments/{id}` | GET/PUT/DELETE | Department detail | Backend Lead AI |
| `/api/hr/divisions` | GET/POST | Division management | Backend Lead AI |
| `/api/hr/positions` | GET/POST | Position management | Backend Lead AI |
| `/api/hr/org-chart` | GET | Organization chart data | Backend Lead AI |
| `/api/hr/reports/headcount` | GET | Headcount report | Backend Lead AI |

### Required Screens
| Route | Purpose | Agent |
|-------|---------|-------|
| `/hr/employees` | Employee directory | Frontend Lead AI |
| `/hr/employees/new` | Create employee record | Frontend Lead AI |
| `/hr/employees/{id}` | Employee profile | Frontend Lead AI |
| `/hr/employees/{id}/edit` | Edit employee | Frontend Lead AI |
| `/hr/employees/{id}/employment` | Employment details | Frontend Lead AI |
| `/hr/employees/{id}/education` | Education records | Frontend Lead AI |
| `/hr/employees/{id}/certifications` | Certifications | Frontend Lead AI |
| `/hr/employees/{id}/documents` | Document repository | Frontend Lead AI |
| `/hr/departments` | Department list | Frontend Lead AI |
| `/hr/departments/new` | Create department | Frontend Lead AI |
| `/hr/departments/{id}` | Department detail | Frontend Lead AI |
| `/hr/divisions` | Division management | Frontend Lead AI |
| `/hr/positions` | Position management | Frontend Lead AI |
| `/hr/org-chart` | Interactive org chart | Frontend Lead AI |
| `/hr/reports` | HR reports dashboard | Frontend Lead AI |

### Dependencies
- CP-Authentication

### Output Checklist
- [ ] Backend module with 14+ endpoints
- [ ] Frontend pages with 15+ components
- [ ] Database migration (10 tables)
- [ ] Unit tests (55 minimum)
- [ ] Integration tests
- [ ] API documentation
- [ ] Screen documentation

### Estimated Metrics
- **Backend files:** 12
- **Frontend files:** 18
- **Test files:** 22
- **Document files:** 4
- **Total sprint effort:** 20 days
