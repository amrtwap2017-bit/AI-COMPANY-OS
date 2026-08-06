// Sprint-059: Fixed redirect target (was /workspace — Sprint 321 error)
// Canonical: /operations/technicians
import { redirect } from "next/navigation";
export default function Page() {
  redirect("/operations/technicians");
}
