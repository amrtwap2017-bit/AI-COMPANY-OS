// Server-side redirect — no flash
import { redirect } from "next/navigation";
export default function Page() {
  redirect("/workflow-designer");
}
