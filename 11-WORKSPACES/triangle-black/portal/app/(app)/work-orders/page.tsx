// Sprint-056: Fixed redirect target (was /workspace — Sprint 321 error)
// Canonical: /operations/work-orders
import { redirect } from "next/navigation";
export default function Page() {
  redirect("/operations/work-orders");
}
