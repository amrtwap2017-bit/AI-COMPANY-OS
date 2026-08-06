// Sprint-056: Fixed redirect target (was /workspace — Sprint 321 error)
// Canonical: /supply-chain/purchase-requests
import { redirect } from "next/navigation";
export default function Page() {
  redirect("/supply-chain/purchase-requests");
}
