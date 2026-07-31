// Server-side redirect — no flash
import { redirect } from "next/navigation";
export default function Page() {
  redirect("/supply-chain/procurement-dashboard");
}
