# 01 — External Systems Landscape

> Complete inventory of every external system Triangle Black integrates with.

## Integration Classification

| Tier | Definition | V1/V2 |
|------|-----------|-------|
| **Critical** | System must be operational for core business functions | V1 |
| **High** | Significant business value, workaround exists | V1 |
| **Medium** | Operational efficiency improvement | V1-V2 |
| **Low** | Nice-to-have, future value | V2 |
| **Strategic** | Long-term competitive advantage | V2+ |

---

## 1. Government & Regulatory Systems

### 1.1 Egypt Tax Authority (ETA) — E-Invoice

| Attribute | Value |
|-----------|-------|
| Purpose | Submit invoices to Egyptian tax authority for VAT compliance |
| Business Value | Legal compliance, avoid penalties (up to EGP 50K per violation) |
| Owner | Finance Team |
| Frequency | Per invoice (real-time) |
| Direction | Outbound (push) |
| Real Time | Yes — invoice must be submitted within 72 hours of issuance |
| Scheduled | No |
| Event Driven | Yes — on invoice.paid |
| Authentication | OAuth 2.0 Client Credentials (ETA portal credentials) |
| Protocol | REST/JSON |
| Dependencies | Valid invoice, valid tax ID, ETA portal account |
| Risks | ETA downtime, schema changes, rejection codes |
| V1 Decision | **MVP** — Manual submission with automated generation. Automated submission in V1.5 |
| Future Evolution | Full automated submission, VAT return filing |

### 1.2 Egypt Labor Office / Social Insurance

| Purpose | Submit employee data, social insurance contributions |
| Business Value | Labor law compliance |
| Owner | HR / Finance |
| Frequency | Monthly |
| Direction | Outbound |
| Real Time | No |
| Scheduled | Monthly batch |
| Protocol | TBD (likely portal-based or file upload) |
| V1 Decision | **Post-MVP** — Manual submission |
| Future Evolution | Automated file generation, API integration |

---

## 2. Financial Systems

### 2.1 Banking — Payment Reconciliation

| Attribute | Value |
|-----------|-------|
| Purpose | Import bank statements to reconcile payments |
| Business Value | Automate AR/AP reconciliation, reduce manual work |
| Owner | Finance |
| Frequency | Daily |
| Direction | Inbound |
| Real Time | No |
| Scheduled | Daily batch |
| Protocol | CSV file import (V1), API (V2) |
| Security | File encryption, access control |
| Dependencies | Bank account access, statement export |
| V1 Decision | **MVP** — CSV import via file upload |
| Future Evolution | Direct API integration with CIB, QNB, Banque Misr, EFG Hermes |

### 2.2 Payment Gateway — Fawry / Paymob / Kiosk

| Purpose | Accept client payments (card, wallet, kiosk) |
| Business Value | Reduce DSO, offer clients convenient payment |
| Owner | Finance |
| Frequency | Per transaction |
| Direction | Bidirectional |
| Real Time | Yes — payment confirmation required |
| Authentication | API key + HMAC signature |
| Protocol | REST/JSON + Webhook callback |
| Dependencies | Merchant account with payment provider |
| Risks | Transaction failures, chargebacks, downtime |
| V1 Decision | **Post-MVP** — Manual payment recording first |
| Future Evolution | Full payment gateway integration |

---

## 3. Hospitality Ecosystem

### 3.1 Property Management Systems (PMS)

| System | Market | Priority | V1/V2 |
|--------|--------|----------|-------|
| Oracle Opera PMS | Luxury hotels, Middle East | High | V2 |
| Oracle Hospitality (Opera Cloud) | Enterprise chains | High | V2 |
| Shiji Enterprise Platform | Multi-property | Medium | V2 |
| Mews | Modern/independent hotels | Medium | V2 |
| Cloudbeds | Boutique/hostels | Low | V2 |
| Protel | European hotels | Low | V2 |

| Attribute | Value |
|-----------|-------|
| Purpose | Sync client/contract data, project scope with hotel PMS |
| Business Value | Direct integration with client's operating system |
| Owner | Commercial Team |
| Frequency | Per event |
| Direction | Bidirectional |
| Real Time | Yes |
| Protocol | REST/SOAP (PMS-dependent) |
| Authentication | API key or OAuth |
| Risks | Each PMS has different API, schema, authentication |
| V1 Decision | **V2** — Manual data exchange initially |
| Future Evolution | Unified PMS ACL, property-wide service synchronization |

### 3.2 Point of Sale (POS) — Oracle Micros / Simphony

| Purpose | Sync maintenance data with hotel F&B systems |
| Business Value | Cross-sell maintenance services through POS channels |
| V1 Decision | **V2+** |

### 3.3 Hotel Maintenance Systems

| System | Purpose |
|--------|---------|
| HotSOS | Hotel service optimization |
| ALICE | Housekeeping and maintenance |
| Quore | Hotel operations platform |
| FCS | Hotel communication systems |

| V1 Decision | **V2+** — Manual processes initially |

---

## 4. Communication Systems

### 4.1 Email — SMTP / SendGrid

