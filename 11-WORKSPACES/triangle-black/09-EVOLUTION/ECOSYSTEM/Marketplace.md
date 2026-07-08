# 07 — Marketplace

> Integration marketplace for the platform.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Ecosystem-Roadmap.md | Ecosystem plan |
| Phase 10 — Public-API.md | API capabilities |

## Marketplace Architecture

```
┌─────────────────────────────────────────┐
│         MARKETPLACE                      │
│  ● Browse integrations                   │
│  ● Install with one click                │
│  ● Manage subscriptions                  │
│  ● View pricing + reviews                │
└─────────────────────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐    ┌────────┐
│Payment │ │Integration│   │Partner │
│Gateway │ │Engine    │   │Portal  │
└────────┘ └────────┘    └────────┘
```

## Integration Categories

| Category | Examples | Priority |
|----------|----------|----------|
| Payment gateways | Fawry, Paymob, Stripe | P1 |
| Channel managers | SiteMinder, HotelRunner | P1 |
| OTAs | Booking.com, Expedia | P1 |
| Accounting | Odoo, Zoho Books | P2 |
| CRM | Salesforce, HubSpot | P2 |
| Marketing | Mailchimp, HubSpot | P2 |
| Analytics | Google Analytics, Hotjar | P3 |
| Communication | WhatsApp, Twilio | P1 |

## Marketplace Features

| Feature | H1 | H2 | H3 |
|---------|----|----|----|
| Browse integrations | ✅ | ✅ | ✅ |
| One-click install | ✅ | ✅ | ✅ |
| Integration management | ✅ | ✅ | ✅ |
| Pricing display | ✅ | ✅ | ✅ |
| Reviews & ratings | — | ✅ | ✅ |
| Free trial | — | ✅ | ✅ |
| Auto-update | — | ✅ | ✅ |
| Revenue dashboard | — | ✅ | ✅ |
| Partner analytics | — | — | ✅ |

## Revenue Model

| Model | Description | Split |
|-------|-------------|-------|
| Commission | Per-transaction fee | 70% partner / 30% platform |
| Flat fee | Monthly subscription | 80% partner / 20% platform |
| Free | No-cost integration | Visibility for partner |
| Premium | Featured placement | Negotiated |
