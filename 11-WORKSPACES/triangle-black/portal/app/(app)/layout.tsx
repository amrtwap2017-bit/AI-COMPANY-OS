// Triangle Black — App Layout (Server Component)
// Hooks and client state live in EnterpriseShell — not here.
// This file must remain a Server Component (no "use client").
import { EnterpriseShell } from "@/components/workspace/EnterpriseShell";

export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EnterpriseShell>{children}</EnterpriseShell>;
}
