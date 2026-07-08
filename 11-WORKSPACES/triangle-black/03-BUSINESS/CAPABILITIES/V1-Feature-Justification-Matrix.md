# V1 Feature Justification Matrix

| Field | Value |
|---|---|
| Document ID | ROOT-CORNERSTONE-05 |
| Document Purpose | Justify every V1 feature against revenue, cost, trust, quality, risk, or scalability impact |
| Version | 1.0 |
| Status | Review |
| Dependencies | 07-Product/MVP.md, Business-Capability-Matrix.md |

---

## Justification Criteria

Every V1 feature must satisfy at least one of:

| Criterion | Definition |
|---|---|
| Revenue | Directly generates revenue or accelerates revenue generation |
| Cost | Reduces operational cost or prevents cost leakage |
| Trust | Improves client trust, transparency, and retention |
| Quality | Improves operational or service quality |
| Risk | Reduces business, operational, or security risk |
| Scale | Enables the business to scale without proportional cost increase |

Features that do not satisfy at least one criterion are excluded from V1.

---

## V1 Features

### Module: Public Website

| Feature | Justification | Criteria |
|---|---|---|
| Company profile | Establishes credibility. First thing potential clients search for. | Trust |
| Services page | Explains what we do. Generates inbound inquiries. | Revenue |
| Industries page | Demonstrates hospitality expertise. | Trust |
| Case studies (template) | Social proof for prospects. Will be populated after first clients. | Trust, Revenue |
| Contact form | Lead capture mechanism. | Revenue |
| Request quotation form | Direct lead conversion. | Revenue |

### Module: CRM

| Feature | Justification | Criteria |
|---|---|---|
| Lead management | Central lead repository. No more lost leads in WhatsApp. | Revenue, Risk |
| Lead status tracking | Know where every prospect is. Measure conversion. | Revenue, Quality |
| Opportunity management | Pipeline visibility. Forecast revenue. | Revenue, Scale |
| Opportunity stages | Standardized sales process. Stage-based reporting. | Quality, Scale |
| Company records | Single source of truth for client data. | Quality, Risk |
| Contact management | Know who's who at each hotel. | Quality, Trust |
| Activity logging | Know every interaction with the client. | Quality, Risk |

### Module: Projects

| Feature | Justification | Criteria |
|---|---|---|
| Project creation | Formal project setup from contract. | Revenue, Quality |
| Milestone tracking | Know project progress. Client visibility. | Trust, Quality |
| Deliverable management | Central file repository per project. | Quality, Risk |
| Project files | No more lost documents. Version control. | Quality, Risk |
| Status dashboard | At-a-glance project health. | Quality, Scale |
| Team assignment | Know who is working on what. | Quality, Scale |

### Module: Quotations

| Feature | Justification | Criteria |
|---|---|---|
| RFQ tracking | Know what we've been asked to quote. | Revenue |
| Quotation creation | Professional, consistent quotations. | Revenue, Trust |
| Line-item pricing | Transparent pricing builds trust. | Revenue, Trust |
| Quotation approval workflow | Prevent unauthorized pricing. Margin protection. | Revenue, Risk |
| PDF generation | Professional documents sent to clients. | Trust, Revenue |
| Contract generation | From approved quotation to contract. | Revenue |
| Quotation history | Track revisions and client negotiations. | Quality |

### Module: Client Portal

| Feature | Justification | Criteria |
|---|---|---|
| Project progress view | Client sees exactly where their project stands. | Trust |
| Document access | Clients download reports, certificates, manuals. | Trust |
| Quotation view | Clients see their quotations and history. | Trust, Revenue |
| Invoice view | Clients see billing and payment status. | Trust |
| Reports | Monthly performance reports delivered via portal. | Trust |
| Communication | Secure messaging between client and Triangle Black. | Trust, Quality |
| Mobile responsive | Hotel GMs and engineers check on mobile. | Trust, Quality |

### Module: Executive Dashboard

| Feature | Justification | Criteria |
|---|---|---|
| Pipeline view | Revenue forecast. Know if we'll hit targets. | Revenue, Scale |
| Revenue tracking | Track actual vs target revenue. | Revenue |
| Project health | Which projects need attention. | Quality, Risk |
| Team workload | Who is overallocated. | Quality, Scale, Cost |
| Client health | Which clients are at risk of churning. | Trust, Revenue |
| KPI cards | At-a-glance business health. | Quality, Scale |

### Module: Administration

| Feature | Justification | Criteria |
|---|---|---|
| User management | Who has access to the system. | Risk |
| Role management | Role-based access control. | Risk |
| Permission management | Granular access control per feature. | Risk, Quality |
| Settings | Platform configuration. | Quality |
| Audit log | Who did what, when. Compliance. | Risk, Trust |
| Tenant management | Multi-tenant isolation. | Scale, Risk |

---

## Excluded Features (Moved to V2+)

| Feature | Reason for Exclusion | Future Version |
|---|---|---|
| Supplier portal | Not critical for first 5 clients. Can be manual. | V2 |
| AI-powered reports | Requires historical data. | V2 |
| Predictive maintenance | Requires asset data accumulation. | V2 |
| Mobile field app (native) | Mobile-responsive web sufficient for V1. | V2 |
| Supplier marketplace | Requires supplier network maturity. | V3 |
| Benchmarking intelligence | Requires multi-client data. | V3 |
| API marketplace | Not needed until third-party integrations required. | V3 |
| Analytics/BI self-service | Executive dashboard meets V1 needs. | V2 |
| Invoice automation | Manual invoicing works for 5 clients. | V2 |
| Automated procurement matching | Requires procurement volume. | V2 |
| Integration with PMS | Not a dependency for V1. | V3 |
| White-label platform | Requires product maturity. | V3 |
| Multi-language | English + Arabic in V1 covers Egypt market. | V2 |
| Offline mode | Mobile web with caching sufficient. | V2 |
| Native mobile apps | PWA or responsive web for V1. | V2 |