| Attribute | Value |
|-----------|-------|
| Purpose | Send quotations, invoices, notifications, contracts |
| Business Value | Core business communication channel |
| Owner | System |
| Frequency | Per event |
| Direction | Outbound |
| Real Time | Yes (async) |
| Authentication | SMTP credentials or API key |
| Protocol | SMTP (V1), SendGrid API (V1.5) |
| V1 Decision | **MVP** — SMTP via Postfix on VPS |
| Future Evolution | SendGrid/Mailgun for deliverability + analytics |

### 4.2 WhatsApp Business API

| Purpose | Client notifications, quotations, service updates |
| Business Value | High open rate (98% vs 20% email), Egypt market standard |
| Owner | Commercial + Support |
| Frequency | Per event |
| Direction | Outbound (V1), Bidirectional (V2) |
| Authentication | Meta Business API token |
| Protocol | REST/JSON |
| Cost | Free for service notifications, $0.005/message for marketing |
| V1 Decision | **High Priority** — Meta WhatsApp Business API |
| Future Evolution | Two-way conversation, WhatsApp payment |

### 4.3 SMS — Local Gateway

| Purpose | OTP, urgent notifications, low-connectivity clients |
| Business Value | Reach clients without smartphones |
| Owner | System |
| Frequency | Per event |
| Direction | Outbound |
| V1 Decision | **Medium Priority** — Twilio or local Egypt gateway |
| Future Evolution | Multi-provider failover |

### 4.4 Calendar — Google / Microsoft

| Purpose | Sync site survey schedules |
| Business Value | Engineer scheduling, client visibility |
| Owner | Operations |
| Authentication | OAuth 2.0 |
| Protocol | Google Calendar API / Microsoft Graph API |
| V1 Decision | **MVP** — Google Calendar API |
| Future Evolution | Bi-directional sync with conflict detection |

---

## 5. Document & Storage Systems

### 5.1 Cloud Storage

| Provider | Purpose | V1 Decision |
|----------|---------|-------------|
| AWS S3 / DO Spaces | Document storage, photo archive | **MVP** — DO Spaces ($5/mo) |
| Google Drive | Client document sharing | V2 |
| SharePoint | Enterprise client collaboration | V2+ |

### 5.2 Digital Signature

| Provider | Purpose |
|----------|---------|
| DocuSign | Contract e-signature |
| Egypt Trust | Egypt-specific digital signature |
| Adobe Sign | Alternative e-signature |

| V1 Decision | **V2** — Manual signature first (PDF + email) |

---

## 6. Identity Providers

| Provider | Purpose | V1/V2 |
|----------|---------|-------|
| Google Workspace | SSO for internal users | V2 |
| Microsoft Azure AD | SSO for enterprise clients | V2 |
| Auth0 | Universal identity platform | V2+ |

| V1 Decision | **Post-MVP** — JWT-based auth (Phase 5) covers V1 |

---

## 7. AI & Analytics

### 7.1 AI Providers

| Provider | Purpose | V1/V2 |
|----------|---------|-------|
| OpenAI / Azure OpenAI | Natural language agents, document analysis | V2 |
| Google Vertex AI | Vision AI for site photos | V2 |
| Custom ML Models | Lead scoring, anomaly detection | V1 (rule-based) |

| V1 Decision | Rule-based agents only (Phase 5 AI Gateway). ML models in V2. |

### 7.2 Business Intelligence

| Tool | Purpose | V1/V2 |
|------|---------|-------|
| Metabase / Superset | Self-hosted BI dashboards | V1 |
| Power BI | Enterprise client reporting | V2 |
| Tableau | Advanced analytics | V2+ |

| V1 Decision | **Metabase** (self-hosted, free, connects directly to PostgreSQL) |

---

## 8. Procurement & Supplier Systems

### 8.1 Hospitality Procurement Platforms

| Platform | Purpose | V1/V2 |
|----------|---------|-------|
| Birchstreet | Hospitality procurement | V3 |
| Procure Wizard | Hotel purchasing | V3 |
| Market Hub | Procurement marketplace | V3 |

| V1 Decision | **V3** — Manual supplier management initially |

---

## 9. ERP & Accounting Systems

### 9.1 ERP Systems

| System | Purpose | V1/V2 |
|--------|---------|-------|
| SAP | Enterprise client integration | V3 |
| Oracle ERP | Enterprise client integration | V3 |
| Odoo | Mid-market client integration | V2 |
| Microsoft Dynamics | Enterprise client integration | V3 |

| V1 Decision | **V3** — CSV export/import initially |

---

## Integration Ownership Matrix

| System | Internal Owner | External Contact | Status |
|--------|---------------|------------------|--------|
| ETA E-Invoice | Finance Controller | Egypt Tax Authority | V1 |
| Email (SMTP) | System Admin | Self-hosted | MVP |
| WhatsApp | Commercial Lead | Meta Business | V1 |
| Google Calendar | Operations | Google | MVP |
| Bank CSV | Finance Controller | Respective Bank | V1 |
| Cloud Storage (DO) | System Admin | DigitalOcean | MVP |
| Payment Gateway | Finance Manager | Fawry/Paymob | V2 |
| Opera PMS | Commercial Lead | Oracle | V2 |
