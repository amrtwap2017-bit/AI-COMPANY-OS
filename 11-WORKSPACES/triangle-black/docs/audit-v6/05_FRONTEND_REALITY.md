# Frontend Reality — A-001 Audit August 2026

## Verified Metrics
- Total .tsx files: 355
- Page files: 306
- @ts-nocheck: 2 (intentional — dark theme pages)
- Inline styles: 1,025 (all dynamic/irreducible)
- Direct localhost:8030 fetches: 1 (needs fix)

## Architecture
- Framework: Next.js 14 App Router
- Auth: proxy.ts (middleware.ts DELETED)
- API: authFetch via useAuthFetch.ts
- Design: TBEDS 7.1 (414 CSS classes in globals.css)
- Nav: 13 centers, 130+ routes, 55 Lucide icons

## New Pages This Session
- /operations/baseline-report ← customer-facing intelligence

## Portal Inventory (5 portals)
- Main: localhost:3000
- Technician: /technician-portal (mobile-first, dark)
- Supplier: /supplier-portal
- Client: /client-portal
- Asset Scan: /asset/[id] (QR code landing)

## Known Issues
1. 1 page uses direct fetch("localhost:8030/...") — find and fix
2. Dark theme pages intentionally keep @ts-nocheck (2 files)
3. Some portal pages not yet connected to real APIs
