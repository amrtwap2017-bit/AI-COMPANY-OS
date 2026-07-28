// Server-side redirect — no flash, instant navigation
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/executive/command");
}
