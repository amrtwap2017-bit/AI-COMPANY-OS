import { EnterpriseShell } from "@/components/workspace/EnterpriseShell";

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  return <EnterpriseShell>{children}</EnterpriseShell>;
}
