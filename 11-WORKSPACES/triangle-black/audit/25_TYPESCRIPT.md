# 25 TypeScript

`portal` uses Next 16.2.10 (not expected 14). Read-only `tsc --noEmit` fails TS1381 at `portal/app/(app)/(enterprise)/pilot-dashboard/page.tsx:364`. `portal/next.config.ts` sets `typescript.ignoreBuildErrors: true`. Customer pilot path is affected. FAIL.
