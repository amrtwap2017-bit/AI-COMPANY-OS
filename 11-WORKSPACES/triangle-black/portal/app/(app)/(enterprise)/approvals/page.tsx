// Server-side redirect — instant, no flash, no useEffect delay
import { redirect } from "next/navigation";

export default function ApprovalsPage() {
  redirect("/workspace");
}
