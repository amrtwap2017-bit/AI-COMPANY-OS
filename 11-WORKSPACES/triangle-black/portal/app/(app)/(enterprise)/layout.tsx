// @ts-nocheck
// Triangle Black - Enterprise Layout
// Program A - Task A3
export const dynamic = "force-dynamic";
import { EnterpriseShell } from "@/components/workspace/EnterpriseShell";

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EnterpriseShell>{children}</EnterpriseShell>;
}
