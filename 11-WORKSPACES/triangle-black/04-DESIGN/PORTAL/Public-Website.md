# Public Website

## Identity

| Field | Value |
|-------|-------|
| URL | triangleblack.com |
| Purpose | Lead generation, credibility, brand awareness |
| Tone | Professional, technical, trustworthy |
| Primary CTA | "Request a Consultation" / "Get a Quote" |

## Page Inventory

| Page | URL | Priority | Purpose |
|------|-----|----------|---------|
| Home | / | P0 | Value proposition, services overview, client logos, CTA |
| Services | /services | P0 | Detailed service catalog with descriptions |
| Service Detail | /services/:slug | P1 | Individual service deep-dive |
| About | /about | P0 | Company story, team, mission |
| Case Studies | /case-studies | P1 | Client success stories (placeholder in V1) |
| Case Study Detail | /case-studies/:slug | P1 | Single case study |
| Blog | /blog | P2 | Article listing |
| Blog Post | /blog/:slug | P2 | Single article |
| Contact | /contact | P0 | Lead capture form |
| Privacy | /privacy | P0 | Privacy policy |
| Terms | /terms | P0 | Terms of service |
| 404 | /not-found | P0 | Custom error page |

## Lead Capture Flow

```
Visitor lands on website
        │
        ▼
Browses content (services, about, case studies)
        │
        ▼
Visits Contact page OR clicks "Get a Quote" CTA
        │
        ▼
Contact form: Name, Email, Phone, Company, Message
        │
        ▼
reCAPTCHA verification
        │
        ▼
Success → Thank you page + auto-reply email
    → Lead created in CRM (source = website)
    → Notification to sales team
```

## Content Strategy (V1)

| Content Type | Volume (V1) | Source |
|-------------|-------------|--------|
| Service pages | 5 pages | Written by founder |
| About page | 1 page | Company background |
| Case studies | 2-3 placeholders | Template until real clients |
| Blog posts | 5-10 at launch | Technical content by engineering team |
| SEO meta | All pages | Keyword: hospitality engineering Egypt |
| Schema markup | Organization, LocalBusiness | JSON-LD |

## Technical Requirements

| Requirement | Implementation |
|-------------|---------------|
| Framework | Next.js App Router (static generation) |
| Hosting | VPS via Docker Compose + Nginx |
| Analytics | Google Analytics 4 (or Plausible for privacy) |
| SEO | Dynamic meta tags, Open Graph, sitemap.xml |
| Performance | Lighthouse score > 90 |
| Responsive | Mobile-first, breakpoints at 640/768/1024/1280 |
| Security | CSP headers, HSTS, XSS protection |
| Forms | React Hook Form + Zod validation |
| Accessibility | WCAG 2.1 AA |

## Out of Scope (V1)

| Item | Rationale | Target |
|------|-----------|--------|
| Self-serve booking | Sales-led model, not direct booking | V3 |
| Multi-language | English covers Egypt market initial outreach | V2 |
| E-commerce | No direct online purchasing | V2 |
| Live chat | Not critical for first clients | V2 |
| CMS | Static pages sufficient; headless CMS in V2 | V2 |
| Job listings | Not a hiring pipeline yet | V2 |
