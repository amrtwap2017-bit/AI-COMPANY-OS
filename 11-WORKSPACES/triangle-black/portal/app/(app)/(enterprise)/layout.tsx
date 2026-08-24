import { MobileBottomNav } from "@/components/workspace/MobileBottomNav";
// Triangle Black - Enterprise Layout
// FIXED: Does NOT wrap in EnterpriseShell
// The parent (app)/layout.tsx already provides EnterpriseShell
// for ALL pages under (app)/ including (enterprise)/ sub-group
// Adding EnterpriseShell here caused double shell (two sidebars/topbars)
export const dynamic = "force-dynamic";

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pass through - shell is already provided by parent (app)/layout.tsx
  return <>{children}</>;
}
