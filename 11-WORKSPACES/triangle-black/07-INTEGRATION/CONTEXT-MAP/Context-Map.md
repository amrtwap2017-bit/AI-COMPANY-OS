# 02 — Integration Context Map

> DDD strategic design: bounded contexts, relationships, anti-corruption layers.

## Context Map Legend

```
[Internal Bounded Context] ← relationship → [External System]
Relationships:
  ACL  → Anti-Corruption Layer (translate external to internal)
  OHS  → Open-Host Service (publish internal as public API)
  PL   → Published Language (shared protocol/format)
  CF   → Conformist (follow external standard)
  P    → Partnership (co-evolved integration)
  CS   → Customer/Supplier (upstream/downstream)
  SK   → Shared Kernel (shared model)
```

---

## Context Map Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                   TRIANGLE BLACK — INTERNAL DOMAINS                  │
│                                                                     │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │COMMERCIAL│ │PROJECT   │ │PROCURE   │ │SUPPLIER  │ │INVENTORY │ │
│  │(01)      │ │DELIVERY  │ │MENT (03) │ │MGMT (04) │ │(05)      │ │
│  └────┬─────┘ │(02)      │ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       │       └──────────┘      │            │            │       │
│       └──────────┬──────────────┘────────────┴────────────┘       │
│                  │                                                 │
│          ┌───────▼────────┐  ┌──────────┐  ┌──────────────────┐   │
│          │FINANCIAL (06)  │  │DOCUMENTS │  │EXECUTIVE (09)    │   │
│          └───────┬────────┘  │(08)      │  └──────────────────┘   │
│                  │           └──────────┘                          │
│          ┌───────▼────────┐  ┌──────────┐  ┌──────────────────┐   │
│          │MAINTENANCE (07)│  │MOBILE(12)│  │AI COPILOTS (10)  │   │
│          └────────────────┘  └──────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
    ┌────▼─────────────┐ ┌─────▼──────┐  ┌────────────▼──────────┐
    │ INTEGRATION       │ │ EVENT      │  │ SYNCHRONIZATION       │
    │ GATEWAY (ACL)     │ │ BRIDGE     │  │ ENGINE                │
    │ REST/GraphQL      │ │ Pub/Sub    │  │ Batch/Scheduled       │
    └────┬──────────────┘ └─────┬──────┘  └────────────┬──────────┘
         │                      │                      │
    ┌────▼──────────────────────▼──────────────────────▼──────────┐
    │                   ANTI-CORRUPTION LAYER                     │
    │  Transform external payloads to internal domain schemas     │
    │  Transform internal events to external webhook payloads     │
    └────┬──────────────────────┬──────────────────────┬──────────┘
         │                      │                      │
    ┌────▼────┐           ┌─────▼─────┐          ┌─────▼─────┐
    │HOSPITAL │           │ FINANCE   │          │ GOVERNMENT│
    │PMS/POS  │           │ ERP/Bank  │          │ ETA       │
    │ACL      │           │ ACL       │          │ ACL       │
    └─────────┘           └───────────┘          └───────────┘
```

---

## Integration Relationship Types

### 1. Anti-Corruption Layer (ACL)

Used when external system has a different model that would contaminate the internal domain.

| Integration | ACL Purpose |
|-------------|-------------|
| ETA E-Invoice | Transform internal invoice → ETA XML/JSON format. Transform ETA response → internal status |
| Opera PMS | Transform hotel property → internal company/account. Transform booking → opportunity |
| Bank CSV | Transform bank statement rows → internal payment records |
| WhatsApp | Transform internal notification → WhatsApp template message |
| Google Calendar | Transform site survey → calendar event |

**ACL Pattern:**
```
External Payload → ACL Validator → Schema Translator → Internal Command/Event
                                                          │
                                              ┌───────────┴──────────┐
                                              │  Validated by domain │
                                              │  rules before commit │
                                              └──────────────────────┘
```

### 2. Open-Host Service (OHS)

Used when internal platform exposes capabilities to external consumers.

| Service | Consumers | Protocol |
|---------|-----------|----------|
| Client Portal API | Hotel clients | REST (OAuth) |
| Partner API | Suppliers, contractors | REST (API key) |
| Public Webhook Events | Any registered webhook | HTTP POST (HMAC) |
| Export API | Any data consumer | REST (API key) |

**OHS Pattern:**
```
Internal Domain → Published Language → REST API → External Consumer
                         │
                    OpenAPI Spec
                    (contract)
