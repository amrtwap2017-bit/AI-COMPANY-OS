// Sprint-059: Fixed redirect target (was /workspace — Sprint 321 error)
// Canonical: /ai
import { redirect } from "next/navigation";
import { FeatureGate } from "@/components/ui/FeatureGate";
function PageInner() {
  redirect("/ai");
}


export default function Page(props: any) {
  return (
    <FeatureGate feature="ai_assistant">
      <PageInner {...props} />
    </FeatureGate>
  );
}
