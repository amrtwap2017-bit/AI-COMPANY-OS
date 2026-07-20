// @ts-nocheck
// Triangle Black - /dashboard redirects to /workspace
// The enterprise dashboard lives at /workspace
import { redirect } from "next/navigation";

export default function DashboardRedirect() {
  redirect("/workspace");
}