```

### 3. Published Language (PL)

Shared protocols/formats used for integration.

| Language | Used By |
|----------|---------|
| ISO 4217 (currency) | All financial integrations |
| ISO 8601 (datetime) | All integrations |
| RFC 7807 (problem details) | All API errors |
| ETA Invoice Schema | E-Invoice submission |
| iCal/ICS | Calendar sync |
| OFX/QIF | Bank statement import |
| PDF/A | Document archiving |

### 4. Conformist (CF)

Used when internal system must follow external standard without modification.

| Integration | Standard |
|-------------|----------|
| ETA E-Invoice | Egypt Tax Authority schema (non-negotiable) |
| WhatsApp Business | Meta message template format |
| OAuth 2.0 / OIDC | RFC 6749, RFC 7519 |

### 5. Partnership (P)

Co-evolved integrations where both sides may change.

| Integration | Partner | Evolution |
|-------------|---------|-----------|
| Payment Gateway | Fawry/Paymob | API may evolve, test in sandbox |
| Google Calendar | Google | Follow Google API deprecation policy |

### 6. Customer/Supplier (CS)

Upstream (supplier) determines contract, downstream (customer) adapts.

| Integration | Upstream | Downstream |
|-------------|----------|------------|
| SMTP Email | Mail server (Postfix) | Triangle Black notification service |
| SMS Gateway | SMS provider | Triangle Black notification service |
| Cloud Storage (S3) | AWS/DO | Triangle Black document service |

---

## Anti-Corruption Layer — Detailed Design

### ACL Structure

```
integration/acl/
├── eta/
│   ├── eta-invoice.acl.ts          — Transform invoice → ETA format
│   ├── eta-response.acl.ts         — Transform ETA response → internal
│   └── eta-validator.acl.ts        — Validate against ETA schema
├── banking/
│   ├── csv-statement.acl.ts        — Parse bank CSV rows
│   └── payment-match.acl.ts        — Match statement rows to invoices
├── whatsapp/
│   ├── message-template.acl.ts     — Transform notification → template
│   └── callback.acl.ts             — Transform delivery receipt → internal
├── calendar/
│   ├── google-event.acl.ts         — Transform survey → Google event
│   └── google-sync.acl.ts          — Handle sync responses
└── pms/
    ├── opera-property.acl.ts       — Transform Opera property → company
    └── opera-booking.acl.ts        — Transform booking → opportunity
```

### ACL Contract

Every ACL function must:
1. **Validate** external input against expected schema
2. **Transform** to internal domain model
3. **Pass to domain service** (never bypass domain rules)
4. **Log** the transformation (audit trail)
5. **Handle errors** — external format changes must not crash internal system

---

## Bounded Context Ownership

| Internal Context | External Integrations | ACL Required |
|-----------------|----------------------|--------------|
| 01-COMMERCIAL | WhatsApp (lead capture), Opera PMS (opportunity), Google Calendar (survey) | Yes |
| 02-PROJECT-DELIVERY | Calendar (milestones), Email (reports) | No (simple formats) |
| 03-PROCUREMENT | Supplier portals, Birchstreet | Yes |
| 04-SUPPLIER-MANAGEMENT | Supplier registration portal | No |
| 05-INVENTORY | Barcode scanners, IoT sensors | Yes (V2+) |
| 06-FINANCIAL-CONTROL | ETA (e-invoice), Bank (statements), Payment gateway | Yes |
| 07-MAINTENANCE | SMS/WhatsApp (notifications), Calendar | No |
| 08-DOCUMENT-MANAGEMENT | S3/DO Spaces, Google Drive, DocuSign | Yes |
| 09-EXECUTIVE-INTELLIGENCE | BI tools (Metabase), Export (Power BI) | No |
| 10-AI-COPILOTS | OpenAI, Vertex AI | Yes |
| 11-INTEGRATIONS | Webhook dispatch, webhook receive | Yes |
| 12-MOBILE | Push notifications | No |

---

## Context Map Validation

| Criteria | Status |
|----------|--------|
| Every external system has defined relationship type | Complete |
| Every ACL has documented purpose | Complete |
| No external schema enters domain logic unguarded | Enforced |
| Published languages documented | Complete |
| Partnership boundaries identified | Complete |
| Customer/supplier relationships clear | Complete |
| V1 integrations have simplified ACL (direct REST) | Complete |
