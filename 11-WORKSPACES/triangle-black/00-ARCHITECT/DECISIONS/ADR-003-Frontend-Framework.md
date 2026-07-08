# ADR-003: Frontend Framework

**Status:** Accepted

**Context:** Triangle Black needs a frontend framework that supports server-side rendering (SSR) for SEO and performance, provides a great developer experience, has a mature ecosystem for hospitality UI components (calendars, booking widgets, dashboards), and integrates seamlessly with the NestJS backend. The team has React experience.

**Decision:**

We will use **Next.js with the App Router** as the frontend framework.

Key factors:
- **App Router** — React Server Components, streaming SSR, nested layouts, loading states
- **File-based routing** — intuitive route structure matching the architecture
- **SSR/SSG/ISR** — choose rendering strategy per page for optimal performance
- **API routes (BFF)** — backend-for-frontend pattern, avoids CORS in production
- **TypeScript support** — first-class, end-to-end type safety
- **Image optimization** — built-in via `next/image`
- **Font optimization** — built-in via `next/font`
- **Middleware** — run auth checks, tenant resolution, redirects at the edge

**Consequences:**

*Positive:*
- SSR provides fast initial page loads and good SEO for public pages (booking widget)
- React Server Components reduce client-side JavaScript bundle size
- BFF API routes simplify frontend-backend communication (no CORS, single origin)
- Middleware enables tenant-aware routing before the page loads
- Vercel compatibility provides a clear migration path for hosting

*Negative:*
- App Router is relatively new; some patterns still evolving
- BFF API routes add a hop between frontend and NestJS backend
- Server Components cannot use hooks or browser APIs (learning curve)
- Bundle size can grow if Server Component / Client Component boundaries are not well-managed
- Self-hosting Next.js requires more ops than Vercel (but we self-host anyway)

**Alternatives:**
- **Remix** — rejected: smaller ecosystem, less SSR flexibility, steeper migration path
- **Gatsby** — rejected: primarily static, poor SSR for auth-gated dashboards
- **Vite + React Router** — rejected: no built-in SSR, requires manual setup
- **SvelteKit** — rejected: team lacks Svelte expertise; smaller ecosystem
- **Nuxt 3 (Vue)** — rejected: team prefers React; Vue ecosystem less mature for hospitality
- **Plain React + Express SSR** — rejected: too much manual setup; Next.js conventions save time

**Related ADRs:** ADR-001 (Tech Stack), ADR-004 (Backend), ADR-006 (API Design)
