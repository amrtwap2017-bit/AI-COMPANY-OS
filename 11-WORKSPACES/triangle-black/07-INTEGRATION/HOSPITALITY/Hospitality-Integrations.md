# 07 — Hospitality Ecosystem Integrations

> Hotel PMS, POS, property management, and hospitality-specific platforms.

## Market Context

Triangle Black serves hospitality engineering clients in Egypt (USD 21.54B market, 143 hotels/33,926 rooms pipeline). These clients operate property management systems (PMS) that are the digital backbone of their hotels. Integration with these systems is a competitive differentiator.

## Integration Opportunity Matrix

| System | Type | Egypt Market Share | Triangle Black Opportunity | V1/V2 |
|--------|------|-------------------|---------------------------|-------|
| Oracle Opera PMS | PMS | High (luxury hotels) | Sync client data, project scope with property records | V2 |
| Oracle Opera Cloud | PMS (Cloud) | Growing | Real-time property data sync, maintenance triggers | V2 |
| Oracle Micros Simphony | POS | High (F&B) | Sync maintenance requests from F&B systems | V2+ |
| Shiji Enterprise Platform | PMS | Medium | Multi-property integration, centralized billing | V2+ |
| Mews | PMS (Modern) | Growing (boutique) | Modern API, easier integration path | V2 |
| Cloudbeds | PMS | Low (hostels) | Lower complexity, lower value | V3 |
| HotSOS | Service Optimization | Medium | Service request integration, housekeeping sync | V2+ |
| Birchstreet | Procurement | Medium | Hospitality-specific procurement automation | V3 |
| Procure Wizard | Procurement | Medium | Purchase order automation for hotels | V3 |

## V1 Decision: No PMS Integration

Phase 7 V1 does **not** include PMS integration. Rationale:

| Factor | Assessment |
|--------|------------|
| Complexity | Each PMS has unique API, auth, schema |
| Cost | Oracle/Opera licensing and integration services |
| Timeline | 3-6 months per PMS integration |
| Current need | No client currently requires it |
| MVP focus | Core platform value (01-06) before integration |

**V1 Approach:** Manual data exchange via CSV/Excel for property and client data.

## V2 PMS Integration Architecture

### Opera PMS Integration Design

```
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│   Opera PMS          │     │   ACL Layer           │     │ Triangle Black       │
│                      │     │                       │     │                      │
│  Property ──────────►│────►│  opera-property.acl   │────►│ 01-COMMERCIAL        │
│  (hotel data)        │     │  ─ Transform Opera    │     │ Company → Account     │
│                      │     │    property schema →  │     │                      │
│  Booking ───────────►│────►│    internal company   │     │ Opportunity →         │
│  (service req)       │     │                       │     │ Site Survey           │
│                      │     │  opera-booking.acl    │────►│                      │
│  Guest ─────────────►│────►│  ─ Transform Opera    │     │ Contact → Client      │
│  (contact)           │     │    booking schema →   │     │                      │
│                      │     │    internal service   │     │ 07-MAINTENANCE        │
│                      │     │    request            │     │ Work Order → Service  │
└──────────────────────┘     └──────────────────────┘     └──────────────────────┘
```

### Integration Scenarios (V2)

| Scenario | Trigger | Flow |
|----------|---------|------|
| New hotel client | Opera property created | Pull property data → Create company in 01-COMMERCIAL |
| Maintenance request from hotel | Opera PM work order | Pull work order → Create service request in 07-MAINTENANCE |
| Project completion notification | Triangle Black milestone | Push milestone status → Update Opera room status |
| Invoice sync | Invoice created | Push invoice data → Opera city ledger |

### Integration Method

| PMS | Method | Authentication | Complexity |
|-----|--------|---------------|------------|
| Opera PMS v5 | Web Service (SOAP) | Opera user/pass | High |
| Opera Cloud | REST API | OAuth 2.0 | Medium |
| Opera (via Integration Layer) | Oracle Integration Cloud | OAuth | Medium (costly) |
| Mews | REST API | API Key | Low |
| Shiji | REST API | OAuth 2.0 | Medium |

### Priority Ranking

```
Priority 1: Opera PMS / Opera Cloud     (market share, client demand)
Priority 2: Mews                         (modern API, easier integration)
Priority 3: Shiji                        (growing Egypt presence)
Priority 4: Micros Simphony (POS)       (cross-sell opportunity)
Priority 5: HotSOS / ALICE              (maintenance integration)
```

## Hospitality Procurement Integrations (V3)

| Platform | Purpose | Method |
|----------|---------|--------|
| Birchstreet | Submit POs, receive invoices | REST API or EDI |
| Procure Wizard | Supplier catalog sync | REST API |
| Market Hub | Multi-supplier procurement | API integration |

## ROI Analysis — PMS Integration

| Factor | Year 1 | Year 2 |
|--------|--------|--------|
| Development cost | $30K-60K (Opera) | $10K (maintenance) |
| Licensing cost | $500-2000/mo (if required) | $500-2000/mo |
| New clients enabled | 3-5 (est.) | 8-12 (est.) |
| Revenue per client | $50K-200K/yr | $50K-200K/yr |
| ROI breakeven | 6-12 months | — |

## Recommendation

| Phase | Action | Timeline |
|-------|--------|----------|
| V1 | Manual data exchange, CSV/Excel | Current |
| V1.5 | Research Opera PMS API access, build ACL skeleton | Month 4-6 |
| V2 | Integrate Opera PMS (top 3 clients), integrate Mews | Month 7-12 |
| V2+ | Micros POS integration, procurement platforms | Year 2+ |
