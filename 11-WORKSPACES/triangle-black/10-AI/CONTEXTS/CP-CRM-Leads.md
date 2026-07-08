# Context Pack: Lead Management

**Pack ID:** CP-CRM-Leads
**Version:** 1.0
**Domain:** Commercial
**Sprint:** 001, 003

## Contents

### Required Documents
| # | Document | Source | Agent |
|---|----------|--------|-------|
| 1 | Business Overview | `../02-DOMAIN-DOCS/01-Commercial/CRM-Overview.md` | Business Analyst AI |
| 2 | Business Capabilities | `../02-DOMAIN-DOCS/01-Commercial/Lead-Management.md` | Business Analyst AI |
| 3 | Workflows | `../03-WORKFLOWS/Lead-Management-Flows.md` | Solution Architect AI |
| 4 | Business Rules | `../01-BUSINESS-RULES/Lead-Scoring-Rules.md` | Backend Lead AI |
| 5 | Sales Process | `../02-DOMAIN-DOCS/01-Commercial/Sales-Process.md` | Business Analyst AI |
| 6 | API Design Guide | `../04-STANDARDS/API-Design-Guide.md` | Backend Lead AI |
| 7 | Coding Standards | `../04-STANDARDS/Coding-Standards.md` | All Agents |
| 8 | UI Patterns | `../04-STANDARDS/UI-Patterns.md` | Frontend Lead AI |
| 9 | Data Modeling | `../04-STANDARDS/Data-Modeling.md` | Database Architect AI |
| 10 | Site Surveys | `../02-DOMAIN-DOCS/01-Commercial/Site-Surveys.md` | Backend Lead AI |

### Required Schema
| Entity | Table | Fields | Agent |
|--------|-------|--------|-------|
| Lead | `crm_leads` | id, company_id, contact_id, source, status, score, assigned_to, notes, created_at, updated_at | Database Architect AI |
| LeadScore | `crm_lead_scores` | id, lead_id, score, criteria, details, scored_at | Database Architect AI |
| LeadSource | `crm_lead_sources` | id, name, code, is_active | Database Architect AI |
| LeadStatus | `crm_lead_statuses` | id, name, code, sequence, is_active | Database Architect AI |
| Campaign | `crm_campaigns` | id, name, type, start_date, end_date, budget, status | Database Architect AI |
| Contact | `crm_contacts` | id, first_name, last_name, email, phone, company_id, position | Database Architect AI |
| Company | `crm_companies` | id, name, industry, size, website, phone, address, status | Database Architect AI |
| SiteSurvey | `crm_site_surveys` | id, lead_id, scheduled_date, completed_date, status, notes | Database Architect AI |
| SurveyResponse | `crm_survey_responses` | id, survey_id, question_id, response, attachment_url | Database Architect AI |

### Required APIs
| Endpoint | Method | Purpose | Agent |
|----------|--------|---------|-------|
| `/api/leads` | GET/POST | List and create leads | Backend Lead AI |
| `/api/leads/{id}` | GET/PUT/DELETE | Lead detail CRUD | Backend Lead AI |
| `/api/leads/{id}/score` | POST | Trigger lead scoring | Backend Lead AI |
| `/api/leads/{id}/qualify` | POST | Qualify/disqualify lead | Backend Lead AI |
| `/api/leads/search` | GET | Search leads by criteria | Backend Lead AI |
| `/api/leads/import` | POST | Bulk import leads | Backend Lead AI |
| `/api/campaigns` | GET/POST | Campaign CRUD | Backend Lead AI |
| `/api/contacts` | GET/POST | Contact management | Backend Lead AI |
| `/api/contacts/{id}` | GET/PUT/DELETE | Contact detail | Backend Lead AI |
| `/api/companies` | GET/POST | Company management | Backend Lead AI |
| `/api/companies/{id}` | GET/PUT/DELETE | Company detail | Backend Lead AI |
| `/api/surveys` | GET/POST | Site survey management | Backend Lead AI |
| `/api/surveys/{id}` | GET/PUT/DELETE | Survey detail | Backend Lead AI |

### Required Screens
| Route | Purpose | Agent |
|-------|---------|-------|
| `/leads` | Lead list with filters and search | Frontend Lead AI |
| `/leads/new` | Create lead form | Frontend Lead AI |
| `/leads/{id}` | Lead detail with scoring/qualification | Frontend Lead AI |
| `/leads/{id}/edit` | Edit lead | Frontend Lead AI |
| `/campaigns` | Campaign list | Frontend Lead AI |
| `/campaigns/new` | Create campaign | Frontend Lead AI |
| `/contacts` | Contact directory | Frontend Lead AI |
| `/contacts/new` | Create contact | Frontend Lead AI |
| `/companies` | Company directory | Frontend Lead AI |
| `/companies/new` | Create company | Frontend Lead AI |
| `/surveys` | Survey list | Frontend Lead AI |
| `/surveys/new` | Create survey from lead | Frontend Lead AI |
| `/surveys/{id}` | Survey detail | Frontend Lead AI |

### Dependencies
- CP-Authentication

### Output Checklist
- [ ] Backend module with 12+ endpoints
- [ ] Frontend pages with 13+ components
- [ ] Database migration (9 tables)
- [ ] Unit tests (60 minimum)
- [ ] Integration tests
- [ ] API documentation
- [ ] Screen documentation

### Estimated Metrics
- **Backend files:** 14
- **Frontend files:** 16
- **Test files:** 25
- **Document files:** 5
- **Total sprint effort:** 22 days
