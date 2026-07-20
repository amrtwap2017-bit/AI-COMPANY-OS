// @ts-nocheck
// Triangle Black - /dashboard redirects to /workspace (enterprise dashboard)
import { redirect } from "next/navigation";

export default function DashboardRedirect() {
  redirect("/workspace");
}
