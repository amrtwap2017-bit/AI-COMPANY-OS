// @ts-nocheck
// Triangle Black - App Layout (Legacy Route Group)
// Program A Task A3 / Program C Step 5
//
// KEY MOVE: All legacy (app)/ pages now use EnterpriseShell.
// Dual-shell problem permanently eliminated.
// Legacy routes are preserved. Only the shell is unified.
// Users see one consistent navigation on every page.
//
export const dynamic = "force-dynamic";
import { EnterpriseShell } from "@/components/workspace/EnterpriseShell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EnterpriseShell>{children}</EnterpriseShell>;
}
