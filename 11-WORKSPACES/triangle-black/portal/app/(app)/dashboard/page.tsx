// Sprint-059: Fixed redirect target (was /workspace — Sprint 321 error)
// Canonical: /executive/dashboard
import { redirect } from "next/navigation";
export default function Page() {
  redirect("/executive/dashboard");
}
