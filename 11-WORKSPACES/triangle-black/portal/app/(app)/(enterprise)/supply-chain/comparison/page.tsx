// Server-side redirect — no flash, instant navigation
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/supply-chain/purchase-orders");
}
