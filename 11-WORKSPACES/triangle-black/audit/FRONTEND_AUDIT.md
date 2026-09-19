# Frontend Audit

Three Next applications exist: `portal` (319 page/layout files), `client-portal` (12), `admin-portal` (9). The apparent main portal uses Next 16.2.10, React 19, TypeScript, Tailwind and TanStack Query. It has many API clients, defaulting to `http://localhost:8030` when public API configuration is absent.

Type check executed read-only: **FAIL**, one syntax error in `portal/app/(app)/(enterprise)/pilot-dashboard/page.tsx:364` (`TS1381`). `portal/next.config.ts` sets `typescript.ignoreBuildErrors: true`; repository `SECURITY_TODO.md` calls for its removal. UI route existence does not prove backend compatibility: significant V15 screens call paths not mounted in the active app. Loading/error handling is inconsistent (many `.catch(() => null/[])`). Mobile and accessibility are NOT VERIFIED.
